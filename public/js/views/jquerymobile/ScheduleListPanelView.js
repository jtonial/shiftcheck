
// INCOMPLETE

Scheduleme.classes.views.ScheduleListPanelView = Backbone.View.extend({
  //This renders directly into the el element; no need to append
    //Replaces everything in it; and no need to postRender()
  el: $('#schedule-page'),

  initialize: function () {

    console.log('initialized');

    //Callback incase I forget to pass reference to collection
    this.collection = typeof this.collection != 'undefined' ? this.collection : Scheduleme.Schedules;

    this.collection.bind('add',this.addOneSchedule, this);

    this.render();
  },

  events: {

  },

  render: function () {
    //The JSON passed in does nothing right now, but may in the future
    //$(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
    return $(this.el);
  },

  //Adds one schedule to the Schedules page.
  addOneSchedule: function (schedule) {
    console.log('add one schedule '+schedule.get('type'));
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

      var htmlText = '<li class="schedule-link" data-icon="arrow-r" data-id="'+schedule.id+'"><a href="#", data-rel="schedule-trigger">'+datestring+'</a></li>';
      //var view = new Scheduleme.classes.views.ScheduleView.monthly ({model:schedule});
    } else if (schedule.get('type') == 'week') {
      var nd = Scheduleme.helpers.addDays(d, 6);
      var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
      schedule.set('ndatestring', ndatestring);

      schedule.set('titledatestring', datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup>')

      var htmlText = '<li class="schedule-link" data-icon="arrow-r" data-id="'+schedule.id+'"><a href="#", data-rel="schedule-trigger">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+(Scheduleme.meta.mobile ? '' : '<br/>')+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>';
      //var view = new Scheduleme.classes.views.ScheduleView.weekly ({model:schedule});
    } else if (schedule.get('type') == 'twoweek') {
      var nd = Scheduleme.helpers.addDays(d, 13);
      var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
      schedule.set('ndatestring', ndatestring);

      schedule.set('titledatestring', datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup>')

      var htmlText = '<li class="schedule-link" data-icon="arrow-r" data-id="'+schedule.id+'"><a href="#", data-rel="schedule-trigger">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+(Scheduleme.meta.mobile ? '' : '<br/>')+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>';
      //var view = new Scheduleme.classes.views.ScheduleView.biweekly ({model:schedule});
    } else if (schedule.get('type') == 'shifted' && Scheduleme.meta.d3) {

      schedule.set('titledatestring', datestring+'<sup>'+Sups[d.getDate()%10]+'</sup>');

      var htmlText = '<li class="schedule-link" data-icon="arrow-r" data-id="'+schedule.id+'"><a href="#", data-rel="schedule-trigger">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>';
      //var view = new Scheduleme.classes.views.ScheduleView.d3 ({model:schedule});
    } else if (typeof schedule.get('json') != 'undefined' && schedule.get('json') != null ) {

      schedule.set('titledatestring', datestring+'<sup>'+Sups[d.getDate()%10]+'</sup>');

      var htmlText = '<li class="schedule-link" data-icon="arrow-r" data-id="'+schedule.id+'"><a href="#", data-rel="schedule-trigger">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>';
      //var view = new Scheduleme.classes.views.ScheduleView.table ({model:schedule});
    } else { //Defaults to daily schedule

      schedule.set('titledatestring', datestring+'<sup>'+Sups[d.getDate()%10]+'</sup>');

      var htmlText = '<li class="schedule-link" data-icon="arrow-r" data-id="'+schedule.id+'"><a href="#", data-rel="schedule-trigger">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>';
      //var view = new Scheduleme.classes.views.ScheduleView.daily ({model:schedule});
    }

    this.$('#panel-list').append(htmlText);

    try {
      $('#panel-list').listview('refresh');
    } catch (e) {
      console.log(e);
    }
    
  },
  //Used after the view has been destroyed then created again to add back schedule views
  addAllSchedules: function () {
    var self = this;
    _.each(this.collection.models, function (schedule) {
      self.addOneSchedule(schedule);
    });

    try {
      $('#panel-list').listview('refresh');
    } catch (e) {
      console.log(e);
    }
  },
  reRenderTabs: function () { //This works
    var Sups = ['th','st','nd','rd','th','th','th','th','th','th'];

    $('.schedule-link').remove();
    _.each(this.collection.models, function(schedule) {

      var d = new Date(schedule.get('datenum'));
      d = Scheduleme.helpers.fromUTC(d);

      if (schedule.get('type') == 'month') {
        this.$('#panel-list').append('<li class="schedule-link" data-icon="arrow-r" data-id="'+schedule.id+'"><a href="#", data-rel="schedule-trigger">'+schedule.get('datestring')+'</a></li>');
      } else if (schedule.get('type') == 'week') {
        var nd = new Date(schedule.get('ndatestring'));
        this.$('#panel-list').append('<li class="schedule-link" data-icon="arrow-r" data-id="'+schedule.id+'"><a href="#", data-rel="schedule-trigger">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
        delete nd;
      } else if (schedule.get('type') == 'twoweek') {
        var nd = new Date(schedule.get('ndatestring'));
        this.$('#panel-list').append('<li class="schedule-link" data-icon="arrow-r" data-id="'+schedule.id+'"><a href="#", data-rel="schedule-trigger">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
        delete nd;
      } else { //Defaults to daily schedule
        this.$('#panel-list').append('<li class="schedule-link" data-icon="arrow-r" data-id="'+schedule.id+'"><a href="#", data-rel="schedule-trigger">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
      }
      delete d; //Remove the reference to D; it can not be garbage collected
    });

    try {
      $('#panel-list').listview('refresh');
    } catch (e) {
      console.log(e);
    }
  }

});