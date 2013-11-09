(function () {
  
  "use strict"

  Shiftcheck.classes.models.Employee = Shiftcheck.classes.models.BaseModel.extend({

    url: function () {
      return this.isNew() ? '/employees' : '/employees/'+this.id;
    }

  });
  
})();
