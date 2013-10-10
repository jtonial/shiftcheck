(function () {

  "use strict"

  Scheduleme.classes.collections.Schedules = Backbone.Collection.extend({
  
    url: '/schedules',

    model: Scheduleme.classes.models.Schedule,

    parse: function (response, options) {
      return response.data.schedules;
    },
    comparator: function (schedule) {
      return (new Date(schedule.get('date'))).getTime();
    }
  });

})();
