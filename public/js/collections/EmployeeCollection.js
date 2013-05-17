Scheduleme.classes.collections.Employees = Backbone.Collection.extend({

  url: '/employees',
      
  model: Scheduleme.classes.models.Employee,

  parse: function (response, options) {
    return response.data.employees;
  }

});
