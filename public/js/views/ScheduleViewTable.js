(function () {
  
  "use strict"

  Scheduleme.classes.views.ScheduleView.table = Scheduleme.classes.views.ScheduleBaseView.extend({
    
    template: Handlebars.compile($('#schedule-template-table').html())
    
  });
})();
