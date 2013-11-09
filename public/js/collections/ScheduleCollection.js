(function () {

  "use strict"

  Shiftcheck.classes.collections.Schedules = Backbone.Collection.extend({
  
    url: '/schedules',

    model: Shiftcheck.classes.models.Schedule,

    parse: function (response, options) {
      return response.data.schedules;
    },
    comparator: function (schedule) {
      return (new Date(schedule.get('date'))).getTime();
    }
  });

})();
