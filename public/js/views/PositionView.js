Scheduleme.classes.views.PositionView = Backbone.View.extend({

  tagName: 'tr',

  template: Handlebars.compile($('#position-template').html()),

  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  }
});