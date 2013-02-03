$(function() {

	window.Scheduleme = {//new Object();
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
	};

	Scheduleme.helpers.addMinutes = function(date, adding) {
		return new Date(date.getTime() + minutes*60000);
	};
	Scheduleme.helpers.UTCify = function (date) {
		return new Date(date.getTime() + date.getTimezoneOffset()*60000);
	};
	Scheduleme.helpers.fromUTC = function (date) {
		return new Date(date.getTime() + date.getTimezoneOffset()*60000);
	};
	Scheduleme.helpers.addDays = function(date, adding) {
		var nd = new Date();
		nd.setDate(date.getDate() + adding);
		return nd;
	};

	Scheduleme.classes.models.Employee = Backbone.Model.extend({
		
	});

	Scheduleme.classes.collections.Employees = Backbone.Collection.extend({
			
		model: Scheduleme.classes.models.Employee,

	});

	Scheduleme.classes.views.EmployeeView = Backbone.View.extend({

		tagName: 'div',
		template: _.template($('#employee-template').html()),
		render: function () {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		}
	});

	Scheduleme.classes.models.Shift = Backbone.Model.extend({

		initialize: function () {	
			console.log('adding shift: '+this.toJSON());
		}
	});
	Scheduleme.classes.collections.Shifts = Backbone.Collection.extend({

		parse: function (data) {
			return data.data;
		}
	});

	Scheduleme.classes.models.Schedule = Backbone.Model.extend({
		//url: '/api/schedules?date='+this.get('date')+'&sessionOverride=1',
		model: Scheduleme.classes.models.Shift,

		initialize: function () {
		}

	});

	Scheduleme.classes.collections.Schedules = Backbone.Collection.extend({
		url: 'api/schedules',
		model: Scheduleme.classes.models.Schedule,

		parse: function (data) {
			return data.data;
		},
		comparator: function (schedule) {
			return Date.parse(schedule.get('date'));
		}
	});

	Scheduleme.classes.views.ScheduleView.daily = Backbone.View.extend({

		template: Handlebars.compile($('#schedule-template').html()),
		
		className: 'tab-pane',

		//Create the frame
		initialize: function () {
		},

		//Add in views for each shift in the schedule
		render: function () {
			$(this.el).attr('id',this.model.get('datenum'));
			$(this.el).html(this.template(this.model.toJSON()));
			return $(this.el);
		}
	});
	Scheduleme.classes.views.ScheduleView.weekly = Backbone.View.extend({
		
		template: Handlebars.compile($('#schedule-template').html()),
		
		className: 'tab-pane',

		//Create the frame
		initialize: function () {

		},
		render: function () {
			$(this.el).attr('id',this.model.get('datenum'));
			$(this.el).html(this.template(this.model.toJSON()));
			return $(this.el);
		}
	});
	Scheduleme.classes.views.ScheduleView.biweekly = Backbone.View.extend({
		
		template: Handlebars.compile($('#schedule-template').html()),
		
		className: 'tab-pane',

		//Create the frame
		initialize: function () {

		},
		render: function () {
			$(this.el).attr('id',this.model.get('datenum'));
			$(this.el).html(this.template(this.model.toJSON()));
			return $(this.el);
		}
	});
	Scheduleme.classes.views.ScheduleView.monthly = Backbone.View.extend({
		
		template: Handlebars.compile($('#schedule-template').html()),
		
		className: 'tab-pane',

		//Create the frame
		initialize: function () {

		},

		//Add in views for each shift in the schedule
		render: function () {
			$(this.el).attr('id',this.model.get('datenum'));
			$(this.el).html(this.template(this.model.toJSON()));
			return $(this.el);
		}
	});

	Scheduleme.classes.views.SchedulesView = Backbone.View.extend({
		//This renders directly into the el element; no need to append
			//Replaces everything in it; and no need to postRender()
		el: $('#content'),


		template: Handlebars.compile($('#schedules-template').html()),

		initialize: function () {
			this.viewType = 'schedules';
			//Callback incase I forget to pass reference to collection
			this.collection = typeof this.collection != 'undefined' ? this.collection : Scheduleme.Schedules;

			this.collection.bind('add',this.addOneSchedule, this);
		},

		events: {
			"change #sched-date" : "loadByDate",
			"click .upload-modal-trigger" : "openUploadModel",

			"click #upload_submit" : "createUploadObject"
		},
		render: function () {
			//The JSON passed in does nothing right now, but may in the future
			$(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
			this.postRender();

			return $(this.el);
		},
		postRender: function () {
			$('#sched-date').datepicker({
				showOtherMonths: true,
				dateFormat: 'yy-mm-dd',
				maxDate: "+0D"
			});
			$('#upload-schedule-date').datepicker({
				showOtherMonths: true,
				dateFormat: 'yy-mm-dd',
				minDate: "+0D"
			});

			this.addAllSchedules();
			//Select first schedule
			$('#dates.nav.nav-tabs li:nth-child(2) a').click();
		},
		//Adds one schedule to the Schedules page.
		addOneSchedule: function (schedule) {
			console.log('adding schedule');
			var Days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			var Months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			var Sups = ['th','st','nd','rd','th','th','th','th','th','th'];

			var datenum=schedule.get('date');//'2012-01-01';//This will be the real date
			var d = new Date(datenum);

			d = Scheduleme.helpers.UTCify(d);

			datenum = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+(d.getDate());
			var datestring = Days[d.getDay()]+', '+Months[d.getMonth()]+' '+(d.getDate()); //This will be the date string
			schedule.set('datenum', datenum);
			schedule.set('datestring', datestring);

			console.log('Schedule type: '+schedule.get('type'));
			if (schedule.get('type') == 'month') {
				datestring = Months[d.getMonth()];
				schedule.set('datestring', datestring);
				this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#'+datenum+'" data-toggle="tab">'+datestring+'</a></li>');
				var view = new Scheduleme.classes.views.ScheduleView.monthly ({model:schedule});
			} else if (schedule.get('type') == 'week') {
				var nd = Scheduleme.helpers.addDays(d, 7);
				var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
				schedule.set('ndatestring', ndatestring);
				this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#'+datenum+'" data-toggle="tab">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
				var view = new Scheduleme.classes.views.ScheduleView.weekly ({model:schedule});
			} else if (schedule.get('type') == 'twoweek') {
				var nd = Scheduleme.helpers.addDays(d, 14);
				var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
				schedule.set('ndatestring', ndatestring);
				this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#'+datenum+'" data-toggle="tab">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
				var view = new Scheduleme.classes.views.ScheduleView.biweekly ({model:schedule});
			} else { //Defaults to daily schedule
				this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#'+datenum+'" data-toggle="tab">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
				var view = new Scheduleme.classes.views.ScheduleView.daily ({model:schedule});
			}

			this.$('.tab-content').append(view.render());
			//this.$('.tab-content').append('<div class="tab-pane" id="'+datenum+'"></div>');

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
					this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#'+schedule.get('datenum')+'" data-toggle="tab">'+schedule.get('datestring')+'</a></li>');
				} else if (schedule.get('type') == 'week') {
					var nd = new Date(schedule.get('ndatestring'));
					this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#'+schedule.get('datenum')+'" data-toggle="tab">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
					delete nd;
				} else if (schedule.get('type') == 'twoweek') {
					var nd = new Date(schedule.get('ndatestring'));
					this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#'+schedule.get('datenum')+'" data-toggle="tab">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
					delete nd;
				} else { //Defaults to daily schedule
					this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#'+schedule.get('datenum')+'" data-toggle="tab">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
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
		loadByDate: function (date) {
			var dstring = $('#sched-date').val();

			if (dstring == '') { //date is only used when a new schedule has just been uploaded
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

						Scheduleme.CurrentView.reRenderTabs();

						//I should actually click the new one... i'll have to figure out how to do that
						  // If I can click the one with the id of the date (dstring)
						  // Unfortunately the dstring always has MM month, whereas the id will not. If I remove the 0s from month/day it should work
						$('#dates.nav.nav-tabs li:nth-child(2) a').click();

					}, error: function (xhr) {
						console.log('DENIED!!');
					}, complete: function () {
						$('#sched-date').val('');
					}
				});
			}
		},
		openUploadModel: function () {
			$('#upload-modal').modal('show');
		},

		createUploadObject: function ( event ) {

			event.preventDefault();
			$('.modal-footer button').attr('disabled', true);
			$('#ajax-loader').removeClass('hidden');
			//This works (delegating the task to the helper object)
			obj = new uploadObject();
			obj.setCallback(function () {
				$('.modal-footer button').attr('disabled', false);
				$('#ajax-loader').addClass('hidden');
			});
			obj.requestCredentials();
		}
	});

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
				url 	  : '/verifyUpload',
				type 	  : 'POST',
				data 	  : 'x='+that.id,
				success   : function (res) {
					//Fetch the new schedule and add it
					console.log('Upload verified! Id: '+that.id);
					Scheduleme.SchedulesView.loadByDate(that.date);
				},
				error 	  : function (res) {
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
			var data = 'date='+date+'&type='+$('#upload-schedule-type').val();
			console.log('Data: '+data);

			var that = this;
			that.date = $('#upload-schedule-date').val();

			$.ajax({
				url: "/upload",
				type: 'POST',
				data: data,
				success: function (res) {
					console.log('received success');
					//that.processResponse(res);
					that.id = res.id;
					that.uploadFile(res);
				},
				error: function(res, status, error) {
					console.log('received an error');
				}
			});
		}

	};

	Scheduleme.classes.views.AccountView = Backbone.View.extend({
		el: $('#content'),

		//tagName: 'div',
		//className: 'page account',

		template: Handlebars.compile($('#account-template').html()),

		initialize: function () {
			this.viewType = 'account';
			console.log('Initializing AccountView');
		},

		events: {
			"click #change-password-trigger" : "changePassword",
			"click #edit-email-trigger" : "emailMakeEdittable",
			"click #save-email-trigger" : "emailSaveChange",

			"click .upload-modal-trigger" : "showModal"
		},
		render: function () {
			$(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
			$('#email').val(Scheduleme.data.email);

			$('#sched-date').datepicker({
				showOtherMonths: true,
				dateFormat: 'yy-mm-dd',
				maxDate: "+0D"
			});
			$('#upload-schedule-date').datepicker({
				showOtherMonths: true,
				dateFormat: 'yy-mm-dd',
				minDate: "+0D"
			});

			return $(this.el);
		},
		changePassword: function () {
			console.log('trying to changing password...');
			function validatePasswords () {
				var newpass = $('#newpassword').val();
				var newpass1 = $('#newpassword1').val();
				if (newpass.length < 6) {
					return 3;
				}
				if (newpass != newpass1) {
					return 2;
				}
				return 1;
			}

			console.log('validating password change...');

			var validate = validatePasswords();
			if (validate == 1) {
				if ( $('#oldpassword').val() != $('#newpassword').val() ) {
					console.log('Inputs valid.');
					$.ajax({url: '/me/changePassword',
						type: 'POST',
						data: 'oldpassword='+$('#oldpassword').val()+'&newpassword='+$('#newpassword').val(),
						success: function (response) {
							alert ('Password successfully changed!');
							//Clear fields
							$('#oldpassword').val('');
							$('#newpassword').val('');
							$('#newpassword1').val('');
						}, error: function () {
							alert ('Password change failed.');
						}
					});
					console.log('after request...');
				} else {
					console.log('The new password cannot match the old password');
				}
			} else if (validate == 2) {
				console.log('The new password entries must match.');
			} else if (validate == 3) {
				console.log('Your new password must be at last 6 characters long');
			}
		},
		emailMakeEdittable: function () {
			$('#email').removeAttr('disabled');
			$('#save-email-trigger').show();
			$('#edit-email-trigger').hide();
		},
		emailSaveChange: function () {
			function validateEmail(email) {
				var re = /^(([^<>()[\\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return re.test(email);
			}
			console.log('new email: '+$('#email').val());
			if (validateEmail($('#email').val())) {
				console.log('email valid. changing email');
				$('#email').attr('disabled','');
				$('#edit-email-trigger').show();
				$('#save-email-trigger').hide();
			} else {
				console.log('the entered email is not valid');
			}
		},
		showModal: function () {
			$('#upload-modal').modal('show');
		}
	});

	//-------------------------------ROUTER------------------------------------
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
		//	if (this.currentMain != url ) {
				return _gaq.push(['_trackPageview',"/employer/" + url]);
		//	}
		},
		routes: {
			'account':'account',

			'':'schedules'
		},

		switchView: function (view) {
			if (typeof Scheduleme.CurrentView.viewType !='undefined') {
				Scheduleme.CurrentView.undelegateEvents();
			}
			Scheduleme.CurrentView = view;
			Scheduleme.CurrentView.delegateEvents();
			Scheduleme.CurrentView.render();
		},

		schedules: function () {
			/*$('.link, .page').removeClass('active');
			$('.schedules').addClass('active');*/
			console.log('Opening SchedulesView')
			this.switchView(Scheduleme.SchedulesView);
		},
		account: function () {
			console.log('Opening AccountView');
			this.switchView(Scheduleme.AccountView);
		}
	});
//------------------PAYLOAD----------------------------

	Scheduleme.Init = function () {
		Scheduleme.Schedules = new Scheduleme.classes.collections.Schedules();

		//Router takes care of this
		Scheduleme.SchedulesView = new Scheduleme.classes.views.SchedulesView({collection: Scheduleme.Schedules});
		Scheduleme.AccountView = new Scheduleme.classes.views.AccountView();

		Scheduleme.Router = new AppRouter;
		//Note: I'm not using pushState right now because I dont want to have to deal with making the server-side be
			//able to handle it.
		Backbone.history.start({
			//pushState: true,
			//root: '/'
		});
		//configPushState();

		//AJAX Setup
		$.ajaxSetup({
			dataType: 'json' //AJAX responses will all be treated as json dispite content-type
		});
		//Add global $.ajaxError handlers

		$.ajax({
			url: '/bootstrap',
			success: function (res) {
				//Removing loading div
				$.each(res.schedules, function () {
					Scheduleme.Schedules.add(this);
				});
				//I should only have to do this once, as any other schedule add (if even possible) will be in order (I hope)
				//Other option is to reRenderTabs() at the end of addOneSchedule
				if (Scheduleme.CurrentView.viewType == 'schedules') {
					Scheduleme.CurrentView.reRenderTabs();
					$('#dates.nav.nav-tabs li:nth-child(2) a').click();
				}

				//Add data into global object
				Scheduleme.data.email = res.data.email;
				if (Scheduleme.CurrentView.viewType !='undefined') {
					$('#email').val(Scheduleme.data.email);
				}
				Scheduleme.data.name = res.data.name;
				Scheduleme.data.username = res.data.username;
			}, error: function () {
				//Remove loading div
				console.log('An error occured');
				alert('We seem to be having some technical difficulties');
			}
		});
	};

	$(document).ready(function () {
		Scheduleme.Init();
	});

});
