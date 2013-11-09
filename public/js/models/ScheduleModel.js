(function () {

  "use strict"

  Shiftcheck.classes.models.Schedule = Shiftcheck.classes.models.BaseModel.extend({

    url: function () {
      return this.isNew() ? '/schedules' : '/schedules/'+this.id;
    },

    initialize: function () {
      var _this = this;

      // Create Shifts subcollection if the schedule contains shifts
      //if (this.get('shifts').length) {
        this.Shifts = new Shiftcheck.classes.collections.Shifts(this.get('Shifts'));
        //this.Shifts.reset(this.get('shifts'));
      //}
    },

    validate: function (attrs, options) {
      if (!attrs.timezone) {
        return 'Timezone is required';
      } else if ( attrs.timezone < -720 || attrs.timezone > 720 || attrs.timezone % 30 != 0) {
        return 'Timezone value is invalid';
      }
    }

  });
  
})();
