(function () {

  "use strict"

  Scheduleme.classes.models.Schedule = Backbone.Model.extend({

    initialize: function () {
      var _this = this;

      // Create Shifts subcollection if the schedule contains shifts
      //if (this.get('shifts').length) {
        this.Shifts = new Scheduleme.classes.collections.Shifts({});
        this.Shifts.reset(this.get('shifts'));
      //}
    }

  });
})();
