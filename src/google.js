// Import Google Maps.
import 'olgm/olgm.css';
import OLGoogleMaps from 'olgm/OLGoogleMaps';
import GoogleLayer from 'olgm/layer/Google';
import { defaults as defaultGoogleInteractions } from 'olgm/interaction';

// Enable Google layers on a map.
// Note that this assumes the Google Maps API JavaScript was loaded onto the
// page with a valid API key. See README.md.
export default function enableGoogleLayers(map) {
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
  ];

  // Build all the layers and add them to the map, under all other layers.
  const layers = map.getLayers();
  for (let i = 0; i < googleLayers.length; i += 1) {
    const layer = new GoogleLayer({
      title: googleLayers[i].title,
      type: 'base',
      combine: true,
      visible: false,
      mapTypeId: googleLayers[i].mapTypeId,
    });
    layers.insertAt(0, layer);
  }

  // Add interactions.
  const interactions = map.getInteractions();
  interactions.extend(defaultGoogleInteractions());

  // Activate Google Maps.
  const olGM = new OLGoogleMaps({ map });
  olGM.activate();
}
