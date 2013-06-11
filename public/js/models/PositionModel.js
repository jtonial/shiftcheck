(function () {

  "use strict"
  
  Scheduleme.classes.models.Position = Scheduleme.classes.models.BaseModel.extend({

    url: function () {
      return this.isNew() ? '/positions' : '/positions/'+this.id;
    }
    
  });
  
})();
