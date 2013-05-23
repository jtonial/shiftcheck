(function () {
  
  "use strict"

  Scheduleme.classes.views.PositionsView = Backbone.View.extend({
    
    el: $('#schedule-pane'),

    template: Handlebars.compile($('#positions-template').html()),

    //Create the frame
    initialize: function () {
      this.viewType = 'positions';
      this.viewPane = 'main';

      // Re-rendering all models on add to maintain order
      this.listenTo(this.collection, 'add', this.addAllModels);
      this.listenTo(this.collection, 'reset', this.addAllModels);

      this.render();
    },
    events: {
      "submit #add-position-form" : "addPositionHandler"
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
    },

    addPositionHandler: function (event) {
      event.preventDefault();

      var form = $('#add-position-form');

      // This should totally be done by adding to the Scheduleme.Employees collection...
      Scheduleme.Positions.create({
        position    : form.find("input[name='position']").val(),
        full_name   : form.find("input[name='full_name']").val(),
        description : form.find("textarea[name='description']").val(),
        order_val   : Scheduleme.Positions.newOrderValue()
      }, { 
        wait: true,
        beforeSend: function (request) {
          $('#add-position-submit').attr('disabled', true);
        },
        success: function (res) {
          form.find("input[type=text], input[type=password], textarea").val("");
          form.find("input[name='full_name']").focus();
        },
        complete: function () {
          $('#add-position-submit').removeAttr('disabled');
        }
      });
    }

  });
})();
