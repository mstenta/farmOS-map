import Overlay from 'ol/Overlay';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import { unByKey } from 'ol/Observable';
import { measureGeometry } from '../utils/measure';

// Store measurement overlays keyed by the ID of the feature they measure.
const measures = {};

// Store measurement listeners for changes to shapes.
const measureListeners = [];

// Remember the map, drawing layer, and system of measurement.
// See attach().
let map;
let layer;
let units;

// Maintain a counter for feature IDs.
let featureId = 0;

/**
 * Get the feature ID. If no ID is set, generate one.
 * @param {ol.Feature} feature The feature.
 */
function getFeatureId(feature) {
  let id = feature.getId();
  if (!id) {
    id = `measureFeature${featureId}`;
    feature.setId(id);
    featureId += 1;
  }
  return id;
}

/**
 * Update a measurement, given a geometry.
 * @param {ol.Overlay} measure The measure overlay.
 * @param {ol.SimpleGeometry} geom The geomtery to measure (Polygon or
 * LineString).
 */
function updateMeasure(measure, geom) {
  const measurement = measureGeometry(geom, units);
  let coordinates;
  if (geom instanceof Polygon) {
    coordinates = geom.getInteriorPoint().getCoordinates();
  }
  if (geom instanceof LineString) {
    coordinates = geom.getLastCoordinate();
  }
  measure.setPosition(coordinates);
  const element = measure.getElement();
  element.innerHTML = measurement;
}

/**
 * Create a measurement overlay for a feature.
 * @param {ol.Feature} feature The feature to create a measurement for.
 */
function createMeasure(feature) {
  const id = getFeatureId(feature);
  const element = document.createElement('div');
  element.className = 'ol-tooltip ol-tooltip-measure';
  measures[id] = new Overlay({
    element,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
  });
  map.addOverlay(measures[id]);
  updateMeasure(measures[id], feature.getGeometry());
}

/**
 * Start measuring.
 * @param {ol.Feature} feature The feature being measured.
 */
export function startMeasure(feature) {

  // Get the feature ID.
  const id = getFeatureId(feature);

  // If a measurement overlay does not exist for the feature, create it.
  if (!measures[id]) {
    createMeasure(feature);
  }

  // Listen for changes to the feature, and update its measurement.
  measureListeners[id] = feature.getGeometry().on('change', e => updateMeasure(measures[id], e.target));
}

/**
 * Stop measuring.
 * @param {ol.Feature|bool} feature Optionally provide a feature which will be
 * included in the cleanup comparison code. This is used when the `drawend`
 * event fires, because the new feature is not yet added to the source layer.
 */
export function stopMeasure(feature = false) {

  // Stop listening for measurement changes.
  measureListeners.forEach(listener => unByKey(listener));

  // Remove any overlays that no longer correspond to drawn features.
  Object.keys(measures).forEach((id) => {

    // If a feature with this ID exists in the source, skip it.
    if (layer.getSource().getFeatureById(id)) {
      return;
    }

    // If a feature was passed into this function, and its ID matches, skip it.
    if (feature && feature.getId() === id) {
      return;
    }

    // Remove the overlay.
    map.removeOverlay(measures[id]);
    delete measures[id];
  });
}

export function clearMeasures() {
  Object.keys(measures).forEach((id) => {
    map.removeOverlay(measures[id]);
    delete measures[id];
  });
}

// Measure behavior.
export default {
  attach(instance, options = {}) {

    // Save the map, drawing layer, and system of measurement for later use.
    ({ map, units } = instance);
    ({ layer } = options);

    // If the drawing layer contains any features, add measurements for each.
    layer.getSource().getFeatures().forEach((feature) => {
      createMeasure(feature);
    });

    // If the instance has an Edit control, attach listeners to the map
    // interactions so that we can apply measurements to the features.
    if (instance.edit) {
      instance.edit.addInteractionListener('drawstart', (geojson, event) => {
        startMeasure(event.feature);
      });
      instance.edit.addInteractionListener('drawend', (geojson, event) => {
        stopMeasure(event.feature);
      });
      instance.edit.addInteractionListener('modifystart', (geojson, event) => {
        event.features.forEach((feature) => {
          startMeasure(feature);
        });
      });
      instance.edit.addInteractionListener('modifyend', () => {
        stopMeasure();
      });
      instance.edit.addInteractionListener('translatestart', (geojson, event) => {
        event.features.forEach((feature) => {
          startMeasure(feature);
        });
      });
      instance.edit.addInteractionListener('translateend', () => {
        stopMeasure();
      });
      instance.edit.addInteractionListener('delete', () => {
        stopMeasure();
      });
      instance.edit.addInteractionListener('disable', () => {
        stopMeasure();
      });
    }
  },
  detach() {
    clearMeasures();
  },
};
