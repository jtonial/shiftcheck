(function () {
  
  "use strict"

  Shiftcheck.classes.views.ScheduleView.spreadsheet = Shiftcheck.classes.views.ScheduleBaseView.extend({
    
    template: Handlebars.compile($('#schedule-template-spreadsheet').html()),
    
  });
})();
