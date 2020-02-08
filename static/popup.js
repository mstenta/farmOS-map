/* eslint-disable */
(function () {
  farmOS.map.behaviors.popup = {
    attach: function (instance) {
      var popup = instance.addPopup(function (event) {

        var content = '';
        var feature = instance.map.forEachFeatureAtPixel(event.pixel, function(feature, layer) { return feature; });
        if (feature) {

          var name = feature.get('name') || '';
          var description = feature.get('description') || '';
          var measurement = instance.measureGeometry(feature.getGeometry());
          if (measurement) {
            description = '<small>Calculated area: ' + measurement + '</small><br />' + description;
          }
          if (name != '' || description != '') {
            content = '<div class="ol-popup-content"><div class="ol-popup-name">' + name + '</div><div class="ol-popup-description">' + description + '</div></div>';
          }
        }
        return content;
      });

      // Test farmOS-map.popup trigger.
      popup.on('farmOS-map.popup', function (event) {
        console.log('Event: farmOS-map.popup');
      });
    },
  };
}());
