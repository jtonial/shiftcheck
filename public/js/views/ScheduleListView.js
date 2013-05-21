(function () {
  
  "use strict"

  //NOTE: This is wrapped in a function (used as an object) to enabled multiple uploads
  function uploadObject () {

    //This is so that I can access the object from within the XMLHTTPRequest event functions
    var that = this;

    this.setCallback = function (cb) {
      that.cb = cb;
      console.log('cb set as: '+cb);
    },

    this.uploadFile = function(obj) {
      // I should put something here to check for duplicates (same date in same session) 
       // Server-side should prevent multiple schedules on same day, however checking here will inprove UX
      console.log('trying to cors...');
      //Switch this to jQuery
      var file = document.getElementById('file').files[0];
      var fd = new FormData();

      fd.append('key', obj.key);
      fd.append('acl', obj.acl); 
      fd.append('Content-Type', 'application/pdf');
      fd.append('AWSAccessKeyId', obj.s3Key);
      fd.append('policy', obj.s3PolicyBase64)
      fd.append('signature', obj.s3Signature);

      fd.append("file",file);

      var xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", this.uploadProgress, false);
      xhr.addEventListener("load", this.uploadComplete, false);
      xhr.addEventListener("error", this.uploadFailed, false);
      xhr.addEventListener("abort", this.uploadCanceled, false);

      // Display loading icon

      xhr.open('POST', 'https://schedule-me.s3.amazonaws.com/', true); //MUST BE LAST LINE BEFORE YOU SEND 

      xhr.send(fd);
    },

    this.uploadProgress = function(evt) {
      if (evt.lengthComputable) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        console.log('percentComplete: '+percentComplete);
        //document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
      } else {
        //document.getElementById('progressNumber').innerHTML = 'unable to compute';
      }
    },
    this.uploadComplete = function(evt) {

      console.log('Upload complete! Id: ' + that.id );

      $.ajax({
        url     : '/verifyUpload',
        type     : 'POST',
        data     : 'x='+that.id,
        success   : function (res) {
          //Fetch the new schedule and add it
          console.log('Upload verified! Id: '+that.id);
          Scheduleme.ScheduleListView.loadByDate(that.date);
        },
        error     : function (res) {
          console.log('Upload could not be verified. Id: '+that.id);
        },
        complete  : function (res) {
          that.cb();
        }
      });
    },
    this.uploadFailed = function(evt) {
      alert("There was an error attempting to upload the file." + evt);
      that.cb();
    },
    this.uploadCanceled = function (evt) {
      alert("The upload has been canceled by the user or the browser dropped the connection.");
      that.cb();
    },

    this.requestCredentials = function () {

      var date = new Date($('#upload-schedule-date').val());
      date = Scheduleme.helpers.UTCify(date);
      console.log('Date: '+date.toISOString());
      //var data = 'date='+date+'&type='+$('#upload-schedule-type').val()+'&timezone='+date.getTimezoneOffset();

      var data = {
        date: date,
        type: $('#upload-schedule-type').val(),
        timezone: date.getTimezoneOffset()
      }

      console.log('Data: '+data);

      var that = this;
      that.date = $('#upload-schedule-date').val();

      $.ajax({
        url: '/client-upload',
        type: 'POST',
        data: JSON.stringify(data),
        beforeSend: function (request) {
          request.setRequestHeader("Content-Type", 'application/json');
        },
        success: function (res) {
          console.log('received success');
          //that.processResponse(res);
          that.id = res.id;
          that.uploadFile(res);
        },
        error: function(jqxhr) {
          var res = JSON.parse(jqxhr.responseText);
          alert('Upload failed for the following reason: '+res.message || 'unknown');
          console.log('received an error: '+res);
          that.cb();
        }
      });
    }
  };

  Scheduleme.classes.views.ScheduleListView = Backbone.View.extend({
    //This renders directly into the el element; no need to append
      //Replaces everything in it; and no need to postRender()
    el: $('#schedules-list'),

    template: Handlebars.compile($('#schedule-list-template').html()),

    // FIXME : For some reason this view seems to be getting initialized twice, and is therefore listening for events twice
      // This may explain the odd 'undefined' schedule id problem that occurs sometimes

    initialize: function () {

      console.log('ScheduleListView - initialized');

      //Callback incase I forget to pass reference to collection
      this.collection = typeof this.collection != 'undefined' ? this.collection : Scheduleme.Schedules;

      this.collection.bind('add',this.addOneSchedule, this);

      this.render();
    },

    events: {
      "change #sched-date"          : "loadByDate",

      "click .fetch-date-trigger"   : "activateLoadDatepicker",

      "click .schedule-link"        : "navToSchedule"
    },
    /**
     *
     * A function used to navigate with the Router to the clicked schedule
     *
     */
    navToSchedule: function (e) {

      console.log($(e.target));

      var id = $(e.target).attr('data-id');

      //Reset click states on links
      //$('.schedule-tab').removeClass('active');
      //$('#sidebar-content li').removeClass('active');
      //Manually set the clicked to active
      //$(e.target).parent().addClass('active');

      console.log('Navigating to schedule/'+id);
      Scheduleme.Router.navigate('schedule/'+id, { trigger: true });
    },
    render: function () {
      //The JSON passed in does nothing right now, but may in the future
      $(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
      this.postRender();

      return $(this.el);
    },
    postRender: function () {

      console.log('ScheduleListView - post render');

      $('#sched-date').datepicker({
        showOtherMonths : true,
        format          : 'yyyy-mm-dd',
        endDate         : "+0D",
        autoclose       : true
      });

      //Should turn on scrolling, however has a problem that I havn't fixed yet
      //$('.antiscroll-wrap').antiscroll();

      /*$('#test-hidden').datepicker({
        showOtherMonths: true,
        dateFormat: 'yy-mm-dd',
        maxDate: "+0D"
      });*/

      //this.addAllSchedules();
      //Select first schedule
      //$('#dates li:nth-child(2) a').click();
    },
    //Adds one schedule to the Schedules page.
    addOneSchedule: function (schedule) {
      var Days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      var Months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      var Sups = ['th','st','nd','rd','th','th','th','th','th','th'];

      var datenum=schedule.get('date');//'2012-01-01';//This will be the real date
      var d = new Date(datenum);

      d = Scheduleme.helpers.UTCify(d);

      datenum = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+(d.getDate());
      var datestring = Days[d.getDay()]+', '+Months[d.getMonth()]+' '+(d.getDate()); //This will be the date string

      // This should be done as schedule.datenum, without setting. Once it's been set, it will try to save to the server when saved
      schedule.set('datenum', datenum);
      schedule.set('datestring', datestring);

      //Hack to test D3 schedules
      //schedule.set('type', 'shifted');

      if (schedule.get('type') == 'month') {
        datestring = Months[d.getMonth()];
        schedule.set('datestring', datestring);

        schedule.set('titledatestring', datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup>')

        this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+datestring+'</a></li>');
        //var view = new Scheduleme.classes.views.ScheduleView.monthly ({model:schedule});
      } else if (schedule.get('type') == 'week') {
        var nd = Scheduleme.helpers.addDays(d, 6);
        var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
        schedule.set('ndatestring', ndatestring);

        schedule.set('titledatestring', datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup>')

        this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+(Scheduleme.meta.mobile ? '' : '<br/>')+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
        //var view = new Scheduleme.classes.views.ScheduleView.weekly ({model:schedule});
      } else if (schedule.get('type') == 'twoweek') {
        var nd = Scheduleme.helpers.addDays(d, 13);
        var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
        schedule.set('ndatestring', ndatestring);

        schedule.set('titledatestring', datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup>')

        this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+(Scheduleme.meta.mobile ? '' : '<br/>')+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
        //var view = new Scheduleme.classes.views.ScheduleView.biweekly ({model:schedule});
      } else if (schedule.get('type') == 'shifted' && Scheduleme.meta.d3) {

        schedule.set('titledatestring', datestring+'<sup>'+Sups[d.getDate()%10]+'</sup>');

        this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
        //var view = new Scheduleme.classes.views.ScheduleView.d3 ({model:schedule});
      } else if (typeof schedule.get('json') != 'undefined' && schedule.get('json') != null ) {

        schedule.set('titledatestring', datestring+'<sup>'+Sups[d.getDate()%10]+'</sup>');

        this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
        //var view = new Scheduleme.classes.views.ScheduleView.table ({model:schedule});
      } else { //Defaults to daily schedule

        schedule.set('titledatestring', datestring+'<sup>'+Sups[d.getDate()%10]+'</sup>');

        this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
        //var view = new Scheduleme.classes.views.ScheduleView.daily ({model:schedule});
      }

      /*
      this.$('.tab-content').append(view.render());

      if ( schedule.get('type') == 'shifted' && Scheduleme.meta.d3 ) {
        view.postRender();
      }
      */

      //Rerender tabs
      
    },
    //Used after the view has been destroyed then created again to add back schedule views
    addAllSchedules: function () {
      var self = this;
      _.each(this.collection.models, function (schedule) {
        self.addOneSchedule(schedule);
      });
    },
    reRenderTabs: function () { //This works
      var Sups = ['th','st','nd','rd','th','th','th','th','th','th'];

      $('.schedule-tab').remove();
      _.each(this.collection.models, function(schedule) {
        var d = new Date(schedule.get('datenum'));
        //console.log('Day1: '+d);
        d = Scheduleme.helpers.fromUTC(d);
        //console.log('Day2: '+d);
        if (schedule.get('type') == 'month') {
          this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+schedule.get('datestring')+'</a></li>');
        } else if (schedule.get('type') == 'week') {
          var nd = new Date(schedule.get('ndatestring'));
          this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
          delete nd;
        } else if (schedule.get('type') == 'twoweek') {
          var nd = new Date(schedule.get('ndatestring'));
          this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
          delete nd;
        } else { //Defaults to daily schedule
          this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
        }
        delete d; //Remove the reference to D; it can not be garbage collected
      });
    },

    reRenderCollection: function () {
      //Actually I dont have to re-render the views... I only really have to re-render the tabs
      console.log('rerendering....');
      //Clear all views (remove/undelegateEvents)
      /*_.each(this.views, function (view){
        console.log('removing view');
        view.remove();
        delete view; //Clear reference
      });
      this.views = Array(); //Reset array;

      this.addAllSchedules();*/
    },
    activateLoadDatepicker: function () {
      $('#sched-date').focus();
    },
    loadByDate: function (date) {
      var _this = this;

      var dstring = $('#sched-date').val();

      if (dstring == '') { //date is only used when a new schedule has just been uploaded
        //var d = new Date(date);
        //dstring = d.getFullYear()+'-'+(Number(d.getMonth())+1)+'-'+d.getDate();
        dstring = date;
      }

      if (typeof dstring != 'undefined' && dstring != '') {
        console.log('loading by date');
        console.log('Date: '+dstring);

        $.ajax({
          url: '/schedules/'+dstring,
          type: 'get',
          success: function (response) {
            console.log('adding schedule date: '+dstring);
            Scheduleme.Schedules.add(response.data);

            _this.reRenderTabs();

            //I should actually click the new one... i'll have to figure out how to do that
              // If I can click the one with the id of the date (dstring)
              // Unfortunately the dstring always has MM month, whereas the id will not. If I remove the 0s from month/day it should work
            $('#dates.nav.nav-tabs li:nth-child(2) a').click();

          }, error: function (jqxhr) {
            alert('There doesn\'t seem to be a schedule for that date.');
          }, complete: function () {
            $('#sched-date').val('');
          }
        });
      }
    }
  });
})();