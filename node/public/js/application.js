$(function() {

	//-------------------------------ROUTER------------------------------------
	window.AppRouter = Backbone.Router.extend({
		init:0,
	
		initialize: function() {
			//return this.bind('all', this._trackPageview);
		},
		/*_trackPageview: function() {
			var url;
			url = Backbone.history.getFragment();
			//alert('tracking...: '+url);
//			if (this.currentMain != url ) {
				return _gaq.push(['_trackPageview',"/" + url]);
	//		}
		},*/
		routes: {
			'shifts':'shifts',
			'schedules':'schedules',
			'exchanges':'exchanges',
			'account':'account',

			'':'shifts'
		},

		shifts: function() {
			$('.link, .page').removeClass('active');
			$('.shifts').addClass('active');
		},
		schedules: function () {
			$('.link, .page').removeClass('active');
			$('.schedules').addClass('active');
		},
		exchanges: function () {
			$('.link, .page').removeClass('active');
			$('.exchanges').addClass('active');
		},
		account: function () {
			$('.link, .page').removeClass('active');
			$('.account').addClass('active');
		}
	});
//------------------PAYLOAD----------------------------
	
		var Router = new AppRouter;
		Router.init=1;
		Backbone.history.start();

});
