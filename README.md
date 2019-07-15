# farmOS Map

[![Licence](https://img.shields.io/badge/Licence-GPL%203.0-blue.svg)](https://opensource.org/licenses/GPL-3.0/)
[![Release](https://img.shields.io/github/release/farmOS/farmOS-map.svg?style=flat)](https://github.com/farmOS/farmOS-map/releases)
[![Last commit](https://img.shields.io/github/last-commit/farmOS/farmOS-map.svg?style=flat)](https://github.com/farmOS/farmOS-map/commits)
[![Twitter](https://img.shields.io/twitter/follow/farmOSorg.svg?label=%40farmOSorg&style=flat)](https://twitter.com/farmOSorg)
[![Chat](https://img.shields.io/matrix/farmOS:matrix.org.svg)](https://riot.im/app/#/room/#farmOS:matrix.org)

farmOS Map is an [OpenLayers](https://openlayers.org/) map for farmOS.

For more information on farmOS, visit [farmOS.org](https://farmOS.org).

## Usage

1. Create an HTML element with an ID, eg: `<div id="farm-map"></div>`
2. Call the map creation method with the element ID: `farmOS.map.create('farm-map');`
3. (optional) Add behaviors - see below.

### Creating a Map

The simplest way to create a map is to call the `create` method with an HTML
element's ID. This will render a map with all the OpenLayers and farmOS defaults.
However, you can also call it with an options object, as its second parameter,
with a `controls` and/or `interactions` property. If a property is set to
`false`, none of its corresponding default controls or interactions will be
applied to the map. If the property is assigned to an array of OpenLayers
controls or interactions, the defaults will be discarded and those controls or
interactions will be used in their place. If the property is assigned to a
callback function, that function will be called and passed the default controls
or interactions. It must return a an array of OL controls/interactions, which
will be attached to the map in the place of the defaults.

For example:

```js
// Calling .create() with just an id renders a map with the farmOS defaults.
const id = 'myMap';
farmOS.map.create(id);

// Passing an options object with interactions set to false will cancel the
// interaction defaults.
const opts1 = { interactions: false };
farmOS.map.create(id, opts1);

// An options object with an array of controls to replace the defaults.
const opts2 = {
  controls: [
    new MyControl(),
  ],
};
farmOS.map.create(id, opts2);

// An options object with a function which alters the control defaults.
const opts3 = {
  controls: (defaults) => defaults.filter(def => (
    def.constructor.name === 'Attribution'
    )).concat([
      new MyControl1(),
      new MyControl2(),
    ]),
};
farmOS.map.create(id, opts3);
```

### Tearing down a map

It may be desirable to tear down a map instance when you no longer need it so
that it can be garbage collected. To do so, you need to provide the instance's
target id, and pass it to the `destroy` method:

```js
farmOS.map.destroy('my-map');
```

### Adding layers

To add vector or tile layers to the map, you can call the `addLayer` method. It takes a layer type as its first parameter, and a configuration object as its second parameter. The configuration parameter's properties may vary depending on the type of layer being added.

```js
// Adding a Well Known Text layer
const wkt = "POLYGON ((-75.53643733263014 42.54424760416683, -75.5360350012779 42.54427527000766, -75.53589016199109 42.54412508386721, -75.53588747978209 42.54302634269183, -75.53643733263014 42.54424760416683))";
const wktOpts = {
  title: 'my-polygon', // defaults to 'wkt'
  wkt, // REQUIRED!
  color: 'orange', // defaults to 'yellow'
  visible: true, // defaults to true
};
const wktLayer = myMap.addLayer('wkt', wktOpts);

// Adding a GeoJSON layer
const geoJsonOpts = {
  title: 'geojson', // defaults to 'geojson'
  url: '/farm/areas/geojson/all', // REQUIRED!
  color: 'grey', // defaults to 'yellow'
  visible: true, // defaults to true
}
const geoJSONLayer = myMap.addLayer('geojson', geoJsonOpts);

const wmsOpts = {
  title: 'soil-survey', // defaults to 'wms'
  url: 'https://sdmdataaccess.nrcs.usda.gov/Spatial/SDM.wms', // REQUIRED!
  params: {
    LAYERS: 'MapunitPoly',
    VERSION: '1.1.1',
  },
  visible: true // defaults to true
};
const wmsLayer = myMap.addLayer('wms', wmsOpts);
```

The method returns a reference to the newly created layer for later use.

### Controlling the zoom level

There are two methods for controlling the zoom level. The first, `zoomToVectors`,
automatically zooms to the bounding box of all vector source layers. It takes no
arguments. The second, `zoomToLayer will zoom to a particular vector layer,
provided you pass a reference to that layer.

For example:

```js
// Zoom to all vector layers
myMap.zoomToVectors();

// Create a layer then zoom to that layer
const wktLayer = myMap.addWKTLayer("my-polygon", wkt, "orange", true);
myMap.zoomToLayer(wktLayer);
```

### Adding behaviors

Behaviors allow you to make modifications to a map in a modular way, by defining
JavaScript functions that will run automatically when a map is created.

For example:

```js
(function () {
  farmOS.map.behaviors.myCustomizations = {
    attach: function (instance) {

      // Get the element ID.
      var element_id = instance.target;

      // Add a GeoJSON layer to the map with an ID of 'my-map';
      if (element_id == 'my-map') {
        var opts = {
          title: 'My Layer',
          url: 'my/custom/geo.json',
          color: 'yellow',
        };
        instance.addLayer('geojson', opts);
      }
    }
  };
}());
```

### Google Maps

To add Google Maps layers to a map, perform the following steps:

1. Obtain a Google Maps JavaScript API key. For instructions, see:
   https://farmos.org/hosting/googlemaps
2. Add the following script tag to the page *before* any calls to
   `farmOS.map.create()`, and replace `<KEY>` with your API key:

```
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3&key=<KEY>"></script>
```

3. After calling `var instance = farmOS.map.create(target)`, call
   `instance.enableGoogleMaps();`.

## Development

`npm install` - Install JavaScript dependencies in `./node_modules` and create
`package-lock.json`.

`npm run dev` - Start a Webpack development server at https://localhost:8080
which will live-update as code is changed during development.

`npm run build` - Generate the final `farmOS-map.js` file for distribution,
along with an `index.html` file that loads it, inside the `build` directory.

## Maintainers

 * Michael Stenta (m.stenta) - https://github.com/mstenta

This project has been sponsored by:

 * [Farmier](https://farmier.com)
 * [Globetrotter Foundation](http://globetrotterfoundation.org)
