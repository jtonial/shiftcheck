//$(function() { //This can be added back in when I use require.js, or soemthing to manage the includes

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

		meta: {
			state: 'admin',
			mobile: false,
			d3: true
		}
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
		var nd = new Date();
		nd.setDate(date.getDate() + adding);
		return nd;
	};

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
				if (!res.data.schedules.length) {
					$('#schedule-content').html('You current have no schedules in the system');
				}
				$.each(res.data.schedules, function () {
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

//});