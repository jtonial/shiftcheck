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

    Init: function () {},

    CurrentView: {},
    Router: {},

    meta: {
      debug: 1,
      state: 'admin',
      ADMIN: 1,
      mobile: false,
      d3: true
    }
  };

  window.log = function (s) {
    if (Shiftcheck.meta.debug) console.log(s);
  };
  Shiftcheck.helpers.addMinutes = function(date, adding) {
    return new Date(date.getTime() + minutes*60000);
  };
  Shiftcheck.helpers.UTCify = function (date) {
    return new Date(date.getTime() + date.getTimezoneOffset()*60000);
  };
  Shiftcheck.helpers.fromUTC = function (date) {
    return new Date(date.getTime() - date.getTimezoneOffset()*60000);
  };
  Shiftcheck.helpers.addDays = function(date, adding) {
    var nd = new Date(date);

    nd.setDate(date.getDate() + adding);
    return nd;
  };


  //------------------PAYLOAD----------------------------

  Shiftcheck.Init = function () {

    $('body').attr('data-state', Shiftcheck.meta.state).addClass(Shiftcheck.meta.state);


    Shiftcheck.Schedules = new Shiftcheck.classes.collections.Schedules();

    //Router takes care of this
    Shiftcheck.AccountView = new Shiftcheck.classes.views.AccountView();
    Shiftcheck.ScheduleListView = new Shiftcheck.classes.views.ScheduleListView({ collection: Shiftcheck.Schedules });

    Shiftcheck.UploadScheduleModalView = new Shiftcheck.classes.views.UploadScheduleModalView();

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
    //Add global $.ajaxError handlers

    //This is here because I currently do not have a global view. If I do, it will be there
    $('#logout-trigger').click( function () {
      window.location.href = '/logout';
    });
    $('#settings-trigger').click( function () {
      $('#account-modal').modal('show');
    });

    //#toggle-sidebar-trigger
    $('#sidebar.closed #sidebar-header').click( function () {
      log('toggling sidebar state');
      var newState = $('#sidebar').hasClass('closed') ? 'open' : 'closed';
      $('#sidebar').removeClass('open closed').addClass(newState);
    });

    Shiftcheck.Employees = new Shiftcheck.classes.collections.Employees();
    Shiftcheck.Positions = new Shiftcheck.classes.collections.Positions();

    Shiftcheck.Employees.fetch();
    Shiftcheck.Positions.fetch();
    Shiftcheck.Schedules.fetch({
      success: function () {

        Shiftcheck.ScheduleListView.reRenderTabs();
        if (Shiftcheck.Schedules.length) {
          $('#schedule-pane').addClass('select-schedule');
        } else {
          $('#schedule-pane').addClass('no-schedules');
        }
      }, error: function () {
        //Remove loading div
        $('#schedule-pane').removeClass('loading').addClass('loading-error');

        log('An error occured');
        //alert('We seem to be having some technical difficulties');
      }, complete: function () {

        $('#schedule-pane').removeClass('loading');

        // This is initialized in the callback so that routes for existing schedules will be matched (and not say that the shift doesnt exist)
        Shiftcheck.Router = new AppRouter;

        Backbone.history.start({
          pushState: true,
          root: '/'
        });
        //configPushState();

      }
    });
    
  };

  $(document).ready(function () {

    _.once(Shiftcheck.Init());

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
