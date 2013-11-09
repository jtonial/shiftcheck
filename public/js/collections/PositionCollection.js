(function () {

  "use strict"

  Shiftcheck.classes.collections.Positions = Backbone.Collection.extend({

    url: '/positions',
        
    model: Shiftcheck.classes.models.Position,

    initialize: function () {

    },

    parse: function (response, options) {
      return response.data.positions;
    },
    comparator: function (position) {
      return position.get('order');
    },
    newOrderValue: function () {
      return _.max(this.models, function (position) { return position.get('order') }).get('order')+1;
    }

  });
  
})();
