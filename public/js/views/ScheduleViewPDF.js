(function () {
  
  "use strict"

  Shiftcheck.classes.views.ScheduleView.pdf = Shiftcheck.classes.views.ScheduleBaseView.extend({

    template: Handlebars.compile($('#schedule-template').html())
    
  });
})();