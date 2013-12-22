var Main    = require(__basePath+'/main.js') ,
    _           = require('underscore')._ ,
    Backbone    = require('backbone') ,
    validation  = require('backbone-validation') ,
    db          = Main.mysql ,
    Queries     = require('./helpers/queries') ;

var EmployerModel = Backbone.Model.extend({

   defaults: {

  },

  // I will start using my own validation at some point
  validation: {
    name  : {
      required: true
    },
    contact_email: {
      required : true,
      pattern  : 'email',
      msg: 'Email is invalid'
    },
    contact_phone: {
      required: true
    }
  },

  save: function (cb) {
    var errors = this.validate();

    if (!errors) {

      var _this = this;

      if (this.id) {
        // Update
        
        // Note: If I change this to only use the objects (like in the node-mysql examples) I will have to ensure that 
          // properties like last_login, reg_time, etc are not modified
        db.query(Queries.update, [ this.get('name'), this.get('contact_email'), this.get('contact_phone'), this.id ], function (err, result) {

          cb(err, result);
          // OR
          // cb(_this);
        })
      } else {
        // Insert

        db.query(Queries.insert, [ this.get('name'), this.get('contact_email'), this.get('contact_phone')], function (err, result) {
          if (err) {
            cb(err);
          } else {
            _this.id = result.insertId;

            cb(err, result);
          }

        })
      }
    } else {
      this._invalid = true;
      this._validationErrors = errors;
      cb( { errors : errors }, null );
    }
  },
  fetch: function (cb) {
    var _this = this;

    if (this.id) {
      db.querySingle(Queries.selectById, [this.id], function (err, row) {

        if (err) console.log(err);

        if (row) {
          _.keys(row).forEach( function (attr) {
            _this.set(attr, row[attr]);
          })
        } else {
          _this._notExists = true;
        }

        cb(err);

      })  
    } else {
      cb({ error: 'Employer fetched with no id' });
    }
  },


});


module.exports = EmployerModel;
