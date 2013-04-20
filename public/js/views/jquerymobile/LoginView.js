Scheduleme.classes.views.LoginView = Backbone.View.extend({
  tagName: 'div',

  template: Handlebars.compile($('#login-template').html()),

  events: {
    'submit #login-form' : 'handleLogin'
  },
  handleLogin: function (e) {
    console.log('test');
    e.preventDefault(); //Prevent default submission
    $.ajax({
      url: '/login',
      type: 'POST',
      data: $('#login-form').serialize(),
      success: function (response) {
        console.log('successful login');  
        Scheduleme.helpers.fetchBootstrap();
      }, error: function (response) {
        alert('Username and password do not match. Please try again');
      }
    });  
  },
  render: function () {
    //$(this.el).attr('id',this.model.get('datenum'));
    $(this.el).html(this.template());
    return $(this.el);
  }
});