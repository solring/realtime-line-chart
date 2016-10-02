'use strict';

function realTimeLine() {

  var datum = [], line, paths,
    svgWidth = 900, svgHeight = 500,
    width, height,
    category = ["default"], groups = [],
    colors = ["#0066ff", "#ff0099", "#00cc33"],
    xAxisG, yAxisG, x_axis, y_axis, x_scale, y_scale,
    margin = { top: 20, bottom: 20, left: 100, right: 30, topNav: 10, bottomNav: 20 },
    dimension = { chartTitle: 20, xAxis: 20, yAxis: 20, xTitle: 18, yTitle: 18 },
    chartTitle, xTitle, yTitle,
    svg, selection,
    duration = 750, limit = 200,
    maxValue;

  var chart = function(s) {
    selection = s;
    var now = new Date();
    
    // make groups
    var i;
    for (i = 0; i < category.length; i++) {
        groups.push({
          name: category[i],
          color: colors[ i % colors.length ],
          data: d3.range(limit).map(function(i) {
            return {time: now - (limit - 1 - i) * duration, value:0};
          })
        });
    }

    // compute component dimensions
    var chartTitleDim = chartTitle == "" ? 0 : dimension.chartTitle,
        xTitleDim = xTitle == "" ? 0 : dimension.xTitle,
        yTitleDim = yTitle == "" ? 0 : dimension.yTitle,
        xAxisDim = dimension.xAxis,
        yAxisDim = dimension.yAxis;
    var marginTop = margin.top + chartTitleDim;
    height = svgHeight - marginTop - margin.bottom - chartTitleDim - xTitleDim - xAxisDim;
    width = svgWidth - margin.left - margin.right;
    
    // set x, y scales
    x_scale = d3.time.scale().range([0, width]);
    x_scale.domain([now - (limit - 2), now - duration]);
    y_scale = d3.scale.linear().domain([0, maxValue]).range([height, 0]);

    // make svg
    svg =  selection.append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    var main = svg.append('g')
      .attr("class", "drawarea")
      .attr("transform", "translate(" + margin.left + "," + marginTop + ")");
   
    // make chart title
    main.append("text")
        .attr("class", "chartTitle")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("dy", ".71em")
        .text(function(d) { 
          var text = chartTitle == undefined ? "" : chartTitle;
          return text; 
        });

    // make x/y axis
    xAxisG = main.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");

    yAxisG = main.append("g")
        .attr("class", "y axis");

    xAxisG.append("text") // x title
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", 25)
        .attr("dy", ".71em")
        .text(function(d) { 
          var text = xTitle == undefined ? "" : xTitle;
          return text; 
        });

    yAxisG.append("text") // y title
        .attr("class", "title")
        .attr("transform", "rotate(-90)")
        .attr("x", - height / 2)
        .attr("y", -margin.left + 45) //-35
        .attr("dy", ".71em")
        .text(function(d) { 
          var text = yTitle == undefined ? "" : yTitle;
          return text; 
        });

    x_axis = d3.svg.axis().orient("bottom");
    y_axis = d3.svg.axis().orient("left");
    x_axis.scale(x_scale)(xAxisG);
    y_axis.scale(y_scale)(yAxisG);

    // line groups
    paths = main.append("g")
      .attr("class", "dataline");

    line = d3.svg.line()
      .interpolate("basic")
      .x(function(d, i){
        return x_scale(d.time);
      })
      .y(function(d){
        return y_scale(d.value);
      });

    for (i = 0; i < groups.length; i++) {
      var g = groups[i];
      g.path = paths.append('path')
        .data(g.data)
        .attr('d', line(g.data))
        .style("stroke", g.color);
    }

  } // end chart function

  var refresh = function() {
    
    // redraw line
    for (var i = 0; i < groups.length; i ++) {
      var g = groups[i];
      g.data.push(datum[i]);
      g.path.attr('d', line(g.data));
    }

    // shift x domain
    var newest_time = datum[0].time; //TODO: get the max among all timestamp
    x_scale.domain([newest_time - (limit - 1) * duration, newest_time]);
    x_axis.scale(x_scale)(xAxisG);

    // shift the line left
/*
    paths
      .attr("transform", null)
      .transition()
      .duration(duration)
      .ease('linear')
      .attr('transform', 'translate(' + x_scale(newest_time - (limit - 1) * duration) + ')');
*/
//      .each('end', refresh);

    // remove the oldest data
    for (var i = 0; i < groups.length; i ++) {
        groups[i].data.shift();
    }
  }

  // ----- getter/setter functions -----
  // chart title
  chart.title = function(_) {
    if (arguments.length == 0) return chartTitle;
    chartTitle = _;
    return chart;   
  }

  // x axis title
  chart.xTitle = function(_) {
    if (arguments.length == 0) return xTitle;
    xTitle = _;
    return chart;       
  }

  // y axis title
  chart.yTitle = function(_) {
    if (arguments.length == 0) return yTitle;
    yTitle = _;
    return chart;       
  }
  // max y value 
  chart.maxValue = function(_) {
    if (arguments.length == 0) return maxValue;
    maxValue = _;
    return chart;       
  }

  // svg width
  chart.width = function(_) {
    if (arguments.length == 0) return svgWidth;
    svgWidth = _;
    return chart;
  }

  // svg height
  chart.height = function(_) {
    if (arguments.length == 0) return svgHeight;
    svgHeight = _;
    return chart;
  }

  // interval
  chart.interval= function(_) {
    if (arguments.length == 0) return duration;
    duration = _;
    return chart;
  }

  // interval
  chart.dataTypes = function(_) {
    if (arguments.length == 0) return category;
    category = _;
    return chart;
  }
  chart.datum = function(_) {
    if (arguments.length == 0) return datum;
    datum = _;
    refresh();
    return chart;
  }

  chart.start = function() {
    //refresh();
  }

  return chart;
}
