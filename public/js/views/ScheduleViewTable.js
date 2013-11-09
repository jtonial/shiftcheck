(function () {
  
  "use strict"

  Shiftcheck.classes.views.ScheduleView.table = Shiftcheck.classes.views.ScheduleBaseView.extend({
    
    template: Handlebars.compile($('#schedule-template-table').html())
    
  });
})();
