Scheduleme.classes.views.ChangeRequestsView = Backbone.View.extend({
  
  el: $('#schedule-pane'),

  template: Handlebars.compile($('#change-requests-template').html()),

  //Create the frame
  initialize: function () {
    this.viewType = 'change-requests';
    this.viewPane = 'main';

    this.render();
  },
  render: function () {
    //$(this.el).html(this.template(this.collection.toJSON()));
    $(this.el).html(this.template());
    return $(this.el);
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