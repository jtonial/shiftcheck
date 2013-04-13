$( document ).on( "pageshow", "#login-page", function() {
	console.log("login-page ready");
	if (Scheduleme.User.loggedIn) {
		$.mobile.changePage( '#list-page', {
			transition: "fade",
			reverse: false
		});
	}
});


$( document ).on( "pageinit", "#schedule-page", function() {
	console.log("schedule-page ready");

	Scheduleme.ScheduleListPanelView.reRenderTabs();

    $( document ).on( "swipeleft swiperight", "#schedule-page", function( e ) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
		console.log('Swipe detected on schedule-page');
        if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
            if ( e.type === "swipeleft"  ) {
                $( "#schedule-right-panel" ).panel( "open" );
            } else if ( e.type === "swiperight" ) {
                $( "#schedule-left-panel" ).panel( "open" );
            }
        }
    });
	$( document ).on( 'click' , '.schedule-link', function () {
		var id = $(this).attr('data-id');
		console.log('try to open schedule with id '+id);
		/*if ($('#schedule'+id).length) {
			// Nav to the page
			$.mobile.changePage( '#schedule-page', {
				changeHash: true
			});
		} else {
			//createSchedulePage(id);
			$.mobile.changePage( '#schedule-page', {
				changeHash: true
			});
		}*/
		if (id) {
			createSchedulePage(id);
		}

		/*$.mobile.changePage( '#schedule-page', {
			changeHash: true
		});*/
	});
});

$( document ).on( "pageinit", "#list-page", function() {
	console.log("list-page ready");

	Scheduleme.ScheduleListView.reRenderTabs();

    $( document ).on( "swipeleft swiperight", "#list-page", function( e ) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
		console.log('Swipe detected on list-page');
        if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
            if ( e.type === "swipeleft"  ) {
                $( "#list-right-panel" ).panel( "open" );
            } else if ( e.type === "swiperight" ) {
                //$( "#list-left-panel" ).panel( "open" );
            }
        }
    });
	$( document ).on( 'click' , '.schedule-link', function () {
		var id = $(this).attr('data-id');
		console.log('try to open schedule with id '+id);
		/*if ($('#schedule'+id).length) {
			// Nav to the page
			$.mobile.changePage( '#schedule-page', {
				changeHash: true
			});
		} else {
			//createSchedulePage(id);
			$.mobile.changePage( '#schedule-page', {
				changeHash: true
			});
		}*/

		if (id) {
			createSchedulePage(id);
		}

		/*$.mobile.changePage( '#schedule-page', {
			changeHash: true
		});*/
	});
});
$( document ).on( "pageshow", "#list-page", function() {
	console.log('List view visible');
	Scheduleme.ScheduleListView.reRenderTabs();
});
function createSchedulePage(id) {
	console.log('The page doesn\'t exist yet; creating it');

	var view = new Scheduleme.classes.views.ScheduleView({model: Scheduleme.Schedules.get(id)});

	console.log('new view created');

	//console.log(view.render().el);

	view = view.render();
	//$('#pages').append(view.el);

	//$.mobile.initializePage();
	//$('#schedule'+id).trigger('create');

	/*if (view.requiresPostRender) {
		console.log('postRender-ing');
		view.postRender();
	}*/
/*
	$( "#main-left-panel" ).panel();
	$( "#main-right-panel" ).panel();
*/
	/*$.mobile.changePage( '#schedule'+id, {
		changeHash: true
	});*/

	$('#schedule-page h1.page-header-text').html( Scheduleme.Schedules.get(id).get('titledatestring') );
	//$('#schedule-page').trigger('pagecreate');

	$.mobile.changePage( '#schedule-page', {
		changeHash: true
	});
}