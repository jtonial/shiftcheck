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

    this.addAllEmployees();
    
    return $(this.el);
  },
  addAllEmployees: function () {
    var _this = this;

    _.each(this.collection.models, function (model) {
      _this.addOneEmployee(model);
    });
  },
  addOneEmployee: function (model) {
    var view = new Scheduleme.classes.views.EmployeeView({ model: model });

    this.$('tbody').append(view.render().el);
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