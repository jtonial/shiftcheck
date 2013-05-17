Scheduleme.classes.collections.Positions = Backbone.Collection.extend({

  url: '/positions',
      
  model: Scheduleme.classes.models.Position,

  parse: function (response, options) {
    return response.data.positions;
  }

});
