var when      = require('when') ,
    moment    = require('moment') ,
    _         = require('underscore') ,
    //uuid      = require('node-uuid'),
    config    = require('../config') ,
    Validator = require('validator').Validator ,
    sanitize  = require('validator').sanitize ;

module.exports = function (database) {
    database.validator = new Validator();

    // The Base Model which other Ghost objects will inherit from,
    // including some convenience functions as static properties on the model.
    var Model = database.Model.extend({

        hasTimestamps: true,

        defaults: function () {
            return {
                //uuid: uuid.v4()
            };
        },

        initialize: function () {
            this.on('creating', this.creating, this);
            this.on('saving', this.saving, this);
            this.on('saving', this.validate, this);
        },

        creating: function () {
            if (!this.get('created_by')) {
                this.set('created_by', 1);
            }
        },

        saving: function () {
             // Remove any properties which don't belong on the post model
            this.attributes = this.pick(this.permittedAttributes);

            this.set('updated_by', 1);
        },

        // Base prototype properties will go here
        // Fix problems with dates
        fixDates: function (attrs) {
            _.each(attrs, function (value, key) {
                if (key.substr(-3) === '_at' && value !== null) {
                    attrs[key] = moment(attrs[key]).toDate();
                }
            });

            return attrs;
        },

        format: function (attrs) {
            return this.fixDates(attrs);
        },

        toJSON: function (options) {
            var attrs = this.fixDates(_.extend({}, this.attributes)),
                relations = this.relations;

            if (options && options.shallow) {
                return attrs;
            }

            _.each(relations, function (relation, key) {
                if (key.substring(0, 7) !== '_pivot_') {
                    attrs[key] = relation.toJSON ? relation.toJSON() : relation;
                }
            });

            return attrs;
        },

        sanitize: function (attr) {
            return sanitize(this.get(attr)).xss();
        }

    }, {

        /**
         * Naive find all
         * @param options (optional)
         */
        findAll:  function (options) {
            options = options || {};
            return ghostBookshelf.Collection.forge([], {model: this}).fetch(options);
        },

        browse: function () {
            return this.findAll.apply(this, arguments);
        },

        /**
         * Naive find one where args match
         * @param args
         * @param options (optional)
         */
        findOne: function (args, options) {
            options = options || {};
            return this.forge(args).fetch(options);
        },

        read: function () {
            return this.findOne.apply(this, arguments);
        },

        /**
         * Naive edit
         * @param editedObj
         * @param options (optional)
         */
        edit: function (editedObj, options) {
            options = options || {};
            return this.forge({id: editedObj.id}).fetch(options).then(function (foundObj) {
                return foundObj.save(editedObj);
            });
        },

        update: function () {
            return this.edit.apply(this, arguments);
        },

        /**
         * Naive create
         * @param newObj
         * @param options (optional)
         */
        add: function (newObj, options) {
            options = options || {};
            return this.forge(newObj).save(options);
        },

        create: function () {
            return this.add.apply(this, arguments);
        },

        /**
         * Naive destroy
         * @param _identifier
         * @param options (optional)
         */
        destroy: function (_identifier, options) {
            options = options || {};
            return this.forge({id: _identifier}).destroy(options);
        },

        'delete': function () {
            return this.destroy.apply(this, arguments);
        }

    });

    return Model;
};
