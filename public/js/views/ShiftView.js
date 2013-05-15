Scheduleme.classes.views.ShiftView = Backbone.View.extend({
  
  el: $('#edit-area'),
  
  template: $('#shift-template'),
  
  //Create the frame
  initialize: function () {
    this.render();
  },
  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return $(this.el);
  }
});