var Main        = require(__basedir+'/helpers') ,
    _           = require('underscore')._ ,
    Backbone    = require('backbone') ,
    validation  = require('backbone-validation') ,
    db          = Main.mysql ,
    Queries     = require('./helpers/queries') ;

_.extend(Backbone.Model.prototype, validation.mixin);

var UserModel = Backbone.Model.extend({

  defaults: {

  },

  // I will start using my own validation at some point
  validation: {
    first_name  : {
      required: true
    },
    last_name   : {
      required: true
    },
    email: {
      required : true,
      pattern  : 'email',
      msg: 'Email is invalid'
    },
    username: {
      required: true
    },
    password: {
      required : true
    }
  },

  // Im thinking of defining each attribute here, as well as validation information, if its protected (allowed to be modified)
    // and whether its public (should be returned).
    // I'll have to think of a good way to prevent protected things from being changed still
    // (right now it works fine because the query only saves specific things, which isnt really scalable)
  schema: {
    password : {
      protected : true,
      public    : false
    },
    ssiKey : {
      protected : true,
      public    : false
    }
  },

  initialize: function () {

  },

  toFullJSON: function () {
    var json = this.toJSON();
    return _.extend(json, { user_id: this.id });
  },

  toPublicJSON: function () {
    var json  = this.toFullJSON();
    var _this = this;
    // This operation will almost always return the same, and should maybe just be saved as a list of things
      // that aren't public
    var toDelete = [];
    _.keys(_this.schema).forEach( function (attr) {
      if (!_this.schema[attr].public) toDelete.push(attr);
    })
    //_.filter(this.schema, function (attr) { return !attr.public; })

    toDelete.forEach( function (attr) {
      delete json[attr];
    })

    return json;
  },

  save: function (cb) {
    var errors = this.validate();

    if (!errors) {

      var _this = this;

      if (this.id) {
        // Update
        
        // Note: If I change this to only use the objects (like in the node-mysql examples) I will have to ensure that 
          // properties like last_login, reg_time, etc are not modified
        db.query(Queries.update, [ this.get('first_name'), this.get('last_name'), this.get('email'), this.get('admin'), this.id ], function (err, result) {

          cb(err, result);
          // OR
          // cb(_this);
        })
      } else {
        // Insert
        db.query(Queries.insert, [ this.get('first_name'), this.get('last_name'), this.get('employer_id'), this.get('username'), this.get('email'), this.get('password') ], function (err, result) {
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
  savePassword: function (cb) {
    db.query(Queries.changePassword, [this.get('password'), this.id], function (err, result) {

      cb(err, result);
      // OR
      // cb(_this);
    })
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
    } else if (this.get('supplier_id')) {
      db.querySingle(Queries.selectBySupplierId, [this.get('supplier_id')], function (err, row) {

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
      cb();
    }
  },

  makeAdmin: function (cb) {
    var _this = this;

    _this.set('admin', true);
    console.log('Set admin');
    _this.save( function (err, result) {
      console.log('Saved admin');
      cb(err, result);
    })
  }

});

module.exports = UserModel;
