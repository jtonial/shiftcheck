(function () {

  "use strict"

  Shiftcheck.classes.collections.Shifts = Backbone.Collection.extend({
    
    url: function () {
      if (!this.schedule_id) {
        console.log('Shift Collection has no schedule id');
        return '/shifts';
      } 
      return '/schedules/'+this.schedule_id+'/shifts';
    },

    model: Shiftcheck.classes.models.Shift,

    parse: function (data) {
      return data.data;
    }
  });
  
})();
