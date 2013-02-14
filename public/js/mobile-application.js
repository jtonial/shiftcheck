$(function() {

	window.Scheduleme = {//new Object();
		classes: {
			models: {},
			collections: {},
			views: {
				ScheduleView: {},
			},
		},
		helpers: {},

		data: {},

		Schedules: {},

		Init: function () {},

		CurrentView: {},
		Router: {},
	};

	Scheduleme.helpers.addMinutes = function(date, adding) {
		return new Date(date.getTime() + minutes*60000);
	};
	Scheduleme.helpers.UTCify = function (date) {
		return new Date(date.getTime() + date.getTimezoneOffset()*60000);
	};
	Scheduleme.helpers.fromUTC = function (date) {
		return new Date(date.getTime() + date.getTimezoneOffset()*60000);
	};
	Scheduleme.helpers.addDays = function(date, adding) {
		var nd = new Date();
		nd.setDate(date.getDate() + adding);
		return nd;
	};
	Scheduleme.helpers.switchView = function (view) {
		if (typeof Scheduleme.CurrentView.viewType !='undefined') {
			Scheduleme.CurrentView.undelegateEvents();
		}
		Scheduleme.CurrentView = view;
		Scheduleme.CurrentView.delegateEvents();
		Scheduleme.CurrentView.render();
	};
	Scheduleme.helpers.viewSchedule = function (id) {
		var view = new Scheduleme.classes.views.ScheduleView({model: Scheduleme.Schedules.get(id)});
		//Note this needs a back button
		Scheduleme.helpers.switchView(view);
	};
	Scheduleme.helpers.fetchBootstrap = function () {
		$.ajax({
			url: '/bootstrap',
			success: function (res) {

				Scheduleme.helpers.switchView(Scheduleme.ScheduleListView);

				//Removing loading div
				$.each(res.schedules, function () {
					Scheduleme.Schedules.add(this);
				});
				//I should only have to do this once, as any other schedule add (if even possible) will be in order (I hope)
				//Other option is to reRenderTabs() at the end of addOneSchedule
				if (Scheduleme.CurrentView.viewType == 'scheduleList') {
					Scheduleme.CurrentView.reRenderTabs();
					$('#dates.nav.nav-tabs li:nth-child(2) a').click();
				}

				//Add data into global object
				Scheduleme.data.email = res.data.email;
				if (Scheduleme.CurrentView.viewType !='undefined') {
					$('#email').val(Scheduleme.data.email);
				}
				Scheduleme.data.name = res.data.name;
				Scheduleme.data.username = res.data.username;
			}, error: function (xhr, status, text) {
				//Remove loading div
				if (xhr.status == '403') {
					Scheduleme.helpers.switchView(Scheduleme.LoginView);
				} else  {
					console.log('An error occured: '+xhr.status);
					alert('We seem to be having some technical difficulties');
				}
			}
		});
	};
	Scheduleme.helpers.handleLogout = function () {
		//Destory session;
		//Destroy data;
		Scheduleme.helpers.switchView(Scheduleme.LoginView);
	};



	Scheduleme.classes.models.Shift = Backbone.Model.extend({

		initialize: function () {	
			console.log('adding shift: '+this.toJSON());
		}
	});
	Scheduleme.classes.collections.Shifts = Backbone.Collection.extend({

		parse: function (data) {
			return data.data;
		}
	});

	Scheduleme.classes.models.Schedule = Backbone.Model.extend({
		//url: '/api/schedules?date='+this.get('date')+'&sessionOverride=1',
		model: Scheduleme.classes.models.Shift,

		initialize: function () {
		}

	});

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

	Scheduleme.classes.views.ScheduleListView = Backbone.View.extend({
		el: $('body'),

		template: Handlebars.compile($('#list-page-template').html()),

		initialize: function () {
			this.viewType = 'scheduleList';
			//Callback incase I forget to pass reference to collection
			this.collection = typeof this.collection != 'undefined' ? this.collection : Scheduleme.Schedules;

			this.collection.bind('add',this.addOneSchedule, this);
		},

		events: {
			"click .schedule-tab" : "viewSchedule"
		},

		render: function () {
			//The JSON passed in does nothing right now, but may in the future
			$(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
			this.addAllSchedules();
			return $(this.el);
		},
		addOneSchedule: function (schedule) {
			var Days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			var Months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			var Sups = ['th','st','nd','rd','th','th','th','th','th','th'];

			var datenum=schedule.get('date');//'2012-01-01';//This will be the real date
			var d = new Date(datenum);

			d = Scheduleme.helpers.UTCify(d);

			datenum = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+(d.getDate());
			var datestring = Days[d.getDay()]+', '+Months[d.getMonth()]+' '+(d.getDate()); //This will be the date string
			schedule.set('datenum', datenum);
			schedule.set('datestring', datestring);

			if (schedule.get('type') == 'month') {
				datestring = Months[d.getMonth()];
				schedule.set('datestring', datestring);
				this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+datestring+'</a></li>');
			} else if (schedule.get('type') == 'week') {
				var nd = Scheduleme.helpers.addDays(d, 7);
				var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
				schedule.set('ndatestring', ndatestring);
				this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
			} else if (schedule.get('type') == 'twoweek') {
				var nd = Scheduleme.helpers.addDays(d, 14);
				var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
				schedule.set('ndatestring', ndatestring);
				this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
			} else { //Defaults to daily schedule
				this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
			}
			
		},
		//Used after the view has been destroyed then created again to add back schedule views
		addAllSchedules: function () {
			var self = this;
			_.each(this.collection.models, function (schedule) {
				self.addOneSchedule(schedule);
			});
		},
		reRenderTabs: function () { //This works
			var Sups = ['th','st','nd','rd','th','th','th','th','th','th'];

			$('.schedule-tab').remove();
			_.each(this.collection.models, function(schedule) {
				var d = new Date(schedule.get('datenum'));
				//console.log('Day1: '+d);
				d = Scheduleme.helpers.fromUTC(d);
				//console.log('Day2: '+d);
				if (schedule.get('type') == 'month') {
					this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+schedule.get('datestring')+'</a></li>');
				} else if (schedule.get('type') == 'week') {
					var nd = new Date(schedule.get('ndatestring'));
					this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
					delete nd;
				} else if (schedule.get('type') == 'twoweek') {
					var nd = new Date(schedule.get('ndatestring'));
					this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
					delete nd;
				} else { //Defaults to daily schedule
					this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
				}
				delete d; //Remove the reference to D; it can not be garbage collected
			});
		},
		viewSchedule: function (e) {
			//console.log(e.currentTarget);
			Scheduleme.helpers.viewSchedule($(e.currentTarget).attr('data-id'));
		}
	});
	Scheduleme.classes.views.ScheduleView = Backbone.View.extend({

		el: $('body'),

		template: Handlebars.compile($('#schedule-template').html()),

		render: function () {
			//$(this.el).attr('id',this.model.get('datenum'));
			$(this.el).html(this.template(this.model.toJSON()));

			var config = {
			  hideUnmatchingOnClick: 0
			}

			function generateShifts (num, positions, names) {
			  var shifts = []

			  var positions = typeof positions != 'undefined' ? positions : ['MGR','WN','DT','BK','MT','MB'];
			  var names = typeof names != 'undefined' ? names : ['Nick','Jack','John','Jack','Kathy','Josephine','Jordy','Tina'];

			  for (var i = 0; i < num; i++) {
			    var position = positions[Math.floor(Math.random()*(positions.length))];
			    var name = names[Math.floor(Math.random()*(names.length))];

			    var minutes = Math.floor(Math.random()*2) * 30;       //will return 0 or 30
			    var hours = Math.floor(Math.random()*16) + 4;         // Return from 4 - 20
			    var length = (Math.floor(Math.random()*4) + 6) / 2;  //Can return lengths from 3 - 8 hours in half hour intervals

			    var endHours = Math.min(hours + Math.floor(length), 24);
			    var endMinutes = (length*60) % 60;

			    var start = new Date();
			    start.setHours(hours);
			    start.setMinutes(minutes);

			    var end = new Date();
			    end.setHours(endHours);
			    end.setMinutes(endMinutes);
			    if (endHours == 24) {
			      end.setHours(23)
			      if (endMinutes == 0) {
			        end.setMinutes(59);
			      }
			    }

			    var o = {
			      id        : i,
			      start     : start.toString(),
			      end       : end.toString(),
			      position  : position,
			      employee  : name
			    }

			    shifts.push(o);
			  }
			  return shifts;
			}

			// Remake dataset with random data
			dataset = generateShifts(50);


			var width = $(window).width()-16;

			var barHeight = 14;

			var shiftInfoFontSize = barHeight*(4/5);

			var barPadding = 2;
			var topPadding = 40;
			var leftPadding = 100;
			var barRadius = 5;
			//var height = 500;
			var height = (dataset.length * barHeight) + topPadding;

			var w = width;
			var h = height;
			var h2 = h - topPadding;

			var color = d3.scale.category20();

			var textColor = '#000';
			var fadedTextColor = '#999';

			// Sort schedules
			function compare(a,b) {
			  if (a.start < b.start)
			    return -1;
			  if (a.start > b.start)
			    return 1;
			  if (a.end < b.end)
			    return -1;
			  if (a.end > b.end)
			    return 1;
			  return 0;
			}

			//Seperate by shift, then sort
			window.tmp = {};
			dataset.forEach( function (d) {
			  if (typeof tmp[d.position] == 'undefined') {
			    tmp[d.position] = [];
			  }
			  tmp[d.position].push(d);
			})

			for (var key in tmp) {
			  tmp[key].sort(compare);
			}

			dataset = $.map( tmp, function(n){
			   return n;
			});

			//dataset.sort(compare);

			var shiftMeta = {}

			dataset.forEach(function (shift) {
			  shiftMeta[shift.id] = {}
			  
			    var s = new Date(shift.start);
			    var sMin = s.getHours()*60+s.getMinutes();

			  shiftMeta[shift.id].sMin = sMin;

			    var e = new Date(shift.end);
			    var eMin = e.getHours()*60+e.getMinutes();

			  shiftMeta[shift.id].eMin = eMin;

			});
			/*
			var xlineData = LineData(dataset.length, 0, 1440, 30);
			var ylineData = LineData(dataset.length, topPadding - 1 + barHeight, 
			  (dataset.length * barHeight) + topPadding, 
			  barHeight);
			*/

			//Note min will always the the first element. Max is not guaranteed to be the last
			var min = d3.min(dataset, function (d) {
			        var s = new Date(d.start);
			        var sMin = s.getHours()*60+s.getMinutes();

			        return sMin;
			      });
			var max = d3.max(dataset, function(d) { 
			        var e = new Date(d.end);
			        var eMin = e.getHours()*60+e.getMinutes();

			        return eMin;
			    });

			var xScale = d3.scale.linear()
			    .domain([ min , max ])
			    .range([leftPadding, w]);

			var widthScale = d3.scale.linear()
			    .domain([ 0 , max - min ])
			    .range([0, w-leftPadding]);

			// Create SVG element
			var svg2 = d3.select("#content")
			      .append("svg")
			      .style("width", w)
			      .style("height", h);


			// the yaxiscoorddata gives the y coordinates
			// for horizontal lines ("x1" = 25 and, "x2"=width-25)
			var ylineData = d3.range(topPadding - 1 + barHeight, 
			          (dataset.length * barHeight) + topPadding, 
			          barHeight);
			 
			// the xaxiscoorddata gives the x coordinates
			// for vertical lines ("y1" = 25 and, "y2"=height-25)
			var xlineData = d3.range(min, max, 30);

			overlapping = function (a1, a2, b1, b2) {

			  if (b1 < a1 && b2 <= a1)
			    return 0;
			  if (b1 >= a2 && b2 > a2)
			    return 0;

			  return 1;
			}

			amountOverlapping = function (s1, e1, s2, e2) {
			  if (overlapping(s1, e1, s2, e2)) {
			    if (s2 < e1) {// a is before a
			      return (e1 - Math.max(s1, s2)) / (e1 - s1);
			    } else { // b is before a
			      return (e2 - Math.max(s1, s2)) / (e1 - s1);
			    }
			  }
			  return 0;
			}

			var shiftOverlapping = function (d) {
			  //Use default dataset if nothing else is provided
			  d = typeof d != 'undefined' ? d : dataset;

			  var overlapArray = [];

			  d.forEach(function (x) {
			    var sx = shiftMeta[x.id];
			    overlapArray[x.id] = [];
			    d.forEach(function(y) {
			      var sy = shiftMeta[y.id];
			      overlapArray[x.id][y.id] = amountOverlapping(sx.sMin, sx.eMin, sy.sMin, sy.eMin);
			    })
			  })

			  return overlapArray;
			}

			var overlappingAmounts = shiftOverlapping();

			//I could probably make this faster by only highlighting rows taht are displayed in the current window (only applicable for very large schedules)
			  //This would require rehighlighting on window scroll
			highlightShifts = function (highlight, t, hoveredId) {
			  crossMapping[t].forEach(function (s) {
			    var t = d3.select(s);
			    var id = t.attr("id");
			    var y = t.attr("y") -1; //Not sure why this has to be -1
			    if (highlight == 'select') {
			      d3.select(shiftText[id].employeeName)
			        .attr("fill", textColor)
			        .attr("font-weight", "bold");
			      d3.select(shiftText[id].position)
			        .attr("fill", textColor)
			        .attr("font-weight", "bold");

			      d3.select(horizontalAreaMapping[y])
			        .attr("fill","rgba(180,180,180,0.5)");

			      t.attr("fill", function (d) {
			        //I'll need to pass the id of the hovered shift for the comparative colouring.
			        //if (typeof hoveredId != 'undefined') {
			        //  return 'rgba(0, 0, 150, '+overlappingAmounts[hoveredId][d.id]+')';
			        //}
			        return t.property('baseColor');
			      })
			    } else if (highlight == 'unselect') {
			      d3.select(shiftText[id].employeeName)
			        .attr("fill", fadedTextColor)
			        .attr("font-weight", "normal");
			      d3.select(shiftText[id].position)
			        .attr("fill", fadedTextColor)
			        .attr("font-weight", "normal");
			      d3.select(horizontalAreaMapping[y])
			        .attr("fill","rgba(180,180,180,0)");

			      t.attr("fill", t.property('transColor'));
			    }
			  })
			}
			hideUnmatching = function (id) {
			  d3.selectAll(".shift")
			    .transition()
			    .duration(250)
			    .attr("height", function(d) {
			      if (id == '-1' || overlappingAmounts[id][d.id] != 0) {
			        return barHeight - barPadding;
			      } else {
			        return 0;
			      }
			    });
			}
			// Using the xaxiscoorddata to generate vertical lines.
			var gridVert = svg2.append("g").selectAll(".vertical")
			  .data(xlineData)
			  .enter().append("svg:line").attr("class", "vertical")
			  .attr("x1", function(d){return xScale(d);})
			  .attr("y1", topPadding - 5)
			  .attr("x2", function(d){return xScale(d);})
			  .attr("y2", height)
			  .style("stroke", function (d) {

			    //I should really precalculate this and save it into the model
			    var s = new Date(d.start);
			    var sMin = s.getHours()*60+s.getMinutes();

			    //console.log ('mod: '+s.getMinutes());
			    if (sMin % 60 == 0) {
			      return "rgb(200,200,200)";
			    } else {
			      return "rgba(200,200,200,0.5)"; 
			    }
			  })
			  .style("stroke-width", 1);

			var horizontalAreaMapping = {};

			var gridHorAreas = svg2.append("g").selectAll(".horizontalArea")
			  .data(ylineData)
			  .enter().append("svg:rect").attr("class", "horizontalArea")
			  .attr("x", leftPadding)
			  .attr("y", function(d){
			    horizontalAreaMapping[d-barHeight] = this;
			    return d-barHeight;
			  })
			  .attr("width", width)
			  .attr("height", barHeight)
			  .attr("fill", "rgba(180,180,180,0)");

			// Using the yaxiscoorddata to generate horizontal lines.       
			var gridHor = svg2.append("g").selectAll("line.horizontal")
			  .data(ylineData)
			  .enter().append("svg:line").attr("class", "horizontal")
			  .attr("x1", leftPadding)
			  .attr("y1", function(d){return d;})
			  .attr("x2", width)
			  .attr("y2", function(d){return d;})
			  .style("stroke", "rgb(200,200,200)")
			  .style("stroke-width", 1);


			var gridVertAreas = svg2.append("g").selectAll(".verticalArea")
			  .data(xlineData)
			  .enter().append("svg:rect").attr("class", "verticalArea")
			  .attr("x", function(d){return xScale(d);})
			  .attr("y", topPadding - 5)
			  .attr("width", function(d){return widthScale(30);})
			  .attr("height", h)
			  .attr("fill", "rgba(180,180,180,0.1)")
			  .on('mouseover', function (d) {
			    //Highlight matching shifts
			    d3.select(this).style("fill", "rgba(180,180,180,0.5)");

			    highlightShifts('select', d);

			  })
			  .on('mouseout', function (d) {
			    d3.select(this).style("fill", "rgba(180,180,180,0.1)");
			    
			    highlightShifts('unselect', d);

			  })
			  .on('click', function (d) {
			    if (config.hideUnmatchingOnClick) hideUnmatching(-1);
			  });

			var shifts = svg2.append("g").selectAll(".shift")
			  .data(dataset)
			  .enter()
			  .append("rect").attr("class", "shift")
			  .property("sMin", function (d, i) {
			    var s = new Date(d.start);
			    var sMin = s.getHours()*60+s.getMinutes();

			    return sMin;
			  })
			  .property("eMin", function (d, i) {
			    var e = new Date(d.end);
			    var eMin = e.getHours()*60+e.getMinutes();

			    return eMin;
			  })
			  .property('transColor', function (d, i) {
			    return "rgba(0, 0, 150, 0.6)";
			  })
			  .property('baseColor', function (d, i) {
			    var sMin = d3.select(this).property('sMin');
			    var eMin = d3.select(this).property('eMin');

			    return "rgba(0, 0, 150, 0.9)";
			  })
			  .attr("id", function (d) {
			    return d.id;
			  })
			  .attr("y", function(d, i) {
			    return (i * barHeight) + topPadding;
			  })
			  .attr("x", function(d) {
			    return xScale(d3.select(this).property('sMin'));
			  })
			  .attr("rx", barRadius)
			  .attr("ry", barRadius)
			  .attr("height", barHeight - barPadding)
			  .attr("width", function(d) {
			    var sMin = d3.select(this).property('sMin');
			    var eMin = d3.select(this).property('eMin');

			    return widthScale(eMin - sMin);
			  })
			  .attr("fill", function(d) {
			    return d3.select(this).property('transColor');
			  })
			  .on('mouseover', function (d) {
			    // Note: I can use attr or style, but mixing them is bad. Style seems to superceed attr
			    var that = d3.select(this);

			    var start = that.property('sMin') - (that.property('sMin') % 30);
			    var end = that.property('eMin') + (that.property('eMin') % 30);

			    //Maybe I could highlight shifts with a different colour based on the number of hours the shift shares with the selected one.
			    for (var key in crossMapping) {
			      if (key >= start && key <= end) {
			        highlightShifts('select', key, d.id);
			      }
			    }

			    //d3.select(this).attr("fill", d3.select(this).property('baseColor'));
			  })
			  .on('mouseout', function (d) {
			    var that = d3.select(this);

			    var start = that.property('sMin') - (that.property('sMin') % 30);
			    var end = that.property('eMin') + (that.property('eMin') % 30);

			    for (var key in crossMapping) {
			      if (key >= start && key <= end) {
			        highlightShifts('unselect', key);
			      }
			    }
			    //d3.select(this).attr("fill", d3.select(this).property('transColor'));
			  })
			  .on('click', function (d) {
			    if (config.hideUnmatchingOnClick) hideUnmatching(d.id);
			  });

			var shiftText = {};

			dataset.forEach( function (d) {
			  shiftText[d.id] = {};
			})

			// Names
			var gridTextNames = svg2.append("g").selectAll(".employeeName")
			  .data(dataset)
			  .enter()
			  .append("text").attr("class", "employeeName")
			  .text(function(d) {
			    shiftText[d.id].employeeName = this;
			    return d.employee;
			  })
			  .attr("text-anchor", "start")
			  .attr("y", function(d, i) {
			    return i * barHeight + 3 + topPadding + (height / dataset.length - barPadding) / 2;
			  })
			  //.attr("x", function(d) {
			  //  return 10;
			  //})
			  .attr("font-family", "sans-serif")
			  .attr("font-size", shiftInfoFontSize+"px")
			  .attr("fill", fadedTextColor);

			//Associate left-text with shifts

			var gridTextPositions = svg2.append("g").selectAll(".shiftPositions")
			  .data(dataset)
			  .enter()
			  .append("text").attr("class", "shiftPositions")
			  .text(function(d) {
			    //Associate text to shift here... I should probably do it in its own function but I'm not sure how
			    shiftText[d.id].position = this;
			    return d.position;
			  })
			  .attr("text-anchor", "end")
			  .attr("y", function(d, i) {
			    return i * barHeight + 3 + topPadding + (height / dataset.length - barPadding) / 2;
			  })
			  .attr("x", function(d) {
			    return leftPadding-5;
			  })
			  .attr("font-family", "sans-serif")
			  .attr("font-size", shiftInfoFontSize+"px")
			  .attr("fill", fadedTextColor);

			//Times
			var gridTimes = svg2.append("g").selectAll("text.times")
			  .data(xlineData)
			  .enter()
			  .append("text").attr("class", "times")
			  .text(function(d) {
			    var tmp = new Date();
			    tmp.setHours(Math.floor(d / 60));
			    tmp.setMinutes(d % 60);
			    var hours = (Math.floor(d / 60)) % 12;
			    if (hours == 0) {
			      hours = 12;
			    }
			    minutes = ("0" + (d%60)).slice(-2);

			    if (minutes % 60 == 0) {
			      return hours+':'+minutes;
			    }

			    return '';
			  })
			  //.attr("text-anchor", "right")
			  .attr("y", function(d, i) {
			    return topPadding - 10;
			  })
			  .attr("x", function(d) {
			    return xScale(d)-12;
			  })
			  .attr("font-family", "sans-serif")
			  .attr("font-size", "9px")
			  .attr("fill", "black");


			//I think I'll end up saving the properties into a global object if I keep having trouble
			var d3Objects = d3.selectAll(".shift");
			var crossMapping = [];
			var crossMappingId = [];
			xlineData.forEach(function (x) {
			  var a = [];
			  var b = [];
			  d3Objects.each(function (s) {
			    var shift = shiftMeta[s.id];
			    //console.log('overlap('+x+','+(x+30)+','+shift.sMin+','+shift.eMin+')');
			    if (overlapping(x, x+30, shift.sMin, shift.eMin)) {
			      a.push(this);
			      b.push(s.id);
			    }
			  })
			  crossMapping[x]=a;
			  crossMappingId[x]=b;
			})

			window.resizeGraph = function (w) {

			//At this point shifts wont change; There min and max are not recalculated
			var xScale = d3.scale.linear()
				.domain([ min , max ])
				.range([leftPadding, w]);

			var widthScale = d3.scale.linear()
				.domain([ 0 , max - min ])
				.range([0, w-leftPadding]);

			var svg2 = d3.select("#content")
				.select("svg")
				.transition()
				.duration(750)
				.style("width", w);

			svg2 = d3.select("#content")
				.select("svg");

			svg2.selectAll("line.vertical")
				.transition()
				.duration(750)
				.attr("x1", function(d){return xScale(d);})
				.attr("x2", function(d){return xScale(d);});

			svg2.selectAll(".horizontalArea")
				.transition()
				.duration(750)
				.attr("width", w - leftPadding);

			svg2.selectAll("line.horizontal")
				.transition()
				.duration(750)
				.attr("x2", function(d){return w;});

			svg2.selectAll(".verticalArea")
				.transition()
				.duration(750)
				.attr("x", function(d){return xScale(d);})
				.attr("width", function(d){return widthScale(30);})

			svg2.selectAll(".shift")
				.transition()
				.duration(750)
				.attr("x", function(d) {
					return xScale(d3.select(this).property('sMin'));
				})
				.attr("width", function(d) {
					var sMin = d3.select(this).property('sMin');
					var eMin = d3.select(this).property('eMin');

					return widthScale(eMin - sMin);
				});

			svg2.selectAll("text.times")
				.transition()
				.duration(750)
				.attr("x", function(d) {
					return xScale(d)-12;
				})
			}

			$('svg .shift').popover({ 
				title: function() {
					var d = this.__data__;
					console.log('popover-ing: '+d.id);
					return "" + d.id; 
				},
				content: 'adsfadsfdsfa',
				html: true,
				placement: "right"
			});


			$(window).resize(function () {
				window.resizeGraph($(window).width() - 16);
			});



			return $(this.el);
		}
	})

	Scheduleme.classes.views.AccountView = Backbone.View.extend({
		el: $('body'),

		//tagName: 'div',
		//className: 'page account',

		template: Handlebars.compile($('#account-template').html()),

		initialize: function () {
			this.viewType = 'account';
			console.log('Initializing AccountView');
		},

		events: {
			"click #change-password-trigger" : "changePassword",
			"click #edit-email-trigger" : "emailMakeEdittable",
			"click #save-email-trigger" : "emailSaveChange",
		},
		render: function () {
			$(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
			$('#email').val(Scheduleme.data.email);

			$('#sched-date').datepicker({
				showOtherMonths: true,
				dateFormat: 'yy-mm-dd',
				maxDate: "+0D"
			});
			$('#upload-schedule-date').datepicker({
				showOtherMonths: true,
				dateFormat: 'yy-mm-dd',
				minDate: "+0D"
			});

			return $(this.el);
		},
		changePassword: function () {
			console.log('trying to changing password...');
			function validatePasswords () {
				var newpass = $('#newpassword').val();
				var newpass1 = $('#newpassword1').val();
				if (newpass.length < 6) {
					return 3;
				}
				if (newpass != newpass1) {
					return 2;
				}
				return 1;
			}

			console.log('validating password change...');

			var validate = validatePasswords();
			if (validate == 1) {
				if ( $('#oldpassword').val() != $('#newpassword').val() ) {
					console.log('Inputs valid.');
					$.ajax({url: '/me/changePassword',
						type: 'POST',
						data: 'oldpassword='+$('#oldpassword').val()+'&newpassword='+$('#newpassword').val(),
						success: function (response) {
							alert ('Password successfully changed!');
							//Clear fields
							$('#oldpassword').val('');
							$('#newpassword').val('');
							$('#newpassword1').val('');
						}, error: function () {
							alert ('Password change failed.');
						}
					});
					console.log('after request...');
				} else {
					console.log('The new password cannot match the old password');
				}
			} else if (validate == 2) {
				console.log('The new password entries must match.');
			} else if (validate == 3) {
				console.log('Your new password must be at last 6 characters long');
			}
		},
		emailMakeEdittable: function () {
			$('#email').removeAttr('disabled');
			$('#save-email-trigger').show();
			$('#edit-email-trigger').hide();
		},
		emailSaveChange: function () {
			function validateEmail(email) {
				var re = /^(([^<>()[\\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return re.test(email);
			}
			console.log('new email: '+$('#email').val());
			if (validateEmail($('#email').val())) {
				console.log('email valid. changing email');
				$('#email').attr('disabled','');
				$('#edit-email-trigger').show();
				$('#save-email-trigger').hide();
			} else {
				console.log('the entered email is not valid');
			}
		}
	});

	Scheduleme.classes.views.LoginView = Backbone.View.extend({
		el: $('body'),

		template: Handlebars.compile($('#login-template').html()),

		events: {
			'submit #login-form' : 'handleLogin'
		},
		handleLogin: function (e) {
			console.log('test');
			e.preventDefault(); //Prevent default submission
			$.ajax({
				url: '/login',
				type: 'POST',
				data: $('#login-form').serialize(),
				success: function (response) {
					console.log('successful login');	
					Scheduleme.helpers.fetchBootstrap();
				}, error: function (response) {
					alert('Username and password do not match. Please try again');
				}
			});	
		},
		render: function () {
			//$(this.el).attr('id',this.model.get('datenum'));
			$(this.el).html(this.template());
			return $(this.el);
		}
	});
	//Used for global events
	Scheduleme.classes.views.AppView = Backbone.View.extend({
		el: $('body'),

		template: Handlebars.compile($('#app-template').html()),

		events: {
			'click .back-to-list' 		: 'back',
			'click .account-trigger' 	: 'openAccountView',
			'click .logout-trigger' 	: 'logout'
		},
		back: function () {
			Scheduleme.helpers.switchView(Scheduleme.ScheduleListView);
		},
		openAccountView: function () {
			console.log('will open AccountView here');
		},
		logout: function () {
			Scheduleme.helpers.handleLogout();
		}
	});

//------------------PAYLOAD----------------------------

	Scheduleme.Init = function () {
		Scheduleme.Schedules = new Scheduleme.classes.collections.Schedules();

		Scheduleme.AppView = new Scheduleme.classes.views.AppView();

		//Router takes care of this
		Scheduleme.ScheduleListView	= new Scheduleme.classes.views.ScheduleListView({collection: Scheduleme.Schedules});
		Scheduleme.AccountView = new Scheduleme.classes.views.AccountView();
		Scheduleme.LoginView = new Scheduleme.classes.views.LoginView();
		//AJAX Setup
		$.ajaxSetup({
			dataType: 'json' //AJAX responses will all be treated as json dispite content-type
		});
		//Add global $.ajaxError handlers

		Handlebars.registerHelper('outputDate', function() {
			var t = new Date();
			var today = t.getFullYear()+'-'+(t.getMonth()+1)+'-'+(t.getDate()+1);
			var output = '';
			if (this.datenum == today) {
				return 'Today';
			} else {
				return this.datestring;
			}
		});

		Scheduleme.helpers.fetchBootstrap();
	};

	$(document).ready(function () {
		Scheduleme.Init();
	});

});
