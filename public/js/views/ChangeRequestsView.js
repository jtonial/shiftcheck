Shiftcheck.classes.views.ChangeRequestsView = Backbone.View.extend({
  
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
  addAllRequests: function () {
    var _this = this;

    _.each(this.collection.models, function (model) {
      _this.addOneEmployee(model);
    });
  },
  addOneRequest: function (model) {
    var view = new Shiftcheck.classes.views.ChangeRequestView({ model: model });

    this.$('tbody').append(view.render().el);
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