Scheduleme.classes.views.EmployeeView = Backbone.View.extend({

  tagName: 'tr',

  template: Handlebars.compile($('#employee-template').html()),

  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  }
});