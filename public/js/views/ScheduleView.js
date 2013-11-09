(function () {
  
  "use strict"

  Shiftcheck.classes.views.ScheduleView = Backbone.View.extend({
    //This renders directly into the el element; no need to append
      //Replaces everything in it; and no need to postRender()
    //el: $('#sidebar-content'),

    template: Handlebars.compile($('#schedule-list-template').html()),

    initialize: function () {

      this.view = null;
      this.viewType = 'schedule';
      this.viewPane = 'main';

      this.listenTo(this.model.Shifts, 'change',  this.redrawSubview);

      this.listenTo(this.model.Shifts, 'add',     this.redrawSubview);
      this.listenTo(this.model.Shifts, 'destroy', this.redrawSubview);
      this.listenTo(this.model.Shifts, 'reset',   this.redrawSubview);

      // Namespace the resize to the specific schedule model
      $(window).bind("resize.app"+this.model.id, _.bind(this.redrawSubview, this));


      this.render();
    },

    redrawSubview: function (e) {
      this.view.redraw();
    },

    render: function () {

      var requiresPostRender = false;

      var schedule = this.model;

      if ( typeof schedule.get('g_spreadsheet_key') != 'undefined' && schedule.get('g_spreadsheet_key') ) {
        this.view = new Shiftcheck.classes.views.ScheduleView.spreadsheet ({ model: this.model });
      } else if ( typeof schedule.get('json') != 'undefined' && schedule.get('json') ) {
        this.view = new Shiftcheck.classes.views.ScheduleView.table ({ model: this.model });
      } else if (schedule.get('type') == 'shifted' && Shiftcheck.meta.d3) {
        requiresPostRender = true;
        this.view = new Shiftcheck.classes.views.ScheduleView.d3 ({ model: this.model });
      } else if (schedule.get('url')) {
        this.view = new Shiftcheck.classes.views.ScheduleView.pdf ({ model: this.model });
      } else { //Defaults to daily schedule
        requiresPostRender = true;
        this.view = new Shiftcheck.classes.views.ScheduleView.d3 ({ model: this.model });
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
