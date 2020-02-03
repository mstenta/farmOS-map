// Import Google Maps.
import 'olgm/src/olgm/olgm.css';
import OLGoogleMaps from 'olgm/src/olgm/OLGoogleMaps';
import GoogleLayer from 'olgm/src/olgm/layer/Google';

// Add CSS override to fix font family/size issue described here:
// https://github.com/farmOS/farmOS-map/issues/8#issuecomment-568076505
import './google.css';

// Google Maps layers behavior.
// Note that this assumes the Google Maps API JavaScript was loaded onto the
// page with a valid API key. See README.md.
export default {
  attach(instance) {

    // Get the map from the instance.
    const { map } = instance;

    // Find the "Base layers" layer group.
    const group = instance.getLayerByName('Base layers');

    // Build all the layers and add them to the group.
    const googleLayers = [
      {
        title: 'Google Hybrid',
        mapTypeId: 'hybrid',
      },
      {
        title: 'Google Satellite',
        mapTypeId: 'satellite',
      },
      {
        title: 'Google Terrain',
        mapTypeId: 'terrain',
      },
      {
        title: 'Google Roadmap',
        mapTypeId: 'roadmap',
      },
    ].map((options) => {
      const layer = new GoogleLayer({
        title: options.title,
        type: 'base',
        visible: false,
        mapTypeId: options.mapTypeId,
      });
      group.getLayers().insertAt(0, layer);
      return layer;
    });

    // Constrain the resolution of the map view because Google Maps API does not
    // support fractional zoom levels.
    // See: https://issuetracker.google.com/issues/35828923
    map.getView().setConstrainResolution(true);

    // Do not let OLGoogleMaps manage vector, tile, or image layers. It does not
    // support all geometry types, it does not support clusters, and it renders
    // on top of image and tile layers (eg: MapKnitter).
    const watch = {
      vector: false,
      tile: false,
      image: false,
    };

    // Activate Google Maps.
    const olGM = new OLGoogleMaps({ map, watch });
    const gmap = olGM.getGoogleMapsMap();
    olGM.activate();

    // Disable 45° Imagery.
    gmap.setTilt(0);

    // Google Maps has a limitation in the way it handles maximum zoom levels.
    // If the OpenLayers map is zoomed beyond the maximum zoom level supported by
    // the Google layer (which varies by location), the OL map will zoom, but the
    // Google map will not. This can cause issues if you are viewing/drawing
    // vector shapes and using the Google layer as a guide, because it will not
    // stay in sync with the OpenLayers zoom level.
    //
    // To get around this, we listen for changes in the map resolution, and if we
    // find that the Google Maps zoom level is less than the OpenLayers zoom level
    // (indicating that it wasn't able to zoom farther), then change the map type
    // to the roadmap, which may still be incorrect but at least it is less
    // distracting than satellite/terrain.
    //
    // For reference:
    //   - https://www.drupal.org/project/farm_map/issues/2680273
    //   - https://github.com/mapgears/ol3-google-maps/issues/216#issuecomment-571177483
    let mapTypeId;
    googleLayers.forEach((layer) => {
      layer.on('change:visible', (e) => {
        if (e.target.getVisible() && e.target.get('mapTypeId')) {
          mapTypeId = e.target.get('mapTypeId');
        }
      });
    });
    map.getView().on('change:resolution', () => {
      const zoom = map.getView().getZoom();
      gmap.setZoom(zoom);
      if (gmap.getZoom() < zoom) {
        gmap.setMapTypeId('roadmap');
      } else {
        gmap.setMapTypeId(mapTypeId);
      }
    });
  },
  detach(instance) {
    /**
     * @todo
     */
  },
};
