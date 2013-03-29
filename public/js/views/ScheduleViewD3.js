$.ajax({
	url: '/positions',
	type: 'GET',
	success: function (res) {
		Scheduleme.data.positions = res.data.positions;
	}
})
//This may already be fetched by the bootstrap but im not sure and it doesnt really matter rightnow
$.ajax({
	url: '/employees',
	type: 'GET',
	success: function (res) {
		Scheduleme.data.employees = res.data.employees;
	}
})

Scheduleme.events = typeof Scheduleme.events != 'undefined' ? Scheduleme.events : {};

Scheduleme.events.editShift = function (id, mouseX, mouseY) {
	var e = new CustomEvent(
		"editShift",
		{
			detail: {
				id: id,
				x: mouseX,
				y: mouseY
			},
			bubbles: true,
			cancelable: true
		}
	);
	return e;
}

Scheduleme.events.modifiedShift = function (id, mouseX, mouseY) {
	var e = new CustomEvent(
		"modifiedShift",
		{
			detail: {
				id: id
			},
			bubbles: true,
			cancelable: true
		}
	);
	return e;
}

window.generateShifts = function (num, positions, names) {
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
			id			: i,
			start		: start.toUTCString(),
			end			: end.toUTCString(),
			position	: position,
			employee	: name
		}

		shifts.push(o);
	}
	return shifts;
};
window.onlyPositions = function (obj) {
	var tmp = [];
	obj.forEach( function (pos) {
		tmp.push(pos.position);
	})
	return tmp;
};
window.onlyNames = function (obj) {
	var tmp = [];
	obj.forEach( function (emp) {
		tmp.push(emp.first_name+' '+emp.last_name);
	})
	return tmp;
};
window.posToReference = function (obj, pos) {
	var id = undefined;
	obj.forEach( function (obj_pos) {
		if (pos.trim() == obj_pos.position.trim()) {
			id = obj_pos.position_id;
		}
	});
	return id;

};
window.nameToReference = function (obj,name) {
	var id = undefined;
	obj.forEach( function (emp) {
		if (name.trim() == (emp.first_name+' '+emp.last_name).trim()) {
			id = emp.employee_id;
		}
	});
	return id;
};
window.shiftsByReference = function (num) {
	var shifts = window.generateShifts(num, onlyPositions(Scheduleme.data.positions), onlyNames(Scheduleme.data.employees));

	shifts.forEach( function (shift) {
		shift.position = posToReference(Scheduleme.data.positions, shift.position);
		shift.employee = nameToReference(Scheduleme.data.employees, shift.employee);
		var s = new Date(shift.start);
		var e = new Date(shift.end);
		shift.start = s.getHours()*60+s.getMinutes();
		shift.end = e.getHours()*60+e.getMinutes();
	})

	return shifts;

};

Scheduleme.classes.views.ScheduleView.d3 = Backbone.View.extend({

	template: Handlebars.compile($('#schedule-template').html()),
	
	className: 'tab-pane',

	config: {
		hideUnmatchingOnClick	: 0,
		textColor				: '#000',
		fadedTextColor			: '#999',

		barHeight 				: 14,
		barPadding 				: 2,
		barRadius 				: 5,
		topPadding 				: 20,
		leftPadding 			: 100
	},
	indexes: {
		shiftMeta				: {},
		overlappingAmounts		: [],
		horizontalAreaMapping	: {},
		shiftText				: {},
		crossMapping 			: [],
		crossMappingId 			: []
	},
	//Create the frame
	initialize: function () {
		if (Scheduleme.meta.mobile) {
			this.el = $('#content');
		}
	},

	events: {
		"click rect.shift" : 'editShiftHandler',
		"click #save-editted-shift" : "saveModifiedShift"
	},
	createD3: function (target, dataset) {

		_this = this;

		if (!($(target).length)) throw new Error('');

		var width = Math.min($(window).width(), $(target).parent().width());
		var shiftInfoFontSize = _this.config.barHeight*(4/5);

		//var height = 500;
		var height = (dataset.length * _this.config.barHeight) + _this.config.topPadding;

		var w = width;
		var h = height;
		var h2 = h - _this.config.topPadding;

		// Sort schedules
		function compare(a,b) {
			//var as = new Date(a.start);
			//var bs = new Date(b.start);
			if (a.start < b.start)
				return -1;
			if (a.start > b.start)
				return 1;

			//var ae = new Date(a.end);
			//var be = new Date(b.end);

			if (a.end < b.end)
				return -1;
			if (a.end > b.end)
				return 1;
			return 0;
		}

		//Sort the positions. Right now it effectively does nothing, but I will implement ordering of positions in schedules and then this will order by that.
		Scheduleme.data.positions.sort(function (a, b) {
			if (a.position_id < b.position_id) {
				return -1;
			} else {
				return 1;
			}
		});

		//Seperate by shift, then sort. This is not efficient, and should probably be redone.
		var tmp = {};
		Scheduleme.data.positions.forEach( function (pos) {
			var position = pos.position;
			tmp[position] = [];
			dataset.forEach( function (d) {
				if (d.position == position) {
					tmp[position].push(d);
				}
			});
		});

		for (var key in tmp) {
			tmp[key].sort(compare);
		}

		dataset = $.map( tmp, function(n){
			 return n;
		});

		//dataset.sort(compare);

		dataset.forEach(function (shift) {
			_this.indexes.shiftMeta[shift.shift_id] = {}
				
				var s = new Date(shift.start);
				var sMin = s.getHours()*60+s.getMinutes();

			_this.indexes.shiftMeta[shift.shift_id].sMin = sMin;

				var e = new Date(shift.end);
				var eMin = e.getHours()*60+e.getMinutes();

			_this.indexes.shiftMeta[shift.shift_id].eMin = eMin;

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

		_this.config.min = min;
		_this.config.max = max;

		var xScale = d3.scale.linear()
				.domain([ min , max ])
				.range([_this.config.leftPadding, w]);

		var widthScale = d3.scale.linear()
				.domain([ 0 , max - min ])
				.range([0, w-_this.config.leftPadding]);

		// Create SVG element
		var svg2 = d3.select(target)
					.append("svg")
					.style("width", w)
					.style("height", h);


		var ylineData = d3.range(_this.config.topPadding - 1 + _this.config.barHeight, 
							(dataset.length * _this.config.barHeight) + _this.config.topPadding, 
							_this.config.barHeight);
		 
		var xlineData = d3.range(min, max, 30);

		var shiftOverlapping = function (d) {
			//Use default dataset if nothing else is provided
			d = typeof d != 'undefined' ? d : dataset;

			var overlapArray = [];

			d.forEach(function (x) {
				var sx = _this.indexes.shiftMeta[x.shift_id];
				overlapArray[x.shift_id] = [];
				d.forEach(function(y) {
					var sy = _this.indexes.shiftMeta[y.shift_id];
					overlapArray[x.shift_id][y.shift_id] = _this.amountOverlapping(sx.sMin, sx.eMin, sy.sMin, sy.eMin);
				})
			})

			return overlapArray;
		}

		_this.indexes.overlappingAmounts = shiftOverlapping();

		//I could probably make this faster by only highlighting rows taht are displayed in the current window (only applicable for very large schedules)
			//This would require rehighlighting on window scroll
		
		// Using the xaxiscoorddata to generate vertical lines.
		var gridVert = svg2.append("g").selectAll(".vertical")
			.data(xlineData)
			.enter().append("svg:line").attr("class", "vertical")
			.attr("x1", function(d){return xScale(d);})
			.attr("y1", _this.config.topPadding - 5)
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
			.attr("x", _this.config.leftPadding)
			.attr("y", function(d){
				_this.indexes.horizontalAreaMapping[d-_this.config.barHeight] = this;
				return d-_this.config.barHeight;
			})
			.attr("width", width)
			.attr("height", _this.config.barHeight)
			.attr("fill", "rgba(180,180,180,0)");

		// Using the yaxiscoorddata to generate horizontal lines.			 
		var gridHor = svg2.append("g").selectAll("line.horizontal")
			.data(ylineData)
			.enter().append("svg:line").attr("class", "horizontal")
			.attr("x1", _this.config.leftPadding)
			.attr("y1", function(d){return d;})
			.attr("x2", width)
			.attr("y2", function(d){return d;})
			.style("stroke", "rgb(200,200,200)")
			.style("stroke-width", 1);


		var gridVertAreas = svg2.append("g").selectAll(".verticalArea")
			.data(xlineData)
			.enter().append("svg:rect").attr("class", "verticalArea")
			.attr("x", function(d){return xScale(d);})
			.attr("y", _this.config.topPadding - 5)
			.attr("width", function(d){return widthScale(30);})
			.attr("height", h)
			.attr("fill", "rgba(180,180,180,0.1)")
			.on('mouseover', function (d) {
				//Highlight matching shifts
				d3.select(this).style("fill", "rgba(180,180,180,0.5)");

				_this.highlightShifts('select', d);

			})
			.on('mouseout', function (d) {
				d3.select(this).style("fill", "rgba(180,180,180,0.1)");
				
				_this.highlightShifts('unselect', d);

			})
			.on('click', function (d) {
				_this.$('#edit-area').hide();
				if (_this.config.hideUnmatchingOnClick) hideUnmatching(-1);
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
				return d.shift_id;
			})
			.attr("y", function(d, i) {
				return (i * _this.config.barHeight) + _this.config.topPadding;
			})
			.attr("x", function(d) {
				return xScale(d3.select(this).property('sMin'));
			})
			.attr("rx", _this.config.barRadius)
			.attr("ry", _this.config.barRadius)
			.attr("height", _this.config.barHeight - _this.config.barPadding)
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
				for (var key in _this.indexes.crossMapping) {
					if (key >= start && key <= end) {
						_this.highlightShifts('select', key, d.shift_id);
					}
				}

				//d3.select(this).attr("fill", d3.select(this).property('baseColor'));
			})
			.on('mouseout', function (d) {
				var that = d3.select(this);

				var start = that.property('sMin') - (that.property('sMin') % 30);
				var end = that.property('eMin') + (that.property('eMin') % 30);

				for (var key in _this.indexes.crossMapping) {
					if (key >= start && key <= end) {
						_this.highlightShifts('unselect', key);
					}
				}
				//d3.select(this).attr("fill", d3.select(this).property('transColor'));
			})
			.on('click', function (d) {
				//document.dispatchEvent(Scheduleme.events.editShift(d.shift_id, d3.event.x, d3.event.y));
				if (_this.config.hideUnmatchingOnClick) hideUnmatching(d.shift_id);
			});

		dataset.forEach( function (d) {
			_this.indexes.shiftText[d.shift_id] = {};
		})

		// Names
		var gridTextNames = svg2.append("g").selectAll(".employeeName")
			.data(dataset)
			.enter()
			.append("text").attr("class", "employeeName")
			.text(function(d) {
				_this.indexes.shiftText[d.shift_id].employeeName = this;
				return d.employee_name;
			})
			.attr("text-anchor", "start")
			.attr("y", function(d, i) {
				return i * _this.config.barHeight + 3 + _this.config.topPadding + (height / dataset.length - _this.config.barPadding) / 2;
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", shiftInfoFontSize+"px")
			.attr("fill", _this.config.fadedTextColor);

		//Associate left-text with shifts

		var gridTextPositions = svg2.append("g").selectAll(".shiftPositions")
			.data(dataset)
			.enter()
			.append("text").attr("class", "shiftPositions")
			.text(function(d) {
				//Associate text to shift here... I should probably do it in its own function but I'm not sure how
				_this.indexes.shiftText[d.shift_id].position = this;
				return d.position;
			})
			.attr("text-anchor", "end")
			.attr("y", function(d, i) {
				return i * _this.config.barHeight + 3 + _this.config.topPadding + (height / dataset.length - _this.config.barPadding) / 2;
			})
			.attr("x", function(d) {
				return _this.config.leftPadding-5;
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", shiftInfoFontSize+"px")
			.attr("fill", _this.config.fadedTextColor);

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
				return _this.config.topPadding - 10;
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
				var shift = _this.indexes.shiftMeta[s.shift_id];
				//console.log('overlap('+x+','+(x+30)+','+shift.sMin+','+shift.eMin+')');
				if (_this.overlapping(x, x+30, shift.sMin, shift.eMin)) {
					a.push(this);
					b.push(s.shift_id);
				}
			})
			_this.indexes.crossMapping[x]=a;
			_this.indexes.crossMappingId[x]=b;
		})
	},
	editShiftHandler: function (e) {
		_this = this;

		e.detail = {};

		var id = e.currentTarget.getAttribute('id');

		var mouseX = e.clientX;
		var mouseY = e.clientY;

		//Get shift information
		var shift = null;
		//If all the shifts can be saved as references (even after modification) I should make a shift index the first time a shift is being editted.
		if (typeof Scheduleme.Shifts == 'undefined') {
			Scheduleme.Shifts = {};

			Scheduleme.Schedules.forEach( function (schedule) {
				schedule.get('shifts').forEach( function (schedShift) {
					Scheduleme.Shifts[schedShift.shift_id] = schedShift;
				});
			});
		}

		shift = Scheduleme.Shifts[id];

		this.$('#edit-area').show();

		//This should be redone to use jquery (which will html escape the values)

		var output = [];
		Scheduleme.data.employees.forEach( function(employee) {
			output.push('<option value="'+employee.employee_id+'">'+employee.first_name+' '+employee.last_name+'</option>');
		});
		this.$('#employee-edit').html(output.join(''));

		output = [];
		Scheduleme.data.positions.forEach( function(position) {
			output.push('<option value="'+position.position_id+'">'+position.position+'</option>');
		});
		this.$('#position-edit').html(output.join(''));

		this.$('#shift-id-display').html(shift.shift_id);
		this.$('#employee-edit').val(shift.employee_id);
		this.$('#position-edit').val(shift.position_id);
		this.$('#start-time-edit').val(shift.start);
		this.$('#end-time-edit').val(shift.end);

		var rightDiff = $(window).width() - mouseX;
		var topDiff   = mouseY + $(document).scrollTop() - 40;
		var leftDiff  = mouseX;
		var botDiff   = $(document).height() - (mouseY + $(document).scrollTop());

		var boxWidth  = this.$('#edit-shift-popover').width();
		var boxHeight = this.$('#edit-shift-popover').height();

		var position = 'right';

		/*
		console.log('Right diff: '+rightDiff);
		console.log('top diff: '+topDiff);
		console.log('left diff: '+leftDiff);
		console.log('bottom diff: '+botDiff);
		console.log('Box Width: '+boxWidth);
		console.log('box height: '+boxHeight);
		*/
		if ( rightDiff > boxWidth && topDiff > boxHeight/2 && botDiff > boxHeight/2) {
			position = 'right';
		} else if ( topDiff > boxHeight && leftDiff > boxWidth/2 && rightDiff > boxWidth/2) {
			position = 'top';
		} else if ( botDiff > boxHeight && leftDiff > boxWidth/2 && rightDiff > boxWidth/2) {
			position = 'bottom';
		} else if ( leftDiff > boxWidth && topDiff > boxHeight/2 && botDiff > boxHeight/2) {
			position = 'left';
		} else {
			position = 'right';
		}

		this.$('#edit-shift-popover').removeClass('right left top bottom').addClass(position);

		if (position == 'right' || position == 'left') {
			this.$('#edit-shift-popover').css('top', (mouseY - boxHeight/2 + $(document).scrollTop() - 5 )+'px');
		} else if (position == 'top') {
			this.$('#edit-shift-popover').css('top', (mouseY - boxHeight + $(document).scrollTop() - 5 )+'px');
		} else if (position == 'bottom') {
			this.$('#edit-shift-popover').css('top', (mouseY + $(document).scrollTop() - 5 ) + 'px');
		}

		//Will have to adjust for horizontally scrolled pages
		if (position == 'top' || position == 'bottom') {
			this.$('#edit-shift-popover').css('left', (mouseX - boxWidth/2)+'px');
		} else if (position == 'left') {
			this.$('#edit-shift-popover').css('left', (mouseX - boxWidth)+'px');
		} else if (position == 'right') {
			this.$('#edit-shift-popover').css('left', mouseX + 'px');
		}

		//Based on x and y, determine if popover needs to be right, left, top, bottom. Default is right

	},
	saveModifiedShift: function (e) {
		e.preventDefault();
		_this = this;
		console.log('detected yeah.');
		$.ajax({
			url: '/shift/',
			type: 'PUT',
			data: $('#edit-shift-popover-form').serialize(),
			success: function (res) {
				console.log('success');
				_this.$('#edit-area').hide();
			}, 
			error: function (jqXHR) {
				console.log('error');
				_this.$('#edit-area').hide();
			}
		})
	},
	overlapping: function (a1, a2, b1, b2) {

		if (b1 < a1 && b2 <= a1)
			return 0;
		if (b1 >= a2 && b2 > a2)
			return 0;

		return 1;
	},
	amountOverlapping: function (s1, e1, s2, e2) {
		if (this.overlapping(s1, e1, s2, e2)) {
			if (s2 < e1) {// a is before a
				return (e1 - Math.max(s1, s2)) / (e1 - s1);
			} else { // b is before a
				return (e2 - Math.max(s1, s2)) / (e1 - s1);
			}
		}
		return 0;
	},
	highlightShifts: function (highlight, t, hoveredId) {
		_this.indexes.crossMapping[t].forEach(function (s) {
			var t = d3.select(s);
			var id = t.attr("id");
			var y = t.attr("y") -1; //Not sure why this has to be -1
			if (highlight == 'select') {
				d3.select(_this.indexes.shiftText[id].employeeName)
					.attr("fill", _this.config.textColor)
					.attr("font-weight", "bold");
				d3.select(_this.indexes.shiftText[id].position)
					.attr("fill", _this.config.textColor)
					.attr("font-weight", "bold");
				d3.select(_this.indexes.horizontalAreaMapping[y])
					.attr("fill","rgba(180,180,180,0.5)");

				t.attr("fill", function (d) {
					//I'll need to pass the id of the hovered shift for the comparative colouring.
					//if (typeof hoveredId != 'undefined') {
					//	return 'rgba(0, 0, 150, '+_this.indexes.overlappingAmounts[hoveredId][d.shift_id]+')';
					//}
					return t.property('baseColor');
				})
			} else if (highlight == 'unselect') {
				d3.select(_this.indexes.shiftText[id].employeeName)
					.attr("fill", _this.config.fadedTextColor)
					.attr("font-weight", "normal");
				d3.select(_this.indexes.shiftText[id].position)
					.attr("fill", _this.config.fadedTextColor)
					.attr("font-weight", "normal");
				d3.select(_this.indexes.horizontalAreaMapping[y])
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
				if (id == '-1' || _this.indexes.overlappingAmounts[id][d.shift_id] != 0) {
					return this.config.barHeight - this.config.barPadding;
				} else {
					return 0;
				}
			});
	},
	resizeGraph: function (w) {

		_this = this;

		var xScale = d3.scale.linear()
			.domain([ _this.config.min , _this.config.max ])
			.range([_this.config.leftPadding, w]);

		var widthScale = d3.scale.linear()
			.domain([ 0 , _this.config.max - _this.config.min ])
			.range([0, w-_this.config.leftPadding]);

		var svg2 = d3.select(_this.el)
					.select("svg")
					.transition()
					.duration(750)
					.style("width", w);

		svg2 = d3.select(_this.el)
				.select("svg");

		svg2.selectAll("line.vertical")
			.transition()
			.duration(750)
			.attr("x1", function(d){return xScale(d);})
			.attr("x2", function(d){return xScale(d);});

		svg2.selectAll(".horizontalArea")
			.transition()
			.duration(750)
			.attr("width", w - this.config.leftPadding);

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
		this.$('.scheduleFrame').remove(); //Remove iFrame  //If this is used iFrame will be removed from template and wont be necessary

		return $(this.el);
	},
	postRender: function () {
		var contentTarget = document.getElementById('d'+this.model.get('datenum'));
		this.createD3(contentTarget, this.model.get('shifts'));

		$(window).resize(function () {
			_this.resizeGraph(Math.min($(window).width(), $(_this.el).parent().width()));
		});

		$(this.el).on("modifiedShifts", function (e) {
			console.log('Caught modifedShift event');
		});
		this.el.addEventListener("modifedShift", function (e) {
			console.log('Caught modifedShift event - non jquery');
		}, false);
	}
});