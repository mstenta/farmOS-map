// Import Edit control.
import Edit from '../control/Edit/Edit';

// Import replaceToEPSG4326().
import replaceToEPSG4326 from '../projection/replaceToEPSG4326';


// Edit control behavior.
export default {
  attach(instance, { layer } = {}) {

    /**
     * Replace the OpenLayers core toEPSG4326() function.
     * @see https://github.com/farmOS/farmOS-map/issues/49
     */
    replaceToEPSG4326();

    // Create a drawing layer.
    const opts = {
      title: 'Drawing',
      group: 'Editable layers',
      color: 'orange',
    };
    const drawingLayer = layer || instance.addLayer('vector', opts);

    // Get the units from instance options.
    const units = (instance.options.units === 'us') ? 'us' : 'metric';

    // Create the Edit control and add it to the map.
    // Make it available at instance.edit.
    /* eslint-disable-next-line no-param-reassign */
    instance.edit = new Edit({ layer: drawingLayer, units });
    instance.map.addControl(instance.edit);
  },
  detach(instance) {

    // Remove the drawing layer.
    instance.map.removeLayer(instance.edit.layer);

    // Remove the Edit control from the map and instance.edit.
    instance.map.removeControl(instance.edit);
    /* eslint-disable-next-line no-param-reassign */
    instance.edit = null;
  },
};
