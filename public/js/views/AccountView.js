Shiftcheck.classes.views.AccountView = Backbone.View.extend({
  el: $('#content'),

  //tagName: 'div',
  //className: 'page account',

  template: Handlebars.compile($('#account-template').html()),

  initialize: function () {
    this.viewType = 'account';
  },

  events: {
    "click #change-password-trigger" : "changePassword",
    "click #edit-email-trigger" : "emailMakeEdittable",
    "click #save-email-trigger" : "emailSaveChange",

    "click .upload-modal-trigger" : "showModal"
  },
  render: function () {
    $(this.el).html(this.template(JSON.stringify(Shiftcheck.data)));
    $('#email').val(Shiftcheck.data.email);

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