(function () {
  
  "use strict"

  Scheduleme.classes.views.UploadScheduleModalView = Backbone.View.extend({
    //This renders directly into the el element; no need to append
      //Replaces everything in it; and no need to postRender()
    el: $('#upload-modal'),

    initialize: function () {
      console.log('initializing Upload Schedule Modal');
      this.render();
    },

    events: {
      "click #new-empty-schedule-button" : "newEmptySchedule"
    },
    postRender: function () {
      $('#upload-schedule-date').datepicker({
        showOtherMonths : true,
        format          : 'yyyy-mm-dd',
        startDate       : "+0D",
        autoclose       : true
      });
    },
    render: function () {
      //$(this.el).html();
      this.postRender();
      return $(this.el);
    },

    newEmptySchedule: function (event) {

      event.preventDefault();

      var date = $('#upload-schedule-date').val();
      var dateObj = new Date(date);
      dateObj = Scheduleme.helpers.UTCify(dateObj);

      var payload = {
        date: dateObj.toString(), // this should be validated as valid
        timezone: dateObj.getTimezoneOffset(),
        shifts: []
      }

      //var schedule = new Scheduleme.classes.models.Schedule();

      Scheduleme.Schedules.create({
        date      : dateObj.toString(), // this should be validated as valid
        timezone  : dateObj.getTimezoneOffset()
      }, {
        wait: true
      })

    }
  });
})();
