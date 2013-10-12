(function () {

  "use strict"

  Scheduleme.classes.collections.Shifts = Backbone.Collection.extend({
    
    url: function () {
      if (!this.schedule_id) {
        console.log('Shift Collection has no schedule id');
        return '/shifts';
      } 
      return '/schedules/'+this.schedule_id+'/shifts';
    },

    model: Scheduleme.classes.models.Shift,

    parse: function (data) {
      return data.data;
    }
  });
  
})();
