(function () {
  
  "use strict"

  window.Scheduleme = window.Scheduleme || {
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

    meta: {
      debug: 1,
      state: 'employee',
      ADMIN: 0,
      mobile: false,
      d3: true
    }
  };

  window.log = function (s) {
    if (Scheduleme.meta.debug) console.log(s);
  };
  Scheduleme.helpers.addMinutes = function(date, adding) {
    return new Date(date.getTime() + minutes*60000);
  };
  Scheduleme.helpers.UTCify = function (date) {
    return new Date(date.getTime() + date.getTimezoneOffset()*60000);
  };
  Scheduleme.helpers.fromUTC = function (date) {
    return new Date(date.getTime() - date.getTimezoneOffset()*60000);
  };
  Scheduleme.helpers.addDays = function(date, adding) {
    var nd = new Date(date);

    nd.setDate(date.getDate() + adding);
    return nd;
  };


  //------------------PAYLOAD----------------------------

  Scheduleme.Init = function () {


    $('body').attr('data-state', Scheduleme.meta.state).addClass(Scheduleme.meta.state);


    Scheduleme.Schedules = new Scheduleme.classes.collections.Schedules();

    //Router takes care of this
    Scheduleme.AccountView = new Scheduleme.classes.views.AccountView();
    Scheduleme.ScheduleListView = new Scheduleme.classes.views.ScheduleListView({ collection: Scheduleme.Schedules });

    //AJAX Setup
    $.ajaxSetup({
      dataType: 'json' //AJAX responses will all be treated as json dispite content-type
    });

    $(document).ajaxStart ( function () {
      //console.log('Showing AJAX icon');
      $('#ajax-indicator').show();
    });
    $(document).ajaxStop ( function () {
      //console.log('Hiding AJAX icon');
      $('#ajax-indicator').hide();
    });

    //This is here because I currently do not have a global view. If I do, it will be there
    $('#logout-trigger').click( function () {
      window.location.href = '/logout';
    })
    $('#settings-trigger').click( function () {
      $('#account-modal').modal('show');
    })

    //#toggle-sidebar-trigger
    $('#sidebar.closed #sidebar-header').click( function () {
      console.log('toggling sidebar state');
      var newState = $('#sidebar').hasClass('closed') ? 'open' : 'closed';
      $('#sidebar').removeClass('open closed').addClass(newState);
    });

    Scheduleme.Employees = new Scheduleme.classes.collections.Employees();
    Scheduleme.Positions = new Scheduleme.classes.collections.Positions();

    Scheduleme.Employees.fetch();
    Scheduleme.Positions.fetch();
    Scheduleme.Schedules.fetch({
      success: function () {

        Scheduleme.ScheduleListView.reRenderTabs();
        $('#schedule-pane').addClass('select-schedule');
      }, error: function () {
        //Remove loading div
        $('#schedule-pane').removeClass('loading').addClass('loading-error');

        log('An error occured');
        //alert('We seem to be having some technical difficulties');
      }, complete: function () {

        $('#schedule-pane').removeClass('loading');

        // This is initialized in the callback so that routes for existing schedules will be matched (and not say that the shift doesnt exist)
        Scheduleme.Router = new AppRouter;

        Backbone.history.start({
          pushState: true,
          root: '/'
        });
        //configPushState();

      }
    });
  };

  $(document).ready(function () {
    log('ready');

    //Hack because $(document).ready seems to be firing twice
    if (!Scheduleme.initialized) {
      Scheduleme.initialized = 1;

      Scheduleme.Init();
    }
  });

  function openSidebar () {
    if ($(window).width() <= 800) {
      $('#sidebar').removeClass('open closed').addClass('open');
      $('#sidebar-slide-handle').removeClass('open closed').addClass('open');
    }
  }
  function closeSidebar () {
    if ($(window).width() <= 800) {
      $('#sidebar').removeClass('open closed').addClass('closed');
      $('#sidebar-slide-handle').removeClass('open closed').addClass('closed');
    }
  }
  
})();
