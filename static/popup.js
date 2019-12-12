/* eslint-disable */
(function () {
  farmOS.map.behaviors.popup = {
    attach: function (instance) {
      var popup = instance.addPopup(function (event) {

        var content = '';
        var feature = instance.map.forEachFeatureAtPixel(event.pixel, function(feature, layer) { return feature; });
        if (feature) {

          // If the feature is a cluster, then create a list of names and add it
          // to the overall feature's description. Wrap it in a container with
          // a max-height and overflow: scroll so it doesn't get too big.
          var features = feature.get('features');
          if (features !== undefined) {
            var names = [];
            features.forEach(function (item) {
              if (item.get('name') !== undefined) {
                names.push(item.get('name'));
              }
            });
            if (names.length != 0) {
              feature.set('description', '<ul><li>' + names.join('</li><li>') + '</li></ul>');
            }
            feature.set('name', names.length + ' item(s):');
          }

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
