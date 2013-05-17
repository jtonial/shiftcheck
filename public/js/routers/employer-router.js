window.AppRouter = Backbone.Router.extend({
  //Note: I'm currently using tabs; another approach would be to make each tab
    //it's own view, and delete/render tabs instead of hiding/showing
    //Seperate views is probably a better approach for scalability;
    // being able to undelegate events when they're not needed
  init:0,

  initialize: function() {
    return this.bind('all', this._trackPageview);
  },
  _trackPageview: function() {
    var url;
    url = Backbone.history.getFragment();
    //alert('tracking...: '+url);
  //  if (this.currentMain != url ) {
      return _gaq.push(['_trackPageview',"/employer/" + url]);
  //  }
  },
  routes: {
    //'account':'account',
    'schedule/:id'  : 'schedule',
    'position-list' : 'positions',
    'request-list'  : 'requests',
    ''              : 'schedules'
  },

  schedule: function (id) {
    var model = Scheduleme.Schedules.get(id);

    if (model) {
      // Set the title
      if (Scheduleme.meta.debug) console.log(model.get('datestring'));
      $('#content-view-title').html(model.get('titledatestring'));
      // Create and render view
      $('[data-id]').parent().removeClass('active');
      $('[data-id="'+id+'"]').parent().addClass('active');
      //console.log('current view');
      //console.log(Scheduleme.CurrentView);
      if (Scheduleme.CurrentView.viewType == 'schedule') Scheduleme.CurrentView._undelegateEvents();

      Scheduleme.CurrentView = new Scheduleme.classes.views.ScheduleView({ model: model });
    } else {
      console.log('ID passed does not seem to match a schedule');
    }
  },
  schedules: function () {
    /*$('.link, .page').removeClass('active');
    $('.schedules').addClass('active');*/

    // Remove .active from all schedule links

    // Remove any schedule views and display a 'Select A Schedule' default view

    console.log('not doing anything right now');
    //console.log('Opening SchedulesView')
  },
  account: function () {
    //console.log('Opening AccountView');
    //$('#account-modal').modal('show');
  },
  positions: function () {
    console.log('POSITIONS');
  },
  requests: function () {
    console.log('REQUESTS');
  }
});