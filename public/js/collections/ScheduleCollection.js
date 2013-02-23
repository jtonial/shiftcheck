Scheduleme.classes.collections.Schedules = Backbone.Collection.extend({
	url: 'api/schedules',
	model: Scheduleme.classes.models.Schedule,

	parse: function (data) {
		return data.data;
	},
	comparator: function (schedule) {
		return Date.parse(schedule.get('date'));
	}
});