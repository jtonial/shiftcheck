Scheduleme.classes.views.ScheduleBaseView = Backbone.View.extend({
  
  el: $('#schedule-pane'),
  
  //Create the frame
  initialize: function () {
    this.render();
  },
  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return $(this.el);
  }
});