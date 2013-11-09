(function () {
  
  "use strict"

  Shiftcheck.classes.views.PositionView = Backbone.View.extend({

    tagName: 'tr',

    template: Handlebars.compile($('#position-template').html()),

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    events: {
      "click .remove-trigger" : "confirmRemove"
    },

    render: function () {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },

    confirmRemove: function () {

      var _this = this;

      bootbox.confirm('Are you sure you wish to remove this position?', function (result) {
        if (result) {
          _this.model.destroy({ 
            wait: true,
            error: function (model, jqxhr) {
              var res = jqxhr.responseText;

              res = (typeof res == 'object') ? res : JSON.parse(res);

              bootbox.alert(res.message || 'Operation failed, however the reason is unknown right now' );
            }
          });
        }
      });
    }
  });
})();
