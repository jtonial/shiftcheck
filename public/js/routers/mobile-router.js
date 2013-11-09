(function () {
  
  "use strict"

  window.AppRouter = Backbone.Router.extend({
    init:0,
    currentMain:'dashboard',
    currentModal:'account',

    initialize: function() {
    //  return this.bind('all', this._trackPageview);
    },
    /*_trackPageview: function() {
      var url;
      url = Backbone.history.getFragment();

      return _gaq.push(['_trackPageview',"/" + url]);

    },*/
    routes: {
      '':'listView',

      'account':'account',

      'viewSchedule/:id':'viewSchedule'
    },

    listView: function() {
      console.log('listView');
      Shiftcheck.helpers.switchView(Shiftcheck.ScheduleListView);
      $('#mobile-nav-left-space').hide();
    },
    account: function () {
      console.log('accountView')
    },
    viewSchedule: function(id) {
      var postrender = false;
      if (Shiftcheck.meta.d3 && Shiftcheck.Schedules.get(id).get('type') == 'shifted') {
        postrender = true;
      }

      var view = new Shiftcheck.classes.views.ScheduleView({model: Shiftcheck.Schedules.get(id)});
      
      //Note this needs a back button
      $('.header-text').html(Shiftcheck.helpers.titleDate(
        Shiftcheck.Schedules.get(id).get('datenum'),
        Shiftcheck.Schedules.get(id).get('datestring')));

      $('#mobile-nav-left-space').show();

      Shiftcheck.helpers.switchView(view, postrender);
    }
  });
})();
