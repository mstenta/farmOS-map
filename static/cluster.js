/* eslint-disable */
(function () {
  farmOS.map.behaviors.cluster = {
    attach: function (instance) {
      var opts = {
        title: 'Animal Cluster',
        group: 'Clusters',
        url: 'http://localhost/farm/assets/geojson/centroid/animal',
      };
      var layer = instance.addLayer('cluster', opts);
    },
  };
}());
