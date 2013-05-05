Scheduleme.classes.views.SchedulesViewItemView = Backbone.View.extend({
  
  tagName: 'td',

  template: Handlebars.compile($('#schedules-template').html()),

  events: {

  },
  //Create the frame
  initialize: function () {

  },
  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return $(this.el);
  }
});

Scheduleme.classes.views.SchedulesView = Backbone.View.extend({
  
  el: $('#schedule-pane'),

  template: Handlebars.compile($('#schedule-template').html()),

  //Create the frame
  initialize: function () {
    this.render();
  },
  render: function () {
    $(this.el).html(this.template(this.collection.toJSON()));
    return $(this.el);
  }
});