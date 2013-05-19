Scheduleme.classes.models.Shift = Backbone.Model.extend({

  url: function () {
    return this.isNew() ? '/shifts' : '/shifts/'+this.id;
  },
  
  initialize: function () {  
    //console.log('adding shift: '+this.toJSON());
  }
});