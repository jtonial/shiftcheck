(function () {
  
  "use strict"

  Scheduleme.classes.models.Employee = Scheduleme.classes.models.BaseModel.extend({

    url: function () {
      return this.isNew() ? '/employees' : '/employees/'+this.id;
    }

  });
  
})();
