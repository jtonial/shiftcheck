(function () {

  "use strict"

  Shiftcheck.classes.views.EmployeesView = Backbone.View.extend({
  
    el: $('#schedule-pane'),

    template: Handlebars.compile($('#employees-template').html()),

    //Create the frame
    initialize: function () {
      this.viewType = 'employees';
      this.viewPane = 'main';

      // Re-rendering all models on add to maintain order
      this.listenTo(this.collection, 'add', this.addAllModels);
      this.listenTo(this.collection, 'reset', this.addAllModels);

      this.render();
    },
    events: {
      "submit #add-employee-form" : "addEmployeeHandler"
    },
    render: function () {
      //$(this.el).html(this.template(this.collection.toJSON()));
      $(this.el).html(this.template());

      this.addAllModels();
      
      return $(this.el);
    },
    addAllModels: function () {
      var _this = this;

      //Clear the current HTML
      this.$('tbody').html('');
      
      _.each(this.collection.models, function (model) {
        _this.addOneModel(model);
      });
    },
    addOneModel: function (model) {
      var view = new Shiftcheck.classes.views.EmployeeView({ model: model });

      this.$('tbody').append(view.render().el);
    },
    _remove: function () {
      //Remove all subviews
      this.remove();
    },
    _undelegateEvents: function () {
      //Undelegate from all subviews
      this.undelegateEvents();
    },

    addEmployeeHandler: function (event) {
      event.preventDefault();

      var form = $('#add-employee-form');

      // This should totally be done by adding to the Shiftcheck.Employees collection...
      Shiftcheck.Employees.create({
        first_name: form.find("input[name='first_name']").val(),
        last_name : form.find("input[name='last_name']").val(),
        email     : form.find("input[name='email']").val(),
        username  : form.find("input[name='username']").val(),
        password  : form.find("input[name='password']").val()
      }, { 
        wait: true,
        beforeSend: function (request) {
          $('#add-employee-submit').attr('disabled', true);
        },
        success: function (res) {
          form.find("input[type=text], input[type=password], textarea").val("");
          form.find("input[name='first_name']").focus();
        },
        complete: function () {
          $('#add-employee-submit').removeAttr('disabled');
        }
      });
    }
  });
})();
