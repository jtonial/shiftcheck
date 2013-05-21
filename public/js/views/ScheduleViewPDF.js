(function () {
  
  "use strict"

  Scheduleme.classes.views.ScheduleView.pdf = Scheduleme.classes.views.ScheduleBaseView.extend({

    template: Handlebars.compile($('#schedule-template').html())
    
  });
})();