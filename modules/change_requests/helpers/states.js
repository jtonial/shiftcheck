
// Order States

var _ = require('underscore');

// Perhaps transitions should be merged into states, along with other info
 // eg
 /*
  0 : {
    name : 'Pending',
    descrition : 'The order is pending confirmation from the seller',
    transitions : [ 5 , 6, 7 ]
  }
 */
 
/*var states = {
  0 : 'Pending',
  1 : 'Processed',
  2 : 'Shipped',
  3 : 'Delivered',
  4 : 'Returned',
  5 : 'Approved',
  6 : 'Rejected',
  7 : 'Cancelled'
}*/

var states = {
  0 : {
    name        : 'Requested',
    description : 'The order is pending review by the supplier',
    transitions : [ 1 , 2, 3 ]
  },
  1 : {
    name        : 'Approved',
    description : 'The order is processed and waiting shipment',
    transitions : [ ]
  },
  2 : {
    name        : 'Rejected',
    description : 'The order has been shipped. Tracking information should have been provided',
    transitions : [ ]
  },
  3 : {
    name        : 'Cancelled',
    description : 'Our records show that the order has been delivered',
    transitions : [ ]
  }
}

var validTransitionsCache = {};

var inverse = {};

_.keys(states).forEach( function (key) {
  inverse[states[key].name] = key;
});

exports.toInt = function (s) {
  return inverse[s];
};

exports.toString = function (i) {
  return states[i].name;
};

exports.validInts = _.keys(states);

exports.validStrings = _.values(states);


exports.validTransition = function (from, to) {
  if (typeof from == "string") from = parseInt(from);
  if (typeof to == "string") to = parseInt(to);

  if (states[from].transitions.indexOf(to) >= 0) return true;
  return false;
}
// In order to use this effectively I will have to label which actions can be performed by each person (supplier vs customer). For example, a supplier can approve/reject, but not cancel
exports.validTransitions = function (from) {
  if (validTransitionsCache[from]) return validTransitionsCache[from];
  var tmp = {};
  _.keys(transitions[from]).forEach( function (key) {
    console.log(key+' '+states[key]);
    tmp[key] = states[key];
  });
  validTransitionsCache[from] = tmp;
  return tmp;
}
