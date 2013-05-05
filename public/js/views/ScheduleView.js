Scheduleme.classes.views.ScheduleView = Backbone.View.extend({
  //This renders directly into the el element; no need to append
    //Replaces everything in it; and no need to postRender()
  el: $('#sidebar-content'),

  template: Handlebars.compile($('#schedule-list-template').html()),

  initialize: function () {

    this.view = null;

    console.log('Schedule View Initialized');

    //Shifts should be a proper Backbone collection so that I can bind to it's add event (as well as delete, etc)
    // TODO : Shifts should be collection; I can then reRender on any change to the collection
      //Even if I cant get d3 views to work, it would still be easier to manage
    if (this.model.get('type') == 'shifted' && Scheduleme.meta.d3) {
      if (Scheduleme.meta.debug) console.log('is shifted; will listen to Shift events and rerender');
      this.listenTo(this.model.Shifts, 'all', this.reRenderSubview);
    }

    this.render();
  },

  reRenderSubview: function () {
    console.log('the shift collection was modified... reRendering');
    this.view.reRender();
  },

  render: function () {

    var requiresPostRender = false;

    var schedule = this.model;

    if ( typeof schedule.get('g_spreadsheet_key') != 'undefined' && schedule.get('g_spreadsheet_key') ) {
      this.view = new Scheduleme.classes.views.ScheduleView.spreadsheet ({ model: this.model });
    } else if ( typeof schedule.get('json') != 'undefined' && schedule.get('json') ) {
      this.iew = new Scheduleme.classes.views.ScheduleView.table ({ model: this.model });
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
    
  }

});