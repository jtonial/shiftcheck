(function () {

  "use strict"

  Scheduleme.classes.models.Shift = Scheduleme.classes.models.BaseModel.extend({

    url: function () {
      return this.isNew() ? '/shifts' : '/shifts/'+this.id;
    },
    
    initialize: function () {  
      //console.log('adding shift: '+this.toJSON());
    },

    validate: function (attrs, options) {
      if (!attrs.start) {
        return 'Start time is required';
      } 
      if (!attrs.end) {
        return 'End time is required';
      }
      if ( !(attrs.end > attrs.start) ) {
        return 'Shift end must be > start';
      }
    }

  });
  
})();
