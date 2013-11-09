(function () {

  "use strict"

  window.Shiftcheck = window.Shiftcheck || {
    classes: {
      models: {},
      collections: {},
      views: {
        ScheduleView: {},
      },
    },
    helpers: {},

    data: {},

    Schedules: {},

    initialized: 0,

    Init: function () {},

    CurrentView: {},
    Router: {},

    User: {},

    meta: {
      debug: 1,
      state: 'employee',
      ADMIN: 0,
      mobile: true,
      d3: true
    }
  };

  window.isPhonegap = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

  Shiftcheck.meta.url = window.isPhonegap ? 'http://staging-shift-check.herokuapp.com' : '';


  //$(function() {

    Shiftcheck.helpers.addMinutes = function(date, adding) {
      return new Date(date.getTime() + minutes*60000);
    };
    Shiftcheck.helpers.UTCify = function (date) {
      return new Date(date.getTime() + date.getTimezoneOffset()*60000);
    };
    Shiftcheck.helpers.fromUTC = function (date) {
      return new Date(date.getTime() + date.getTimezoneOffset()*60000);
    };
    Shiftcheck.helpers.addDays = function(date, adding) {
      var nd = new Date();
      nd.setDate(date.getDate() + adding);
      return nd;
    };
    Shiftcheck.helpers.switchView = function (view, postRender) {
      if (typeof Shiftcheck.CurrentView.viewType !='undefined') {
        Shiftcheck.CurrentView.undelegateEvents();
      }
      Shiftcheck.CurrentView = view;
      Shiftcheck.CurrentView.delegateEvents();
      Shiftcheck.CurrentView.render();

      if (postRender) {
        Shiftcheck.CurrentView.postRender();
      }
    };
    Shiftcheck.helpers.titleDate = function(datenum, datestring) {
      var t = new Date();
      var today = t.getFullYear()+'-'+(t.getMonth()+1)+'-'+(t.getDate()+1);
      var output = '';
      if (datenum == today) {
        return 'Today';
      } else {
        return datestring;
      }
    }
    /*Shiftcheck.helpers.viewSchedule = function (id) {
      console.log(typeof Shiftcheck.Schedules.get(id).get('csv') != 'undefined');
      if (Shiftcheck.meta.d3 && Shiftcheck.Schedules.get(id).get('type') == 'shifted') {
        var view = new Shiftcheck.classes.views.ScheduleView.d3({model: Shiftcheck.Schedules.get(id)});
      } else if (typeof Shiftcheck.Schedules.get(id).get('csv') != 'undefined') {
        console.log('here');
        var view = new Shiftcheck.classes.views.ScheduleView.table({model: Shiftcheck.Schedules.get(id)});
      } else {
        var view = new Shiftcheck.classes.views.ScheduleView.gview({model: Shiftcheck.Schedules.get(id)});
      }
      //Note this needs a back button
      Shiftcheck.helpers.switchView(view);
    };*/
    Shiftcheck.helpers.fetchBootstrap = function () {
      $.ajax({
        url: Shiftcheck.meta.url+'/bootstrap',
        success: function (res) {

          window.Shiftcheck.User = {
            loggedIn : true
          }

          // Switch the active page to list view
          //window.location.hash = 'schedule-page';
          $.mobile.changePage( '#list-page', {
            transition: "fade",
            reverse: false
          });
          // Shiftcheck.helpers.switchView(Shiftcheck.ScheduleListView);

          //Removing loading div
          $.each(res.data.schedules, function () {
            Shiftcheck.Schedules.add(this);
          });
          //I should only have to do this once, as any other schedule add (if even possible) will be in order (I hope)
          //Other option is to reRenderTabs() at the end of addOneSchedule

          Shiftcheck.ScheduleListView.reRenderTabs();
          Shiftcheck.ScheduleListPanelView.reRenderTabs();

          //Add data into global object
          Shiftcheck.data.email = res.data.email;
          Shiftcheck.data.name = res.data.name;
          Shiftcheck.data.username = res.data.username;

        }, error: function (xhr, status, text) {
          //Remove loading div
            //Shiftcheck.helpers.switchView(Shiftcheck.LoginView);
          $.mobile.changePage( '#login-page', {
            transition: "fade",
            reverse: false
          });

          if (xhr.status != '403') {
            console.log('An error occured: '+xhr.status);
            alert('We seem to be having some technical difficulties: '+xhr.status);
          }
        }
      });

      Shiftcheck.Positions = new Shiftcheck.classes.collections.Positions();
      Shiftcheck.Positions.fetch();

    };
    Shiftcheck.helpers.handleLogout = function () {
      //Destory session;
      $.ajax({
        url: Shiftcheck.meta.url+'/logout',
        type: 'GET',
        beforeSend: function (request) {
          request.setRequestHeader("Accept", 'application/json');
        },
        error: function () {
          console.log('wtf cannot log out');
        },
        success: function () {
          Shiftcheck.User.loggedIn = false;

          $.mobile.changePage( '#login-page', {
            transition: "fade",
            reverse: false
          });
        }
      })
    };

    //Used for global events
    Shiftcheck.classes.views.AppView = Backbone.View.extend({
      el: $('body'),

      template: Handlebars.compile($('#app-template').html()),

      events: {
        'click .back-to-list'     : 'back',
        'click .account-trigger'  : 'openAccountView',
        'click .logout-trigger'   : 'logout'
      },
      back: function () {
        Shiftcheck.Router.navigate("/", {trigger: true});
      },
      openAccountView: function () {
        Shiftcheck.Router.navigate("/account", {trigger: true});
      },
      logout: function () {
        Shiftcheck.helpers.handleLogout();
      }
    });

  //------------------PAYLOAD----------------------------

    Shiftcheck.Init = function () {

      Shiftcheck.Schedules = new Shiftcheck.classes.collections.Schedules();

      Shiftcheck.AppView = new Shiftcheck.classes.views.AppView();

      //Router takes care of this
      Shiftcheck.ScheduleListView  = new Shiftcheck.classes.views.ScheduleListView({collection: Shiftcheck.Schedules});
      Shiftcheck.ScheduleListPanelView = new Shiftcheck.classes.views.ScheduleListPanelView({collection: Shiftcheck.Schedules});
      Shiftcheck.AccountView = new Shiftcheck.classes.views.AccountView();
      Shiftcheck.LoginView = new Shiftcheck.classes.views.LoginView();
      //AJAX Setup
      $.ajaxSetup({
        dataType: 'json' //AJAX responses will all be treated as json dispite content-type
      });
      //Add global $.ajaxError handlers
    
      //Note that the router is started in fetchBotstrap()
      Shiftcheck.helpers.fetchBootstrap();

      Handlebars.registerHelper('outputDate', Shiftcheck.helpers.titleDate);

      $.mobile.defaultPageTransition = 'slide';

      new FastClick(document.body);

    };

    $(document).ready(function () {
      Shiftcheck.Init();

      $('#login-form').submit(function (e) {
        e.preventDefault();

        $.ajax({
          url: Shiftcheck.meta.url+'/login',
          type: 'POST',
          data: $(this).serialize(),
          success: function (response) {
            //Set loading screen
            Shiftcheck.helpers.fetchBootstrap();
          }, error: function (response) {
            alert('Username and password do not match. Please try again');
          }
        });
        return false;
      })

      $('.logout_trigger').click( function () {
        Shiftcheck.helpers.handleLogout();
      })
    });

  //});

  $( document ).on( "pageshow", "#login-page", function() {
    console.log("login-page ready");
    if (Shiftcheck.User.loggedIn) {
      $.mobile.changePage( '#list-page', {
        transition: "fade",
        reverse: false
      });
    }
  });


  $( document ).on( "pageinit", "#schedule-page", function() {
    console.log("schedule-page ready");

    Shiftcheck.ScheduleListPanelView.reRenderTabs();

      $( document ).on( "swipeleft swiperight", "#schedule-page", function( e ) {
          // We check if there is no open panel on the page because otherwise
          // a swipe to close the left panel would also open the right panel (and v.v.).
          // We do this by checking the data that the framework stores on the page element (panel: open).
      console.log('Swipe detected on schedule-page');
          if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
              if ( e.type === "swipeleft"  ) {
                  $( "#schedule-right-panel" ).panel( "open" );
              } else if ( e.type === "swiperight" ) {
                  $( "#schedule-left-panel" ).panel( "open" );
              }
          }
      });
    $( document ).on( 'click' , '.schedule-link', function () {
      var id = $(this).attr('data-id');
      console.log('try to open schedule with id '+id);
      /*if ($('#schedule'+id).length) {
        // Nav to the page
        $.mobile.changePage( '#schedule-page', {
          changeHash: true
        });
      } else {
        //createSchedulePage(id);
        $.mobile.changePage( '#schedule-page', {
          changeHash: true
        });
      }*/
      if (id) {
        createSchedulePage(id);
      }

      /*$.mobile.changePage( '#schedule-page', {
        changeHash: true
      });*/
    });
  });

  // jQuery Mobile specific stuff
  $( document ).on( "pageinit", "#list-page", function() {
    console.log("list-page ready");

    Shiftcheck.ScheduleListView.reRenderTabs();

      $( document ).on( "swipeleft swiperight", "#list-page", function( e ) {
          // We check if there is no open panel on the page because otherwise
          // a swipe to close the left panel would also open the right panel (and v.v.).
          // We do this by checking the data that the framework stores on the page element (panel: open).
      console.log('Swipe detected on list-page');
          if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
              if ( e.type === "swipeleft"  ) {
                  $( "#list-right-panel" ).panel( "open" );
              } else if ( e.type === "swiperight" ) {
                  //$( "#list-left-panel" ).panel( "open" );
              }
          }
      });
    $( document ).on( 'click' , '.schedule-link', function () {
      var id = $(this).attr('data-id');
      console.log('try to open schedule with id '+id);
      /*if ($('#schedule'+id).length) {
        // Nav to the page
        $.mobile.changePage( '#schedule-page', {
          changeHash: true
        });
      } else {
        //createSchedulePage(id);
        $.mobile.changePage( '#schedule-page', {
          changeHash: true
        });
      }*/

      if (id) {
        createSchedulePage(id);
      }

      /*$.mobile.changePage( '#schedule-page', {
        changeHash: true
      });*/
    });
  });
  $( document ).on( "pageshow", "#list-page", function() {
    console.log('List view visible');
    Shiftcheck.ScheduleListView.reRenderTabs();
  });
  function createSchedulePage(id) {
    console.log('The page doesn\'t exist yet; creating it');

    var view = new Shiftcheck.classes.views.ScheduleView({model: Shiftcheck.Schedules.get(id)});

    console.log('new view created');

    //console.log(view.render().el);

    view = view.render();
    //$('#pages').append(view.el);

    //$.mobile.initializePage();
    //$('#schedule'+id).trigger('create');

    /*if (view.requiresPostRender) {
      console.log('postRender-ing');
      view.postRender();
    }*/
  /*
    $( "#main-left-panel" ).panel();
    $( "#main-right-panel" ).panel();
  */
    /*$.mobile.changePage( '#schedule'+id, {
      changeHash: true
    });*/

    $('#schedule-page h1.page-header-text').html( Shiftcheck.Schedules.get(id).get('titledatestring') );
    //$('#schedule-page').trigger('pagecreate');

    $.mobile.changePage( '#schedule-page', {
      changeHash: true
    });
  }
})();