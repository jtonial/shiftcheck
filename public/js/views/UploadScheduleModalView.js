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

Scheduleme.classes.views.UploadScheduleModalView = Backbone.View.extend({
	//This renders directly into the el element; no need to append
		//Replaces everything in it; and no need to postRender()
	el: $('#upload-modal'),

	initialize: function () {
		console.log('initializing Upload Schedule Modal');
		this.render();
	},

	events: {
		"click #upload_submit" : "createUploadObject"
	},

	render: function () {
		$(this.el).html();
		return $(this.el);
	},
	createUploadObject: function ( event ) {
		console.log('here');
		event.preventDefault();
		/*$('.modal-footer button').attr('disabled', true);
		$('#ajax-loader').removeClass('hidden');
		//This works (delegating the task to the helper object)
		obj = new uploadObject();
		obj.setCallback(function () {
			$('.modal-footer button').attr('disabled', false);
			$('#ajax-loader').addClass('hidden');
		});
		obj.requestCredentials();*/
	}
});