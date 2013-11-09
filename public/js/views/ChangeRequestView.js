Shiftcheck.classes.views.ChangeRequestView = Backbone.View.extend({

  tagName: 'tr',

  template: Handlebars.compile($('#change-request-template').html()),

  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  }
});