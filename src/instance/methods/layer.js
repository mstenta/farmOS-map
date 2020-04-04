// Import source types, layer types, and formats.
import VectorSource from 'ol/source/Vector';
// import Cluster from 'ol/source/Cluster';
// import TileArcGISRest from 'ol/source/TileArcGISRest';
// import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';

// Import setWithCredentials function.
import { setWithCredentials } from 'ol/featureloader';

// Import styles.
import styles, { clusterStyle } from '../../styles';

// Import the default projection configuration
import projection from '../../projection';

// Set withCredentials to true for all XHR requests made via OpenLayers'
// feature loader. Typically farmOS requires authentication in order to
// retrieve data from its GeoJSON endpoints. Setting withCredentials to true
// is a requirement for authentication credentials to be included in the
// request that OpenLayers makes.
setWithCredentials(true);

// Add a Vector layer to the map.
function addVectorLayer({
  title = 'vector', color = 'orange', visible = true,
}) {
  const style = styles(color);
  const source = new VectorSource();
  const layer = new VectorLayer({
    title,
    source,
    style,
    visible,
  });
  return layer;
}

// // Add a cluster layer to the map.
// function addClusterLayer({
//   title = 'cluster', url, visible = true,
// }) {
//   const format = new GeoJSON();
//   const centroidSource = new VectorSource({
//     url,
//     format,
//   });
//   const clusterSource = new Cluster({
//     distance: 50,
//     source: centroidSource,
//   });
//   const clusterLayer = new VectorLayer({
//     title,
//     source: clusterSource,
//     style: clusterStyle,
//     visible,
//   });
//   return clusterLayer;
// }

// Add a GeoJSON feature layer to the map.
function addGeoJSONLayer({
  title = 'geojson', url, color = 'orange', visible = true,
}) {
  const style = styles(color);
  const format = new GeoJSON();
  const source = new VectorSource({ url, format });
  const layer = new VectorLayer({
    title,
    source,
    style,
    visible,
  });
  return layer;
}

// // Add a Tile ArcGIS MapServer layer to the map.
// function addTileArcGISMapServerLayer({
//   title = 'arcgis-tile', url, params, visible = true, base = false,
// }) {
//   const source = new TileArcGISRest({
//     url,
//     params,
//   });
//   const layer = new TileLayer({
//     title,
//     source,
//     visible,
//     type: base ? 'base' : 'normal',
//   });
//   return layer;
// }

// Add Well Known Text (WKT) geometry to the map.
function addWKTLayer({
  title = 'wkt', wkt, color = 'orange', visible = true,
}) {
  const style = styles(color);
  const isMultipart = wkt.includes('MULTIPOINT')
    || wkt.includes('MULTILINESTRING')
    || wkt.includes('MULTIPOLYGON')
    || wkt.includes('GEOMETRYCOLLECTION');
  const features = isMultipart
    ? new WKT({ splitCollection: true }).readFeatures(wkt, projection)
    : [new WKT().readFeature(wkt, projection)];
  const source = new VectorSource({ features });
  const layer = new VectorLayer({
    title,
    source,
    style,
    visible,
  });
  return layer;
}

// // Add a WMS tile layer to the map.
// function addWMSTileLayer({
//   title = 'wms', url, params, visible = true, base = false,
// }) {
//   const source = new TileWMS({
//     url,
//     params,
//   });
//   const layer = new TileLayer({
//     title,
//     source,
//     visible,
//     type: base ? 'base' : 'normal',
//   });
//   return layer;
// }

// Add an XYZ tile layer to the map.
function addXYZTileLayer({
  title = 'xyz', url, visible = true, base = false,
}) {
  const source = new XYZ({ url });
  const layer = new TileLayer({
    title,
    source,
    visible,
    type: base ? 'base' : 'normal',
  });
  return layer;
}

// Get a layer by name, recursing into layer groups.
export function getLayerByName(name, optlayers = null) {
  const layers = optlayers || this.map.getLayers().getArray();
  for (let i = 0; i < layers.length; i += 1) {
    if (layers[i].getLayers) {
      const childLayerName = getLayerByName(name, layers[i].getLayers().getArray());
      if (childLayerName) {
        return childLayerName;
      }
    }
    if (layers[i].get('title') === name) {
      return layers[i];
    }
  }
  return false;
}

// Add a layer to the map by its type.
export default function addLayer(type, opts = {}) {
  let layer;
  if (type.toLowerCase() === 'vector') {
    layer = addVectorLayer(opts);
  }
  // if (type.toLowerCase() === 'cluster') {
  //   if (!opts.url) {
  //     throw new Error('Missing a Cluster GeoJSON url.');
  //   }
  //   layer = addClusterLayer(opts);
  // }
  if (type.toLowerCase() === 'geojson') {
    if (!opts.url) {
      throw new Error('Missing a GeoJSON url.');
    }
    layer = addGeoJSONLayer(opts);
  }
  // if (type.toLowerCase() === 'arcgis-tile') {
  //   if (!opts.url) {
  //     throw new Error('Missing a ArcGIS MapServer url.');
  //   }
  //   layer = addTileArcGISMapServerLayer(opts);
  // }
  if (type.toLowerCase() === 'wkt') {
    if (!opts.wkt) {
      throw new Error('Missing a WKT string.');
    }
    layer = addWKTLayer(opts);
  }
  // if (type.toLowerCase() === 'wms') {
  //   if (!opts.url) {
  //     throw new Error('Missing a WMS url.');
  //   }
  //   layer = addWMSTileLayer(opts);
  // }
  if (type.toLowerCase() === 'xyz') {
    if (!opts.url) {
      throw new Error('Missing an XYZ url.');
    }
    layer = addXYZTileLayer(opts);
  }

  // If a layer was created, add it to the map.
  if (layer) {

    // If a layer group is specified, create it if it doesn't already exist.
    if (opts.group) {
      let group;
      group = this.getLayerByName(opts.group);
      if (!group) {
        group = new LayerGroup({ title: opts.group });
        this.map.addLayer(group);
      }

      // Add the layer to the group.
      group.getLayers().push(layer);
    }

    // Otherwise, add the layer directly to the map.
    else {
      this.map.addLayer(layer);
    }

    // Dispatch an event.
    this.map.dispatchEvent('farmOS-map.layer', layer);

    // Return the layer.
    return layer;
  }
  throw new Error('Invalid layer type.');
}
