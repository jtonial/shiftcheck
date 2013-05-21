(function () {

  "use strict"

  Scheduleme.classes.collections.Shifts = Backbone.Collection.extend({
    
    url: '/shifts',

    model: Scheduleme.classes.models.Shift,

    parse: function (data) {
      return data.data;
    }
  });
})();
