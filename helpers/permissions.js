console.log('Loading permission helpers...');

var db    = require('../db/dbconnection');
var cache = require('../helpers/cache');

// Permission to access a given schedule

// Permission to modify a given schedule

// Permission to modify a shift

function shiftUpdate (obj) {
	return true;
}

module.exports = permissions = function (obj) {

	// TODO: Validate that object attributes exist

	var model   = obj.entity;
	var session = obj.session;
	var action  = obj.action;

	return true;
}