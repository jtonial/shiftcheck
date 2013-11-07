(function () {
  
  "use strict";

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
    switchMainView: function (title, newLink, newview) {
      // Set title
      $('#content-view-title').html(title);

      // Set sidebar link
      $('#sidebar-content li').removeClass('active');
      newLink.addClass('active');

      //Undelegate old view; I 'undelegate' instead of remove because remove removes the #content div, which all views try to bind to
      if (Scheduleme.CurrentView.viewPane == 'main') Scheduleme.CurrentView._undelegateEvents();

      //Set current view to new view
      Scheduleme.CurrentView = newview;
    },
    routes: {
      //'account':'account',
      'schedule/:id'  : 'schedule',
      'employee-list' : 'employees',
      'position-list' : 'positions',
      'request-list'  : 'requests',
      ''              : 'schedules'
    },

    schedule: function (id) {
      var model = Scheduleme.Schedules.get(id);

      if (model) {

        var title = model.get('titledatestring');
        var $newLink = $('[data-id="'+id+'"]').parent();
        var newView = new Scheduleme.classes.views.ScheduleView({ model: model });

        this.switchMainView(title, $newLink, newView);
      } else {
        // Make AJAX call to try to get the schedule with that id incase it is old and wasn't fetched on bootstrap
        console.log('ID passed does not seem to match a schedule');
      }
    },
    schedules: function () {
      /*$('.link, .page').removeClass('active');
      $('.schedules').addClass('active');*/

      // Remove .active from all schedule links

      // Remove any schedule views and display a 'Select A Schedule' default view

      log('not doing anything right now');
      //console.log('Opening SchedulesView')
    },
    account: function () {
      //console.log('Opening AccountView');
      //$('#account-modal').modal('show');
    },
    employees: function () {

      var title = 'Employees';
      var $newLink = $('#employees-link').parent();
      var newView = new Scheduleme.classes.views.EmployeesView({ collection: Scheduleme.Employees });;

      this.switchMainView(title, $newLink, newView);

    },
    positions: function () {

      var title = 'Positions';
      var $newLink = $('#positions-link').parent();
      var newView = new Scheduleme.classes.views.PositionsView({ collection: Scheduleme.Positions });;

      this.switchMainView(title, $newLink, newView);
    },
    requests: function () {

      var title = 'Change Requests';
      var $newLink = $('#requests-link').parent();
      var newView = new Scheduleme.classes.views.ChangeRequestsView({ collection: {} });;

      this.switchMainView(title, $newLink, newView);
    }
  });
})();
