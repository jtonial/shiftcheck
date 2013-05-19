Scheduleme.classes.models.Employee = Backbone.Model.extend({

  url: function () {
    return this.isNew() ? '/employees' : '/employees/'+this.id;
  }

});
