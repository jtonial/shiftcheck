(function () {
  
  "use strict"

  Scheduleme.classes.views.ScheduleView = Backbone.View.extend({
    //This renders directly into the el element; no need to append
      //Replaces everything in it; and no need to postRender()
    //el: $('#sidebar-content'),

    template: Handlebars.compile($('#schedule-list-template').html()),

    initialize: function () {

      this.view = null;
      this.viewType = 'schedule';
      this.viewPane = 'main';

      console.log('Schedule View Initialized');

      //Shifts should be a proper Backbone collection so that I can bind to it's add event (as well as delete, etc)
      // TODO : Shifts should be collection; I can then reRender on any change to the collection
        //Even if I cant get d3 views to work, it would still be easier to manage
      if (this.model.get('type') == 'shifted' && Scheduleme.meta.d3) {
        if (Scheduleme.meta.debug) console.log('is shifted; will listen to Shift events and rerender');
        console.log('adding shift collection listener');
        // Using 'all' was triggering FAR to often
         // I wonder if I can do something like:
         // this.listenTo(this.model.Shifts, ['change', 'all', 'destroy', 'reset'], this.redrawSubview);
        this.listenTo(this.model.Shifts, 'change', this.redrawSubview);
        this.listenTo(this.model.Shifts, 'add', this.redrawSubview);
        this.listenTo(this.model.Shifts, 'destroy', this.redrawSubview);
        this.listenTo(this.model.Shifts, 'reset', this.redrawSubview);
      }

      this.render();
    },

    redrawSubview: function () {
      // This seems to be called multiple times (multiple listeners)
      console.log('the shift collection was modified... redrawing');
      //this.view.reRender();
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
      } else if (schedule.get('url')) {
        this.view = new Scheduleme.classes.views.ScheduleView.pdf ({ model: this.model });
      } else { //Defaults to daily schedule
        requiresPostRender = true;
        this.view = new Scheduleme.classes.views.ScheduleView.d3 ({ model: this.model });
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
      this.view.undelegateEvents();
      this.undelegateEvents();
    }

  });
})();
