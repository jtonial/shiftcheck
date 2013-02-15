Scheduleme.classes.views.EmployeeView = Backbone.View.extend({

	tagName: 'div',
	template: _.template($('#employee-template').html()),
	render: function () {
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	}
});