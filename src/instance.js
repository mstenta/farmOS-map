// Import OpenLayers CSS and base Map and View definitions.
import 'ol/ol.css';
import { Map, View } from 'ol';

// Import source types, layer types, and formats.
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';

import { createEmpty as extentCreateEmpty, extend as extendExtend } from 'ol/extent';

// Import defaults.
import defaults from './defaults';

// Import styles.
import styles from './styles';

// Import Google Maps integration.
import enableGoogleLayers from './google';

// Define an object that represents a single farmOS map instance.
const createInstance = ({ target, options }) => {
  let instance;

  // Add a GeoJSON feature layer to the map.
  function addGeoJSONLayer({
    title = 'geojson', url, color, visible = true,
  }) {
    const style = styles(color);
    const format = new GeoJSON();
    const source = new VectorSource({
      format,
      // Supply a loader function so we can be sure xhr.withCredentials === true.
      loader(extent, resolution, featureProjection) {
        const xhr = new XMLHttpRequest();
        const onError = () => source.removeLoadedExtent(extent);
        xhr.open('GET', url);
        xhr.withCredentials = true;
        xhr.onerror = onError;
        xhr.onload = () => {
          if (xhr.status === 200) {
            const features = format.readFeatures(xhr.responseText, {
              extent,
              featureProjection,
            });
            source.addFeatures(features);
          } else {
            onError();
          }
        };
        xhr.send();
      },
    });
    const layer = new VectorLayer({
      title,
      source,
      style,
      visible,
    });
    instance.map.addLayer(layer);
    return layer;
  }

  // Add Well Known Text (WKT) geometry to the map.
  function addWKTLayer({
    title = 'wkt', wkt, color, visible = true,
  }) {
    const style = styles(color);
    const isMultipart = wkt.includes('MULTIPOINT')
      || wkt.includes('MULTILINESTRING')
      || wkt.includes('MULTIPOLYGON')
      || wkt.includes('GEOMETRYCOLLECTION');
    const opts = {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    };
    const features = isMultipart
      ? new WKT().readFeatures(wkt, opts)
      : [new WKT().readFeature(wkt, opts)];
    const source = new VectorSource({ features });
    const layer = new VectorLayer({
      title,
      source,
      style,
      visible,
    });
    instance.map.addLayer(layer);
    return layer;
  }

  // Add a WMS tile layer to the map.
  function addWMSTileLayer({
    title = 'wms', url, params, visible = true,
  }) {
    const source = new TileWMS({
      url,
      params,
    });
    const layer = new TileLayer({
      title,
      source,
      visible,
    });
    instance.map.addLayer(layer);
    return layer;
  }

  instance = {
    // The target element ID for the map.
    target,

    // The OpenLayers map object.
    map: new Map({
      target,
      layers: defaults.layers(),
      controls: defaults.controls(options.controls),
      interactions: defaults.interactions(options.interactions),
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    }),

    // Add a layer to the map by its type.
    addLayer(type, opts) {
      if (type.toLowerCase() === 'geojson') {
        if (!opts.url) {
          throw new Error('Missing a GeoJSON url.');
        }
        return addGeoJSONLayer(opts);
      }
      if (type.toLowerCase() === 'wkt') {
        if (!opts.wkt) {
          throw new Error('Missing a WKT string.');
        }
        return addWKTLayer(opts);
      }
      if (type.toLowerCase() === 'wms') {
        if (!opts.url) {
          throw new Error('Missing a WMS url.');
        }
        return addWMSTileLayer(opts);
      }
      throw new Error('Invalid layer type.');
    },

    // Zoom to all vector sources in the map.
    zoomToVectors() {
      const extent = extentCreateEmpty();
      this.map.getLayers().forEach((layer) => {
        if (typeof layer.getSource === 'function') {
          const source = layer.getSource();
          if (source !== 'null' && source instanceof VectorSource) {
            if (source.getState() === 'ready' && source.getFeatures().length > 0) {
              extendExtend(extent, source.getExtent());
              const fitOptions = {
                size: this.map.getSize(),
                constrainResolution: false,
                padding: [20, 20, 20, 20],
              };
              this.map.getView().fit(extent, fitOptions);
            }
          }
        }
      });
    },

    // Zoom to the given layer source in the map.
    zoomToLayer(layer) {
      const extent = extentCreateEmpty();
      const source = layer.getSource();
      if (source !== 'null' && source instanceof VectorSource) {
        if (source.getState() === 'ready' && source.getFeatures().length > 0) {
          extendExtend(extent, source.getExtent());
          const fitOptions = {
            size: this.map.getSize(),
            constrainResolution: false,
            padding: [20, 20, 20, 20],
          };
          this.map.getView().fit(extent, fitOptions);
        }
      }
    },
  };

  // Add Google layers, if googleLayers is true.
  if (options.googleLayers) {
    enableGoogleLayers(instance.map);
  }

  return instance;
};
export default createInstance;
