(function () {

  "use strict"
  
  Shiftcheck.classes.collections.Employees = Backbone.Collection.extend({

    url: '/employees',
        
    model: Shiftcheck.classes.models.Employee,

    // How do I want to sort this... or should I provide multiple options? Mhmm... decisions decisions
    comparator: function (model) {
      return model.get('last_name');
    },

    parse: function (response, options) {
      return response.data.employees;
    }

  });
  
})();
