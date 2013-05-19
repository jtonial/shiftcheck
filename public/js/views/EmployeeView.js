Scheduleme.classes.views.EmployeeView = Backbone.View.extend({

  tagName: 'tr',

  template: Handlebars.compile($('#employee-template').html()),

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.remove);
  },

  events: {
    "click .remove-trigger" : "confirmRemove"
  },

  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },

  confirmRemove: function () {
    if (confirm('Are you sure you wish to remove this employee')) {
      this.model.destroy({ wait: true });
    }
  }
});