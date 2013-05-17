Scheduleme.classes.views.EmployeesView = Backbone.View.extend({
  
  el: $('#schedule-pane'),

  template: Handlebars.compile($('#employees-template').html()),

  //Create the frame
  initialize: function () {
    this.viewType = 'employees';
    this.viewPane = 'main';

    this.render();
  },
  render: function () {
    //$(this.el).html(this.template(this.collection.toJSON()));
    $(this.el).html(this.template());
    return $(this.el);
  },
  _remove: function () {
    //Remove all subviews
    this.remove();
  },
  _undelegateEvents: function () {
    //Undelegate from all subviews
    this.undelegateEvents();
  }
});