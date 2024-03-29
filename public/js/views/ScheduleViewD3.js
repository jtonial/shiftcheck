(function () {
  
  "use strict";

  Shiftcheck.events = typeof Shiftcheck.events != 'undefined' ? Shiftcheck.events : {};

  Shiftcheck.events.editShift = function (id, mouseX, mouseY) {
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
  };

  Shiftcheck.events.modifiedShift = function (id, mouseX, mouseY) {
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
  };

  function _getMinutes (string) {
    var hours = parseInt(string.substr(0, string.indexOf(':')));
    if (string.indexOf('P') > 0 && hours != 12) {
      hours += 12;
    }
    var minutes = parseInt(string.substring(string.indexOf(':')+1, string.indexOf(':')+3));

    return (hours*60)+minutes;
  }
  function _getTimestring (minutes) {
    var hours = Math.floor(minutes / 60);
    var minutes = minutes % 60;

    var ampm = hours < 12 ? 'AM' : 'PM';

    if (hours == 12 && ampm == 'AM') {
      console.log('here');
      hours = 12;
    }

    hours = hours % 12;

    if (hours < 10) hours = '0'+hours;
    if (minutes < 10) minutes = '0'+minutes;

    var string = ''+hours+':'+minutes+' '+ampm;

    return string;
  }
  function _makeRGBa (rgb, trans) {
    return 'rgba('+rgb.r+','+rgb.g+','+rgb.b+','+trans+')';
  }

  Shiftcheck.classes.views.ScheduleView.d3 = Shiftcheck.classes.views.ScheduleBaseView.extend({

    template: Handlebars.compile($('#schedule-template-d3').html()),
    
    initialize: function () {
      _.bind(this.focusOnShift, this);

      //this.listenTo(this.model, 'change', this.render);
    },

    config: {
      hideUnmatchingOnClick  : 0,
      textColor        : '#000',
      fadedTextColor   : '#999',

      barHeight        : 14,
      barPadding       : 2,
      barRadius        : 5,
      topPadding       : 20,
      leftPadding      : 100,

      name_length      : 11,

      shadeToOverlapping : false,
      focusOnShift     : false,
      baseShiftColor   : {
        r : 0,
        g : 0,
        b : 150
      }

    },
    indexes: {
      shiftMeta        : {},
      overlappingAmounts : [],
      horizontalAreaMapping : {},
      shiftText        : {},
      crossMapping     : [],
      crossMappingId   : []
    },

    events: {
      "click #save-shift-trigger" : "saveModifiedShift",
      "click #delete-shift-trigger" : "deleteShift",
      "click #view-shift-history-trigger" : "viewShiftHistory",

      "click #add_shift_trigger" : "addShift",

      "click rect.shift" : 'editShiftHandler',

      "click #unfocus-trigger" : "unfocus",

      "click #save-schedule" : "saveSchedule",
      "click #delete-schedule" : "deleteSchedule",
      "click #publish-trigger" : "publishSchedule",
      "click #unpublish-trigger" : "unpublishSchedule"
    },

    truncate: function (s) {
      if ( s.length <= this.config.name_length ) {
        return s;
      } else {
        return s.substring(0, this.config.name_length - 3)+'...';
      }
    },
    generateShiftMeta: function (dataset) {

      var _this = this;

      _this.indexes.shiftMeta = {};

      dataset.forEach(function (shift) {
        _this.indexes.shiftMeta[shift.id] = {};
          
          var sMin = shift.start;

        _this.indexes.shiftMeta[shift.id].sMin = sMin;

          var eMin = shift.end;

        _this.indexes.shiftMeta[shift.id].eMin = eMin;

      });
    },
    overlapping: function (a1, a2, b1, b2) {

      if (b1 < a1 && b2 <= a1)
        return 0;
      if (b1 >= a2 && b2 > a2)
        return 0;

      return 1;
    },
    amountOverlapping: function (s1, e1, s2, e2) {
      var l1 = e1 - s1;
      var l2 = e2 - s1;

      if (this.overlapping(s1, e1, s2, e2)) {
        if (s1 == s2 && e1 == e2) {
          return 1; // The shifts are the same
        } else if (s1 <= s2 && e1 <= e2) {// a is before a
          return (e1 - s2) / (e1 - s1);
        } else if (s1 >= s2 && e1 <= e2) {
          return (e1 - s1) / (e1 - s1);
        } else if (s1 >= s2 && e1 >= e2) { // b is before a
          return (e2 - s1) / (e1 - s1);
        } else if (s1 <= s2 && e1 >= e2) {
          return (e2 - s2) / (e1 - s1);
        }
      }
      return 0;
    },
    generateOverlappingAmounts: function (dataset) {

      var _this = this;

      _this.indexes.overlappingAmounts = [];

      dataset.forEach(function (x) {
        var sx = _this.indexes.shiftMeta[x.id];
        _this.indexes.overlappingAmounts[x.id] = [];
        dataset.forEach(function(y) {
          var sy = _this.indexes.shiftMeta[y.id];
          _this.indexes.overlappingAmounts[x.id][y.id] = _this.amountOverlapping(sx.sMin, sx.eMin, sy.sMin, sy.eMin);
        });
      });
    },
    generateHorizontalAreaMapping: function (dataset) {
    },
    generateShiftText: function (dataset) {
    },
    /*
      Will generate crossMapping and crossMappingId
    */
    generateCrossMapping: function (d3Objects, xlineData) {

      var _this = this;

      var dataset = _this.model.Shifts.toJSON();

      xlineData.forEach(function (x) {
        var a = [];
        var b = [];
        d3Objects.each(function (s) {
          var shift = _this.indexes.shiftMeta[s.id];
          // The '30' is because that is the width of the vertical ranges, and should be a config instead of hard-coded here
          // Check that the shift exists; this is because when deleting the d3Object will still be fading, thus exist for a bit after the model is destroyed
          if (shift && _this.overlapping(x, x+30, shift.sMin, shift.eMin)) {
            a.push(this);
            b.push(s.id);
          }
        });

        _this.indexes.crossMapping[x]=a;
        _this.indexes.crossMappingId[x]=b;
      });
    },

    generateIndexes: function (dataset, d3Objects, xlineData) {
      this.generateShiftMeta(dataset);
      this.generateOverlappingAmounts(dataset);
      this.generateHorizontalAreaMapping(dataset);
      this.generateShiftText(dataset);

      // Currently crossMappings must be generated afterwards (because it depends on the shifts rendered)
        // I should be able to change it to just use the shiftMeta instead of the d3 objects
      //this.generateCrossMapping(d3Objects, xlineData);

    },

    createD3: function (target) {

      var _this = this;

      var dataset = _this.model.Shifts.toJSON();

      window.test = _this;


      if (!($(target).length)) throw new Error('');

      //Use the window width if parent with comes back as 0 (hack for jquery mobile seeming to leave not fully visible pages with a width of 0)
      var width = Math.min($(window).width(), $(target).parent().width()) || $(window).width() - 30;
      var height = (dataset.length * _this.config.barHeight) + _this.config.topPadding;

      _this.config.height = height;

      // Create SVG element
      var canvas = d3.select(target)
        .append("svg")
        .style("width", width)
        .style("height", height);

      _this.redraw();

    },

    redraw: function (dataset) {

      var _this = this;

      dataset = dataset || _this.model.Shifts.toJSON();

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

      //Seperate by shift, then sort. This is not efficient, and should probably be redone.
      var tmp = {};
      Shiftcheck.Positions.forEach( function (pos) {
        var position = pos.get('position');
        tmp[position] = [];
        dataset.forEach( function (d) {
          if (d.position == position) {
            tmp[position].push(d);
          }
        });
      });

      for (var key in tmp) { tmp[key].sort(compare); }

      dataset = $.map( tmp, function(n){ return n; });

      //Note min will always the the first element. Max is not guaranteed to be the last
      var min = d3.min(dataset, function (d) { return d.start; });
      var max = d3.max(dataset, function(d) { return d.end; });

      _this.config.min = min;
      _this.config.max = max;


      var width = Math.min($(window).width(), _this.$el.width()) || $(window).width() - 30;
      var height = (dataset.length * _this.config.barHeight) + _this.config.topPadding; // _this.config.height;


      var shiftInfoFontSize = _this.config.barHeight*(4/5);


      var ylineData = d3.range(_this.config.topPadding - 1 + _this.config.barHeight,
                (dataset.length * _this.config.barHeight) + _this.config.topPadding,
                _this.config.barHeight);
      var xlineData = d3.range(min, max, 30);

      var xScale = d3.scale.linear()
        .domain([ _this.config.min , _this.config.max ])
        .range([_this.config.leftPadding, width]);

      var widthScale = d3.scale.linear()
        .domain([ 0 , _this.config.max - _this.config.min ])
        .range([0, width-_this.config.leftPadding]);




      // IDEXES::: shiftMeta, overlappingAmounts
      dataset.forEach( function (d) { _this.indexes.shiftText[d.id] = {}; });

      _this.generateShiftMeta(dataset);
      _this.generateOverlappingAmounts(dataset);


      //  CANVAS---------------------------------------------------
      var canvas = d3.select(_this.el)
        .select("svg");
        // Update
        canvas.transition()
          .duration(750)
          .style("width", width)
          .style("height", height);

      //  VERTICAL LINES--------------------------------------------
      var verticalLines = canvas.selectAll("line.vertical")
        .data(xlineData);
        // Enter
        verticalLines.enter()
          .append("svg:line").attr("class", "vertical")
          .attr("x1", function(d){return xScale(d);})
          .attr("y1", _this.config.topPadding - 5)
          .attr("x2", function(d){return xScale(d);})
          .attr("y2", height)
          .style("stroke", function (d) {
            //I should really precalculate this and save it into the model
            var s = new Date(d.start);
            var sMin = s.getHours()*60+s.getMinutes();
            //var sMin = d.start;

            //console.log ('mod: '+s.getMinutes());
            if (sMin % 60 === 0) {
              return "rgb(200,200,200)";
            } else {
              return "rgba(200,200,200,0.5)";
            }
          })
          .style("stroke-width", 1);
        // Update
        verticalLines.transition()
          .duration(750)
          .attr("x1", function(d){return xScale(d);})
          .attr("x2", function(d){return xScale(d);})
          .attr("y2", height);
        // Delete
        verticalLines.exit()
          .remove();

      //  HORIZONTAL AREAS--------------------------------------------
      var horizontalAreas = canvas.selectAll(".horizontalArea")
        .data(ylineData);
        // Enter
        horizontalAreas.enter()
          .append("svg:rect").attr("class", "horizontalArea")
          .attr("x", _this.config.leftPadding)
          .attr("y", function(d){
            _this.indexes.horizontalAreaMapping[d-_this.config.barHeight] = this;
            return d-_this.config.barHeight;
          })
          .attr("width", width)
          .attr("height", _this.config.barHeight)
          .attr("fill", "rgba(180,180,180,0)");
        // Update
        horizontalAreas.transition()
          .duration(750)
          .attr("x", _this.config.leftPadding)
          .attr("y", function(d){
            _this.indexes.horizontalAreaMapping[d-_this.config.barHeight] = this;
            return d-_this.config.barHeight;
          })
          .attr("width", width)
          .attr("height", _this.config.barHeight)
          .attr("fill", "rgba(180,180,180,0)");
        // Delete
        horizontalAreas.exit()
          .remove();

      //  HORIZONTAL LINES--------------------------------------------
      var horizontalLines = canvas.selectAll("line.horizontal")
        .data(ylineData);
        // Enter
        horizontalLines.enter()
          .append("svg:line").attr("class", "horizontal")
          .attr("x1", _this.config.leftPadding)
          .attr("y1", function(d){return d;})
          .attr("x2", width)
          .attr("y2", function(d){return d;})
          .style("stroke", "rgb(200,200,200)")
          .style("stroke-width", 1);
        // Update
        horizontalLines.transition()
          .duration(750)
          .attr("x2", function(d){ return width; });
        // Delete
        horizontalLines.exit()
          .remove();

      //  VERTICAL AREAS--------------------------------------------
      var verticalAreas = canvas.selectAll(".verticalArea")
        .data(xlineData);
        // Enter
        verticalAreas.enter()
          .append("svg:rect").attr("class", "verticalArea")
          .attr("x", function(d){return xScale(d);})
          .attr("y", _this.config.topPadding - 5)
          .attr("width", function(d){return widthScale(30);})
          .attr("height", height)
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
        // Update
        verticalAreas.transition()
          .duration(750)
          .attr("x", function(d){return xScale(d);})
          .attr("width", function(d){return widthScale(30);})
          .attr("height", height);
        // Delete
        verticalAreas.exit()
          .remove();

      //  SHIFTS----------------------------------------------------
      var shifts = canvas.selectAll(".shift")
        .data(dataset, function(d) { return d.id; });
        // Enter
        shifts.enter()
          .append("rect").attr("class", "shift")
          // These probably don't actually have to be set anymore, but I'll
            // deal with this later
          .property("sMin", function (d, i) {
            return d.start;
          })
          .property("eMin", function (d, i) {
            return d.end;
          })
          .property('transColor', function (d, i) {
            return _makeRGBa(_this.config.baseShiftColor, 0.6);
          })
          .property('baseColor', function (d, i) {
            return _makeRGBa(_this.config.baseShiftColor, 0.9);
          })
          .attr("id", function (d) {
            return d.id;
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

            var width = eMin - sMin;

            return width > 0 ? widthScale(width) : widthScale(10);
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
                _this.highlightShifts('select', key, d.id);
              }
            }
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
          })
          .on('click', function (d) {
            //document.dispatchEvent(Shiftcheck.events.editShift(d.id, d3.event.x, d3.event.y));
            if (_this.config.hideUnmatchingOnClick) hideUnmatching(d.id);
          })
          .on('dblclick', function (d) {
            if (_this.config.focusOnShift) {
              var id = d.id;

              var tmp = _this.model.Shifts.filter( function (s) { return _this.indexes.overlappingAmounts[d.id][s.id]; });

              _this.$('#edit-area').hide();

              // The parse(stringify()) is necessary (well, the easiest way) to get the proper object
              _this.redraw(JSON.parse(JSON.stringify(tmp)));
            }
          });

        // Update
        shifts.transition()
          .duration(750)
          .attr("x", function(d) {
            return xScale(_this.indexes.shiftMeta[d3.select(this).property('id')].sMin);
          })
          .attr("y", function(d, i) {
            return (i * _this.config.barHeight) + _this.config.topPadding;
          })
          .attr("width", function(d) {
            var sMin = _this.indexes.shiftMeta[d3.select(this).property('id')].sMin;
            var eMin = _this.indexes.shiftMeta[d3.select(this).property('id')].eMin;

            var width = eMin - sMin;

            return width > 0 ? widthScale(width) : widthScale(10);
          });
        // Delete
        shifts.exit()
          .transition()
          .duration(750)
          .attr("height", 0)
          .remove();

      dataset.forEach( function (d) { _this.indexes.shiftText[d.id] = {}; });

      //  EMPLOYEE NAMES------------------------------------------------
      var employeeNames = canvas.selectAll('.employeeName')
        .data(dataset, function(d) { return d.id; });
        // Enter
        employeeNames.enter()
          .append("text").attr("class", "employeeName")
          .text(function(d) {
            // This is a reference to the text itself, and thus can't be indexed before rendering
            _this.indexes.shiftText[d.id].employeeName = this;
            return _this.truncate(d.employee_name);
          })
          .attr("text-anchor", "start")
          .attr("y", function(d, i) {
            return i * _this.config.barHeight + 3 + _this.config.topPadding + (height / dataset.length - _this.config.barPadding) / 2;
          })
          .attr("font-family", "sans-serif")
          .attr("font-size", shiftInfoFontSize+"px")
          .attr("fill", _this.config.fadedTextColor);
        // Update
        employeeNames.transition()
          .duration(750)
          .text(function(d) {
            // This is a reference to the text itself, and thus can't be indexed before rendering
            _this.indexes.shiftText[d.id].employeeName = this;
            return _this.truncate(d.employee_name);
          })
          .attr("y", function(d, i) {
            return i * _this.config.barHeight + 3 + _this.config.topPadding + (height / dataset.length - _this.config.barPadding) / 2;
          });
        // Delete
        employeeNames.exit()
          .transition()
            .duration(750)
            .attr("font-size", "0px")
          .remove();

      // SHIFT POSITIONS-------------------------------------------------
      var shiftPositions = canvas.selectAll(".shiftPositions")
        .data(dataset, function(d) { return d.id; });
        // ENTER
        shiftPositions.enter()
          .append("text").attr("class", "shiftPositions")
          .text(function(d) {
            //Associate text to shift here... I should probably do it in its own function but I'm not sure how
            _this.indexes.shiftText[d.id].position = this;
            return d.position;
          })
          .attr("text-anchor", "end")
          .attr("x", function(d) {
            return _this.config.leftPadding-5;
          })
          .attr("y", function(d, i) {
            return i * _this.config.barHeight + 3 + _this.config.topPadding + (height / dataset.length - _this.config.barPadding) / 2;
          })
          .attr("font-family", "sans-serif")
          .attr("font-size", shiftInfoFontSize+"px")
          .attr("fill", _this.config.fadedTextColor);
        // UPDATE
        shiftPositions.transition()
          .duration(750)
          .text(function(d) {
            //Associate text to shift here... I should probably do it in its own function but I'm not sure how
            _this.indexes.shiftText[d.id].position = this;
            return d.position;
          })
          .attr("y", function(d, i) {
            return i * _this.config.barHeight + 3 + _this.config.topPadding + (height / dataset.length - _this.config.barPadding) / 2;
          });
        // DELETE
        shiftPositions.exit()
          .transition()
            .duration(750)
            .attr("font-size", "0px")
          .remove();

      // GRID TIMES----------------------------------------------------
      var gridTimes = canvas.selectAll("text.times")
        .data(xlineData);
        // ENTER
        gridTimes.enter()
          .append("text").attr("class", "times")
          .text(function(d) {
            var tmp = new Date();
            tmp.setHours(Math.floor(d / 60));
            tmp.setMinutes(d % 60);
            var hours = (Math.floor(d / 60)) % 12;
            if (hours === 0) {
              hours = 12;
            }
            var minutes = ("0" + (d%60)).slice(-2);

            if (minutes % 60 === 0) {
              return hours;//+':'+minutes;
            }

            return '';
          })
          //.attr("text-anchor", "right")
          .attr("y", function(d, i) {
            return _this.config.topPadding - 10;
          })
          .attr("x", function(d) {
            return xScale(d)-3;//12;
          })
          .attr("font-family", "sans-serif")
          .attr("font-size", "9px")
          .attr("fill", "black");
        // UPDATE
        gridTimes.transition()
          .duration(750)
          .text(function(d) {
            var tmp = new Date();
            tmp.setHours(Math.floor(d / 60));
            tmp.setMinutes(d % 60);
            var hours = (Math.floor(d / 60)) % 12;
            if (hours === 0) {
              hours = 12;
            }
            var minutes = ("0" + (d%60)).slice(-2);

            if (minutes % 60 === 0) {
              return hours;//+':'+minutes;
            }

            return '';
          })
          .attr("x", function(d) {
            return xScale(d)-3;//12;
          });
        // DELETE
        gridTimes.exit()
          .remove();


      // INDEXES::: crossMapping/crossMappingId
      _this.generateCrossMapping(d3.selectAll(".shift"), xlineData);

    },





    focus: function (e) {
      var id = e.currentTarget.getAttribute('id');
      
      this.focusOnShift(id);

    },

    focusOnShift: function (id) {
      if (this.config.focusOnShift) {
        var tmp = this.model.Shifts.filter( function (d) { return this.indexes.overlappingAmounts[36][id]; });

        this.$('#edit-area').hide();

        // The parse(stringify()) is necessary (well, the easiest way) to get the proper object
        this.redraw(JSON.parse(JSON.stringify(tmp)));
      }
    },

    unfocus: function () {
      this.redraw();
    },

    editShiftHandler: function (e) {
      if (Shiftcheck.meta.ADMIN) {
        var _this = this;

        var sidebarLeft  = $('#sidebar').css('left');
        if (sidebarLeft == 'auto') sidebarLeft = '0';
        var sidebarLeft = parseInt(sidebarLeft);
        var sidebarWidth = $('#sidebar').width() + sidebarLeft;
        var headerHeight = $('#content-header').height();

        var id = e.currentTarget.getAttribute('id');

        var d3OffsetX = $(this.el).position().left;
        var d3OffsetY = $(this.el).position().top;

        var mouseX = e.clientX - sidebarWidth;
        var mouseY = e.clientY - headerHeight + $('#content-content').scrollTop() + 1;

        var buffer = 10;

        var shift = this.model.Shifts.get(id);


        //----------------------------------------------------
        // This should be replaced with a view

        this.$('#edit-area').show();

        //This should be redone to use jquery (which will html escape the values)

        var output = [];
        Shiftcheck.Employees.forEach( function(employee) {
          output.push('<option value="'+employee.get('id')+'">'+employee.get('first_name')+' '+employee.get('last_name')+'</option>');
        });
        this.$('#employee-edit').html(output.join(''));

        output = [];
        Shiftcheck.Positions.forEach( function(position) {
          output.push('<option value="'+position.get('id')+'">'+position.get('position')+'</option>');
        });
        this.$('#position-edit').html(output.join(''));

        this.$('#shift-id-display').html(shift.id);
        this.$('#employee-edit').val(shift.get('employee_id'));
        this.$('#position-edit').val(shift.get('position_id'));

        this.$('#start-time-edit').timepicker('setTime', _getTimestring(shift.get('start')));
        this.$('#end-time-edit').timepicker('setTime', _getTimestring(shift.get('end')));

        //----------------------------------------------------

        var rightDiff = $('#content-content').width() - mouseX;
        var topDiff   = mouseY + $('#content-content').scrollTop() - 40;
        var leftDiff  = mouseX;
        var botDiff   = $(document).height() - 40 - (mouseY + $('#content-content').scrollTop());

        var boxWidth  = this.$('#edit-shift-popover').width();
        var boxHeight = this.$('#edit-shift-popover').height();

        var position  = 'right';

        /*
        console.log('Right diff:  '+rightDiff);
        console.log('top diff:    '+topDiff);
        console.log('left diff:   '+leftDiff);
        console.log('bottom diff: '+botDiff);
        console.log('Box Width:   '+boxWidth);
        console.log('box height:  '+boxHeight);
        */

        if ( rightDiff > boxWidth-buffer && topDiff > boxHeight/2-buffer && botDiff > boxHeight/2-buffer) {
          mouseX++;
          position = 'right';
        } else if ( topDiff > boxHeight-buffer && leftDiff > boxWidth/2-buffer && rightDiff > boxWidth/2-buffer) {
          mouseY--;
          position = 'top';
        } else if ( botDiff > boxHeight-buffer && leftDiff > boxWidth/2-buffer && rightDiff > boxWidth/2-buffer) {
          mouseY+=8;
          position = 'bottom';
        } else if ( leftDiff > boxWidth-buffer && topDiff < boxHeight/2+buffer && botDiff > boxHeight/2-buffer) {
          mouseX-=4;
          position = 'left';
        } else {
          mouseX++;
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

      }
    },
    saveModifiedShift: function (e) {
      e.preventDefault();
      var _this = this;
      var id = $('#shift-id-display').html();
      var shift = _this.model.Shifts.get(id);

      var employee_id = $('#employee-edit').val();
      var position_id = $('#position-edit').val();

      var start       = _getMinutes($('#start-time-edit').val());
      var end         = _getMinutes($('#end-time-edit').val());

      var employee = Shiftcheck.Employees.get(employee_id);
      var position = Shiftcheck.Positions.get(position_id);

      shift.save({
        employee_id : employee_id,
        position_id : position_id,
        start       : start,
        end         : end
      }, {
        wait: true,
        success: function () {
          shift.set({
            employee_name : employee.get('first_name')+' '+employee.get('last_name'),
            position      : position.get('position')
          });
        }
      });

      _this.$('#edit-area').hide();

    },

    saveSchedule: function (e) {

      var newTimezone = $('#timezone').val();

      // I need to write in some client-side validation here

      this.model.save({
        timezone : newTimezone
      }, {
        wait: true
      });
    },
    deleteSchedule: function (e) {
      console.log('flag');
      this.model.destroy({
        wait: true ,
        success: function (model, response) {
          console.log('navigating to first schedule');
          // Hack for now
          location.reload();
        },
        error: function (something) {
          alert('schedule delete failed');
        }
      });
    },
    publishSchedule: function (e) {
      this.model.save({
        published: 1
      },{
        wait: true ,
        success: function (model, response) {
          $('#publish-trigger').hide();
          $('#unpublish-trigger').show();
        }
      });
    },
    unpublishSchedule: function (e) {
      this.model.save({
        published: 0
      },{
        wait: true ,
        success: function (model, response) {
          $('#publish-trigger').show();
          $('#unpublish-trigger').hide();
        }
      });
    },
    deleteShift: function (e) {
      e.preventDefault();
      var _this = this;
      var id = $('#shift-id-display').html();

      _this.model.Shifts.get(id).destroy({ wait: true });

      _this.$('#edit-area').hide();

    },
    viewShiftHistory: function (e) {
      console.log('Viewing shift history');
    },
    highlightShift: function (highlight, s, hoveredId) {

      var _this = this;

      var t = d3.select(s);
      var id = t.attr("id");
      var y = t.attr("y") -1; //Not sure why this has to be -1
      if (highlight == 'select') {
        var overlap = 1;
        if (typeof hoveredId != 'undefined') {
          overlap = _this.indexes.overlappingAmounts[hoveredId][id];
        }

        if (overlap) {
          d3.select(_this.indexes.shiftText[id].employeeName)
            .attr("fill", _this.config.textColor)
            .attr("font-weight", "bold");
          d3.select(_this.indexes.shiftText[id].position)
            .attr("fill", _this.config.textColor)
            .attr("font-weight", "bold");
          d3.select(_this.indexes.horizontalAreaMapping[y])
            .attr("fill","rgba(180,180,180,0.5)");
        }

        t.attr("fill", function (d) {
          //I'll need to pass the id of the hovered shift for the comparative colouring.
          if (typeof hoveredId != 'undefined') {
            return _makeRGBa(_this.config.baseShiftColor, overlap);
          }
          return t.property('baseColor');
        });
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
    },
    highlightShifts: function (highlight, i, hoveredId) {

      var _this = this;

      if (highlight == 'select') {
        if (typeof hoveredId != 'undefined' && _this.config.shadeToOverlapping ) {
          //_this.indexes.crossMapping[i].forEach(function (s) {
          d3.selectAll(".shift")[0].forEach(function (s) {
            _this.highlightShift(highlight, s, hoveredId);
          });
        } else {
          _this.indexes.crossMapping[i].forEach(function (s) {
            _this.highlightShift(highlight, s);
          });
        }
      } else {
        d3.selectAll(".shift")[0].forEach(function (s) {
          _this.highlightShift(highlight, s, hoveredId);
        });
      }
    },

    hideUnmatching: function (id) {
      d3.selectAll(".shift")
        .transition()
        .duration(250)
        .attr("height", function(d) {
          if (id == '-1' || _this.indexes.overlappingAmounts[id][d.id] !== 0) {
            return this.config.barHeight - this.config.barPadding;
          } else {
            return 0;
          }
        });
    },

    //I only seem to do this once (when a shift is added), so redrawing the whole thing isn't necessary
      // I should only redraw it (I will still need to recalc the indexes, but I will seperate that into a different function for reuse)
    reRender: function () {
      console.log('rerendering');

      // Wipe old indexes
      this.indexes = {
        shiftMeta        : {},
        overlappingAmounts : [],
        horizontalAreaMapping : {},
        shiftText        : {},
        crossMapping     : [],
        crossMappingId   : []
      };

      var contentTarget = document.getElementById('d3Target');
      $(contentTarget).html('');

      // Here I think I should pass this.model.Shifts, and take the toJSON inside the function
      this.createD3(contentTarget);

    },

    renderD3: function () {

      var contentTarget = document.getElementById('d3Target');

      this.createD3(contentTarget);
    },
    postRender: function () {
      var _this = this;

      this.renderD3();

      if (Shiftcheck.meta.ADMIN) {
        // Deactivated temporaraly as bs3 does not include a typeahead by default
        var employeeMapFunction = function (e) {
          return {
            value   : e.get('first_name')+' '+e.get('last_name') ,
            tokens  : [
              e.get('first_name') ,
              e.get('last_name')
            ] ,
            name    : e.get('first_name')+' '+e.get('last_name')
          };
        };
        var positionMapFunction = function (p) {
          return {
            value   : p.get('position') ,
            tokens  : [
              p.get('full_name') ,
            ] ,
            name    : p.get('full_name') ,
            description : p.get('description')
          };
        };

        $('#new_shift_employee').typeahead({
          local: Shiftcheck.Employees.map( employeeMapFunction )
        });

        $('#new_shift_position').typeahead({
          local: Shiftcheck.Positions.map( positionMapFunction )
        });

        $('#new_shift_start_time').timepicker({
            minuteStep: 15
        });
        $('#new_shift_end_time').timepicker({
            minuteStep: 15
        });

        $('#new_shift_start_time').timepicker().on('changeTime.timepicker', function(e) {
          _this.new_shift_start_time = e.time;
        });
        $('#new_shift_end_time').timepicker().on('changeTime.timepicker', function(e) {
          _this.new_shift_end_time = e.time;
        });

        $('#start-time-edit').timepicker({
            minuteStep: 15
        });
        $('#end-time-edit').timepicker({
            minuteStep: 15
        });

        if (_this.model.get('published')) {
          $('#publish-trigger').hide();
        } else {
          $('#unpublish-trigger').hide();
        }

      }

      $(this.el).on("modifiedShifts", function (e) {
        console.log('Caught modifedShift event');
      });
      this.el.addEventListener("modifedShift", function (e) {
        console.log('Caught modifedShift event - non jquery');
      }, false);

    },

    addShift: function () {

      var _this = this;
      /**
        THIS SHOULD REALLY ALL BE DONE IN A BACKBONE MODEL/COLLECTION 
      */
      //Validate Shift
      var employee = $('#new_shift_employee').val();
      var position = $('#new_shift_position').val();
      var start_time = $('#new_shift_start_time').val();
      var end_time = $('#new_shift_end_time').val();

      var timeRegex = '/^\d{1,}:(?:[0-5]\d)(am|pm)$/';

      var errors = [];

      if ( Shiftcheck.Employees.map( function (e) { return e.get('first_name')+' '+e.get('last_name'); }).indexOf(employee) < 0 ) {
        errors.push('Employee invalid');
      }
      if ( Shiftcheck.Positions.pluck('position').indexOf(position) < 0 ) {
        errors.push('Position invalid');
      }
      /*if ( !start_time.match(/^\d{1,}:(?:[0-5]\d)(am|pm)$/) ) {
        errors.push('Start Time invalid');
      }
      if ( !end_time.match(/^\d{1,}:(?:[0-5]\d)(am|pm)$/) ) {
        errors.push('End Time invalid');
      }*/
      if ( !start_time ) {
        errors.push('Start Time invalid');
      }
      if ( !end_time ) {
        errors.push('End Time invalid');
      } else {
        var start       = _getMinutes(start_time);
        var end         = _getMinutes(end_time);
        if (end <= start) {
          errors.push('Invalid: End time must be greater than start time');
        }
      }

      if (errors.length) {
        alert(errors.join('\n'));
      } else {
        var schedule_id = _this.model.id;
        var employee_id = Shiftcheck.Employees.find(function (e) { return e.get('first_name')+' '+e.get('last_name') == employee; }).id;
        var position_id = Shiftcheck.Positions.find(function (p) { return p.get('position') == position; }).id;

        var start       = _getMinutes(start_time);
        var end         = _getMinutes(end_time);

        // This should be done by creating it on the collection
        _this.model.Shifts.create({
          schedule_id   : schedule_id,
          employee_id   : employee_id,
          employee_name : employee,
          position_id   : position_id,
          position      : position,
          start         : start,
          end           : end
        }, {
          wait: true,
          beforeSend: function (request) {
            $('#add_shift_trigger').attr('disabled', true);
          },
          success: function (res) {
            _this.resetAddFields();
          },
          complete: function () {
            $('#add_shift_trigger').removeAttr('disabled');
          }
        });

      }
    },
    resetAddFields: function () {
      $('#new_shift_employee').val('');
      $('#new_shift_position').val('');
      $('#new_shift_start_time').val('');
      $('#new_shift_end_time').val('');
    }

  });
})();
