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
				Scheduleme.ScheduleListView.loadByDate(that.date);
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
			error: function(res, status, error) {
				console.log('received an error');
			}
		});
	}
};

Scheduleme.classes.views.ScheduleListView = Backbone.View.extend({
	//This renders directly into the el element; no need to append
		//Replaces everything in it; and no need to postRender()
	el: $('#sidebar-content'),

	template: Handlebars.compile($('#schedule-list-template').html()),

	initialize: function () {

		console.log('initialized');

		//Callback incase I forget to pass reference to collection
		this.collection = typeof this.collection != 'undefined' ? this.collection : Scheduleme.Schedules;

		this.collection.bind('add',this.addOneSchedule, this);

		this.render();
	},

	events: {
		"change #sched-date" : "loadByDate",
		"click .upload-modal-trigger" : "openUploadModel",

		"click #upload_submit" : "createUploadObject",
		"paste #file-text" : "pasted",
		"change #file-text" : "pasted",

		"click .schedule-link" : "navToSchedule"
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
		$('.schedule-tab').removeClass('active');
		//Manually set the clicked to active
		$(e.target).parent().addClass('active');

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

		console.log('post render');

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

		//this.addAllSchedules();
		//Select first schedule
		//$('#dates li:nth-child(2) a').click();
	},
	//Adds one schedule to the Schedules page.
	addOneSchedule: function (schedule) {
		console.log('add one schedule');
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
			this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+datestring+'</a></li>');
			//var view = new Scheduleme.classes.views.ScheduleView.monthly ({model:schedule});
		} else if (schedule.get('type') == 'week') {
			var nd = Scheduleme.helpers.addDays(d, 7);
			var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
			schedule.set('ndatestring', ndatestring);
			this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+(Scheduleme.meta.mobile ? '' : '<br/>')+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
			//var view = new Scheduleme.classes.views.ScheduleView.weekly ({model:schedule});
		} else if (schedule.get('type') == 'twoweek') {
			var nd = Scheduleme.helpers.addDays(d, 14);
			var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
			schedule.set('ndatestring', ndatestring);
			this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+(Scheduleme.meta.mobile ? '' : '<br/>')+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
			//var view = new Scheduleme.classes.views.ScheduleView.biweekly ({model:schedule});
		} else if (schedule.get('type') == 'shifted' && Scheduleme.meta.d3) {
			this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
			//var view = new Scheduleme.classes.views.ScheduleView.d3 ({model:schedule});
		} else if (typeof schedule.get('json') != 'undefined' && schedule.get('json') != null ) {
			this.$('#dates #prependHere').before('<li class="schedule-tab"><a data-id="'+schedule.id+'" class="schedule-link">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
			//var view = new Scheduleme.classes.views.ScheduleView.table ({model:schedule});
		} else { //Defaults to daily schedule
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

				}, error: function (xhr) {
					console.log('DENIED!!');
				}, complete: function () {
					$('#sched-date').val('');
				}
			});
		}
	},
	openUploadModel: function () {
		console.log('here');
		$('#upload-modal').modal('show');
	},

	createUploadObject: function ( event ) {

		var _this = this;

		event.preventDefault();
		//This works (delegating the task to the helper object)
		if ($('#file').val()) {

			$('.modal-footer button').attr('disabled', true);
			$('#ajax-loader').removeClass('hidden');

			obj = new uploadObject();
			obj.setCallback(function () {
				$('.modal-footer button').attr('disabled', false);
				$('#ajax-loader').addClass('hidden');
				$('#file').val('');
				$('#upload-schedule-date').val('');
			});
			obj.requestCredentials();
		} else if ($('#file-text').val()) {
			//It's a CSV/Excel Paste
			console.log('Will be parsing the text...');

			var date = new Date($('#upload-schedule-date').val());
			date = Scheduleme.helpers.UTCify(date);
			console.log('Date: '+date.toISOString());

			var data = {
				date: date,
				type: $('#upload-schedule-type').val(),
				json: $('#file-text').val(),
				timezone: date.getTimezoneOffset()
			}

			console.log('Data: '+data);

			var dateToFetch = $('#upload-schedule-date').val();

			$.ajax({
				url: '/upload',
				type: 'POST',
				data: JSON.stringify(data),
				beforeSend: function (request) {
					$('.modal-footer button').attr('disabled', true);
					$('#ajax-loader').removeClass('hidden');

					request.setRequestHeader("Content-Type", 'application/json');
				}, success: function () {
					console.log('received success');
					$('#file-text').val('');
					$('#upload-schedule-date').val('');
					_this.loadByDate(dateToFetch);
				}, error: function () {
					console.log('received error');
				}, complete: function () {
					$('.modal-footer button').attr('disabled', false);
					$('#ajax-loader').addClass('hidden');
				}
			})
			

		} else {
			alert('No schedule information found');
		}
	},
	pasted: function () {
		var _this = $('#file-text');
		_.defer(function () {

			var st = $(_this).val();

			if (st != '') {
				var Rows = st.split("\n");
				var numrows = Rows.length; 

				console.log(Rows);
				console.log('rows: '+numrows);

				var obj = [];

				var type = 'spreadsheet'; // Or pasted
				var delimiter = (type == 'spreadsheet') ? '\t' : ',';

				Rows.forEach( function (row) {
					var Arr = row.split(delimiter);
					obj.push(Arr);
				})

				// Verify that it is valid (ie, N x N)
				var length = null;
				var valid = true;
				obj.forEach (function (subArray) {
					console.log('length: '+length);
					if (length == null) {
						length = subArray.length;
					} else if ( subArray.length != length ) {
						valid = false;
					}
				});

				if (valid) {
					console.log(obj);
					$(_this).val(JSON.stringify(obj));
				} else {
					$(_this).val('');
					_.defer(alert('The pasted data is not valid. The cells copied must be a rectangle, and merged cells are not supported at this time'));
				}
			}
		})
	}
});