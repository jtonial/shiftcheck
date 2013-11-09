(function () {

  "use strict"

  Shiftcheck.classes.models.Shift = Shiftcheck.classes.models.BaseModel.extend({

    url: function () {
      return '/schedules/'+this.get('schedule_id')+'/shifts'+ (this.isNew() ? '' : '/'+this.id );
    },
    
    initialize: function () {  
      //console.log('adding shift: '+this.toJSON());
    },

    // I should switch this to use backbone-validation (and find out how to bind it to the creation form)
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
