Scheduleme.classes.models.Position = Backbone.Model.extend({

  url: function () {
    return this.isNew() ? '/positions' : '/positions/'+this.id;
  }
  
});
