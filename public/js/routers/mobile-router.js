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
    Scheduleme.helpers.switchView(Scheduleme.ScheduleListView);
    $('#mobile-nav-left-space').hide();
  },
  account: function () {
    console.log('accountView')
  },
  viewSchedule: function(id) {
    var postrender = false;
    if (Scheduleme.meta.d3 && Scheduleme.Schedules.get(id).get('type') == 'shifted') {
      postrender = true;
    }

    var view = new Scheduleme.classes.views.ScheduleView({model: Scheduleme.Schedules.get(id)});
    
    //Note this needs a back button
    $('.header-text').html(Scheduleme.helpers.titleDate(
      Scheduleme.Schedules.get(id).get('datenum'),
      Scheduleme.Schedules.get(id).get('datestring')));

    $('#mobile-nav-left-space').show();

    Scheduleme.helpers.switchView(view, postrender);
  }
});