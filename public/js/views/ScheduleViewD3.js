Scheduleme.classes.views.ScheduleView.d3 = Backbone.View.extend({

	template: Handlebars.compile($('#schedule-template').html()),
	
	className: 'tab-pane',

	//Create the frame
	initialize: function () {

		this.config = {
			hideUnmatchingOnClick	: 0,
			textColor				: '#000',
			fadedTextColor			: '#999',

			barHeight 				: 14,
			barPadding 				: 2,
			barRadius 				: 5,
			topPadding 				: 40,
			leftPadding 			: 100
		};

		//Mappings used as index's

		this.indexes = {
			shiftMeta				: {},
			overlappingAmounts		: [],
			horizontalAreaMapping	: {},
			shiftText				: {},
			crossMapping 			: [],
			crossMappingId 			: []
		}


		function make (target, dataset) {

			// Remake dataset with random data
			dataset = typeof dataset != 'undefined' ? dataset : generateShifts(50);

			if (!($(target).length)) throw new Error('');

			var width = Math.min($(window).width(), $(target).width())-16;

			var shiftInfoFontSize = config.barHeight*(4/5);

			//var height = 500;
			var height = (dataset.length * config.barHeight) + config.topPadding;

			var w = width;
			var h = height;
			var h2 = h - config.topPadding;

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
			var tmp = {};
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

			dataset.forEach(function (shift) {
				indexes.shiftMeta[shift.id] = {}
				
					var s = new Date(shift.start);
					var sMin = s.getHours()*60+s.getMinutes();

				indexes.shiftMeta[shift.id].sMin = sMin;

					var e = new Date(shift.end);
					var eMin = e.getHours()*60+e.getMinutes();

				indexes.shiftMeta[shift.id].eMin = eMin;

			});

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
					.range([config.leftPadding, w]);

			var widthScale = d3.scale.linear()
					.domain([ 0 , max - min ])
					.range([0, w-config.leftPadding]);

			// Create SVG element
			var svg2 = d3.select(target)
						.append("svg")
						.style("width", w)
						.style("height", h);


			var ylineData = d3.range(config.topPadding - 1 + config.barHeight, 
								(dataset.length * config.barHeight) + config.topPadding, 
								config.barHeight);
			 
			var xlineData = d3.range(min, max, 30);

			var shiftOverlapping = function (d) {
				//Use default dataset if nothing else is provided
				d = typeof d != 'undefined' ? d : dataset;

				var overlapArray = [];

				d.forEach(function (x) {
					var sx = indexes.shiftMeta[x.id];
					overlapArray[x.id] = [];
					d.forEach(function(y) {
						var sy = indexes.shiftMeta[y.id];
						overlapArray[x.id][y.id] = amountOverlapping(sx.sMin, sx.eMin, sy.sMin, sy.eMin);
					})
				})

				return overlapArray;
			}

			indexes.overlappingAmounts = shiftOverlapping();

			//I could probably make this faster by only highlighting rows taht are displayed in the current window (only applicable for very large schedules)
				//This would require rehighlighting on window scroll
			
			// Using the xaxiscoorddata to generate vertical lines.
			var gridVert = svg2.append("g").selectAll(".vertical")
				.data(xlineData)
				.enter().append("svg:line").attr("class", "vertical")
				.attr("x1", function(d){return xScale(d);})
				.attr("y1", config.topPadding - 5)
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

			var gridHorAreas = svg2.append("g").selectAll(".horizontalArea")
				.data(ylineData)
				.enter().append("svg:rect").attr("class", "horizontalArea")
				.attr("x", config.leftPadding)
				.attr("y", function(d){
					indexes.horizontalAreaMapping[d-config.barHeight] = this;
					return d-config.barHeight;
				})
				.attr("width", width)
				.attr("height", config.barHeight)
				.attr("fill", "rgba(180,180,180,0)");

			// Using the yaxiscoorddata to generate horizontal lines.			 
			var gridHor = svg2.append("g").selectAll("line.horizontal")
				.data(ylineData)
				.enter().append("svg:line").attr("class", "horizontal")
				.attr("x1", config.leftPadding)
				.attr("y1", function(d){return d;})
				.attr("x2", width)
				.attr("y2", function(d){return d;})
				.style("stroke", "rgb(200,200,200)")
				.style("stroke-width", 1);


			var gridVertAreas = svg2.append("g").selectAll(".verticalArea")
				.data(xlineData)
				.enter().append("svg:rect").attr("class", "verticalArea")
				.attr("x", function(d){return xScale(d);})
				.attr("y", config.topPadding - 5)
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
					return (i * config.barHeight) + config.topPadding;
				})
				.attr("x", function(d) {
					return xScale(d3.select(this).property('sMin'));
				})
				.attr("rx", config.barRadius)
				.attr("ry", config.barRadius)
				.attr("height", config.barHeight - config.barPadding)
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
					for (var key in indexes.crossMapping) {
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

					for (var key in indexes.crossMapping) {
						if (key >= start && key <= end) {
							highlightShifts('unselect', key);
						}
					}
					//d3.select(this).attr("fill", d3.select(this).property('transColor'));
				})
				.on('click', function (d) {
					if (config.hideUnmatchingOnClick) hideUnmatching(d.id);
				});

			dataset.forEach( function (d) {
				indexes.shiftText[d.id] = {};
			})

			// Names
			var gridTextNames = svg2.append("g").selectAll(".employeeName")
				.data(dataset)
				.enter()
				.append("text").attr("class", "employeeName")
				.text(function(d) {
					indexes.shiftText[d.id].employeeName = this;
					return d.employee;
				})
				.attr("text-anchor", "start")
				.attr("y", function(d, i) {
					return i * config.barHeight + 3 + config.topPadding + (height / dataset.length - config.barPadding) / 2;
				})
				.attr("font-family", "sans-serif")
				.attr("font-size", shiftInfoFontSize+"px")
				.attr("fill", config.fadedTextColor);

			//Associate left-text with shifts

			var gridTextPositions = svg2.append("g").selectAll(".shiftPositions")
				.data(dataset)
				.enter()
				.append("text").attr("class", "shiftPositions")
				.text(function(d) {
					//Associate text to shift here... I should probably do it in its own function but I'm not sure how
					indexes.shiftText[d.id].position = this;
					return d.position;
				})
				.attr("text-anchor", "end")
				.attr("y", function(d, i) {
					return i * config.barHeight + 3 + config.topPadding + (height / dataset.length - config.barPadding) / 2;
				})
				.attr("x", function(d) {
					return config.leftPadding-5;
				})
				.attr("font-family", "sans-serif")
				.attr("font-size", shiftInfoFontSize+"px")
				.attr("fill", config.fadedTextColor);

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
					return config.topPadding - 10;
				})
				.attr("x", function(d) {
					return xScale(d)-12;
				})
				.attr("font-family", "sans-serif")
				.attr("font-size", "9px")
				.attr("fill", "black");


			//I think I'll end up saving the properties into a global object if I keep having trouble
			var d3Objects = d3.selectAll(".shift");

			xlineData.forEach(function (x) {
				var a = [];
				var b = [];
				d3Objects.each(function (s) {
					var shift = indexes.shiftMeta[s.id];
					//console.log('overlap('+x+','+(x+30)+','+shift.sMin+','+shift.eMin+')');
					if (overlapping(x, x+30, shift.sMin, shift.eMin)) {
						a.push(this);
						b.push(s.id);
					}
				})
				indexes.crossMapping[x]=a;
				indexes.crossMappingId[x]=b;
			})

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

		}
	},
	generateShifts: function (num, positions, names) {
		var shifts = []

		var positions = typeof positions != 'undefined' ? positions : ['MGR','WN','DT','BK','MT','MB'];
		var names = typeof names != 'undefined' ? names : ['Nick','Jack','John','Jack','Kathy','Josephine','Jordy','Tina'];

		for (var i = 0; i < num; i++) {
			var position = positions[Math.floor(Math.random()*(positions.length))];
			var name = names[Math.floor(Math.random()*(names.length))];

			var minutes = Math.floor(Math.random()*2) * 30;			 //will return 0 or 30
			var hours = Math.floor(Math.random()*16) + 4;				 // Return from 4 - 20
			var length = (Math.floor(Math.random()*4) + 6) / 2;	//Can return lengths from 3 - 8 hours in half hour intervals

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
				id				: i,
				start		 : start.toString(),
				end			 : end.toString(),
				position	: position,
				employee	: name
			}

			shifts.push(o);
		}
		return shifts;
	},
	overlapping: function (a1, a2, b1, b2) {

		if (b1 < a1 && b2 <= a1)
			return 0;
		if (b1 >= a2 && b2 > a2)
			return 0;

		return 1;
	},
	amountOverlapping: function (s1, e1, s2, e2) {
		if (overlapping(s1, e1, s2, e2)) {
			if (s2 < e1) {// a is before a
				return (e1 - Math.max(s1, s2)) / (e1 - s1);
			} else { // b is before a
				return (e2 - Math.max(s1, s2)) / (e1 - s1);
			}
		}
		return 0;
	},
	highlightShifts: function (highlight, t, hoveredId) {
		indexes.crossMapping[t].forEach(function (s) {
			var t = d3.select(s);
			var id = t.attr("id");
			var y = t.attr("y") -1; //Not sure why this has to be -1
			if (highlight == 'select') {
				d3.select(indexes.shiftText[id].employeeName)
					.attr("fill", config.textColor)
					.attr("font-weight", "bold");
				d3.select(indexes.shiftText[id].position)
					.attr("fill", config.textColor)
					.attr("font-weight", "bold");

				d3.select(indexes.horizontalAreaMapping[y])
					.attr("fill","rgba(180,180,180,0.5)");

				t.attr("fill", function (d) {
					//I'll need to pass the id of the hovered shift for the comparative colouring.
					//if (typeof hoveredId != 'undefined') {
					//	return 'rgba(0, 0, 150, '+indexes.overlappingAmounts[hoveredId][d.id]+')';
					//}
					return t.property('baseColor');
				})
			} else if (highlight == 'unselect') {
				d3.select(indexes.shiftText[id].employeeName)
					.attr("fill", config.fadedTextColor)
					.attr("font-weight", "normal");
				d3.select(indexes.shiftText[id].position)
					.attr("fill", config.fadedTextColor)
					.attr("font-weight", "normal");
				d3.select(indexes.horizontalAreaMapping[y])
					.attr("fill","rgba(180,180,180,0)");

				t.attr("fill", t.property('transColor'));
			}
		})
	},
	hideUnmatching: function (id) {
		d3.selectAll(".shift")
			.transition()
			.duration(250)
			.attr("height", function(d) {
				if (id == '-1' || indexes.overlappingAmounts[id][d.id] != 0) {
					return config.barHeight - config.barPadding;
				} else {
					return 0;
				}
			});
	},

	resizeGraph: function (w) {

		//At this point shifts wont change; There min and max are not recalculated
		var xScale = d3.scale.linear()
			.domain([ min , max ])
			.range([config.leftPadding, w]);

		var widthScale = d3.scale.linear()
			.domain([ 0 , max - min ])
			.range([0, w-config.leftPadding]);

		var svg2 = d3.select(target)
					.select("svg")
					.transition()
					.duration(750)
					.style("width", w);

		svg2 = d3.select(target)
					.select("svg");

		svg2.selectAll("line.vertical")
			.transition()
			.duration(750)
			.attr("x1", function(d){return xScale(d);})
			.attr("x2", function(d){return xScale(d);});

		svg2.selectAll(".horizontalArea")
			.transition()
			.duration(750)
			.attr("width", w - config.leftPadding);

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
	},

	//Add in views for each shift in the schedule
	render: function () {
		$(this.el).attr('id','d'+this.model.get('datenum'));
		$(this.el).html(this.template(this.model.toJSON()));
		$('.scheduleFrame').remove(); //Remove iFrame  //If this is used iFrame will be removed from template and wont be necessary

		make(this.el, this.model.shifts);

		return $(this.el);
	}
});