(function () {
  
  "use strict"

  Scheduleme.classes.views.PositionsView = Backbone.View.extend({
    
    el: $('#schedule-pane'),

    template: Handlebars.compile($('#positions-template').html()),

    //Create the frame
    initialize: function () {
      this.viewType = 'positions';
      this.viewPane = 'main';

      this.listenTo(this.collection, 'add', this.addOneModels);
      this.listenTo(this.collection, 'reset', this.addAllModels);

      this.render();
    },
    events: {

    },
    render: function () {
      //$(this.el).html(this.template(this.collection.toJSON()));
      $(this.el).html(this.template());

      this.addAllModels();
      
      return $(this.el);
    },
    addAllModels: function () {
      var _this = this;

      //Clear the current HTML
      this.$('tbody').html('');

      _.each(this.collection.models, function (model) {
        _this.addOneModel(model);
      });
    },
    addOneModel: function (model) {
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
})();
