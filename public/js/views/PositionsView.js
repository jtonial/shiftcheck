Scheduleme.classes.views.PositionsView = Backbone.View.extend({
  
  el: $('#schedule-pane'),

  template: Handlebars.compile($('#positions-template').html()),

  //Create the frame
  initialize: function () {
    this.viewType = 'positions';
    this.viewPane = 'main';

    this.render();
  },
  render: function () {
    //$(this.el).html(this.template(this.collection.toJSON()));
    $(this.el).html(this.template());

    this.addAllPositions();
    
    return $(this.el);
  },
  addAllPositions: function () {
    var _this = this;

    _.each(this.collection.models, function (model) {
      _this.addOnePosition(model);
    });
  },
  addOnePosition: function (model) {
    var view = new Scheduleme.classes.views.PositionView({ model: model });

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