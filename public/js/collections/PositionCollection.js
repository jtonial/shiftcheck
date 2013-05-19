Scheduleme.classes.collections.Positions = Backbone.Collection.extend({

  url: '/positions',
      
  model: Scheduleme.classes.models.Position,

  initialize: function () {

  },

  parse: function (response, options) {
    return response.data.positions;
  },
  comparator: function (position) {
    return position.get('order_val');
  },
  newOrderValue: function () {
    return _.max(this, function (position) { return position.order })+1;
  }

});
