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
        url     : '/schedules/verifyUpload',
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
        url: '/schedules/client-upload',
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

  Scheduleme.classes.views.UploadScheduleModalView = Backbone.View.extend({
    //This renders directly into the el element; no need to append
      //Replaces everything in it; and no need to postRender()
    el: $('#upload-modal'),

    initialize: function () {
      console.log('initializing Upload Schedule Modal');
      this.render();
    },

    events: {

      "click #upload_submit"        : "createUploadObject",
      "paste #file-text"            : "pasted",
      "change #file-text"           : "pasted",

      "click #new-empty-schedule-button" : "newEmptySchedule"
    },
    postRender: function () {
      $('#upload-schedule-date').datepicker({
        showOtherMonths : true,
        format          : 'yyyy-mm-dd',
        startDate       : "+0D",
        autoclose       : true
      });
    },
    render: function () {
      //$(this.el).html();
      this.postRender();
      return $(this.el);
    },
    createUploadObject: function ( event ) {

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
          url: '/schedules/upload',
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
            Scheduleme.ScheduleListView.loadByDate(dateToFetch);
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
    },
    newEmptySchedule: function (event) {

      event.preventDefault();

      var dateToFetch = $('#upload-schedule-date').val();

      var payload = {
        date: dateToFetch, // this should be validated as valid
        type: 'day',
        timezone: (new Date()).getTimezoneOffset(),
        shifts: []
      }

      $.ajax({
        url     : '/schedules/uploadshifts',
        type    : 'POST',
        data    : payload,
        success : function (res) {

          //This should not load it, it should just add it. but for now whatever. It needs to be put into proper models anyways
          Scheduleme.ScheduleListView.loadByDate(dateToFetch);
        },
        error   : function (jqxrh) {
          console.log('newEmptySchedule received Error');
        },
        complete: function () {
          console.log('newEmptySchedule call complete');
        }
      })
    }
  });
})();
