(function () {
  
  "use strict"

  Scheduleme.classes.views.ScheduleView = Backbone.View.extend({
    //This renders directly into the el element; no need to append
      //Replaces everything in it; and no need to postRender()
    el: $('#sidebar-content'),

    template: Handlebars.compile($('#schedule-list-template').html()),

    initialize: function () {

      this.view = null;

      console.log('Schedule View Initialized');
      if (this.model.get('type') == 'shifted' && Scheduleme.meta.d3) {
        if (Scheduleme.meta.debug) console.log('is shifted; will listen to Shift events and rerender');

        // Namespace the resize to the specific schedule model
        $(window).bind("resize.app"+this.model.id, _.bind(this.redrawSubview, this));

      }
      this.render();
    },

    redrawSubview: function (e) {
      this.view.redraw();
    },

    render: function () {

      var requiresPostRender = false;

      var schedule = this.model;

      if ( typeof schedule.get('g_spreadsheet_key') != 'undefined' && schedule.get('g_spreadsheet_key') ) {
        this.view = new Scheduleme.classes.views.ScheduleView.spreadsheet ({ model: this.model });
      } else if ( typeof schedule.get('json') != 'undefined' && schedule.get('json') ) {
        this.view = new Scheduleme.classes.views.ScheduleView.table ({ model: this.model });
      } else if (schedule.get('type') == 'shifted' && Scheduleme.meta.d3) {
        requiresPostRender = true;
        this.view = new Scheduleme.classes.views.ScheduleView.d3 ({ model: this.model });
      } else if (schedule.get('type') == 'month') {
        this.view = new Scheduleme.classes.views.ScheduleView.pdf ({ model: this.model });
      } else if (schedule.get('type') == 'week') {
        this.view = new Scheduleme.classes.views.ScheduleView.pdf ({ model: this.model });
      } else if (schedule.get('type') == 'twoweek') {
        this.view = new Scheduleme.classes.views.ScheduleView.pdf ({ model: this.model });
      } else { //Defaults to daily schedule
        this.view = new Scheduleme.classes.views.ScheduleView.pdf ({ model: this.model });
      }

      this.view.render();

      if (requiresPostRender) {
        this.view.postRender();
      }

      return $(this.view.el);
      
    },
    _remove: function () {

      this.view.remove();
      this.remove();
    },
    _undelegateEvents: function () {

      $(window).unbind("resize.app"+this.model.id);

      this.stopListening();

      this.view.undelegateEvents();
      this.undelegateEvents();
    }

  });
})();
