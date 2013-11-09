(function () {

  "use strict"
  
  Shiftcheck.classes.models.Position = Shiftcheck.classes.models.BaseModel.extend({

    url: function () {
      return this.isNew() ? '/positions' : '/positions/'+this.id;
    }
    
  });
  
})();
