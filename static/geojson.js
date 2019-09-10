/* eslint-disable */
(function () {
  farmOS.map.behaviors.geojson = {
    attach: function (instance) {

      var opts = {
        title: 'Fields',
        url: 'http://localhost/farm/areas/geojson/field',
        color: 'yellow',
        group: 'Areas',
      };
      var layer = instance.addLayer('geojson', opts);
      var source = layer.getSource();
      source.on('change', function () {
        instance.zoomToVectors();
      });

      var opts = {
        title: 'Animals',
        url: 'http://localhost/farm/assets/geojson/full/animal',
        color: 'red',
        group: 'Assets',
      };
      instance.addLayer('geojson', opts);

    },
  };
}());
