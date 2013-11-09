Shiftcheck.classes.views.ScheduleBaseView = Backbone.View.extend({
  
  /*tagName: 'div',
  
  //Create the frame
  initialize: function () {
    this.render();
  },
  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));

    $(this.el).attr('data-role','page');
    $(this.el).attr('id', 'schedule'+this.model.id);
    $(this.el).attr('data-theme', 'd');
    $(this.el).attr('data-title', 'Schedule '+this.model.id);

    return this.el
  }*/

  el: $('#schedule-page .schedule-content'),
  
  //Create the frame
  initialize: function () {
    this.render();
  },
  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return $(this.el);
  }
});