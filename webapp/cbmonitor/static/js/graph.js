/*jshint jquery: true, browser: true*/
/*global d3: true, nv: true*/

var CBMONITOR = CBMONITOR || {};

CBMONITOR.GraphManager = function() {
    "use strict";

    this.metrics = {};
};

CBMONITOR.GraphManager.prototype.PlotLineWithFocus = function(data) {
    "use strict";

    var dataHandler = new CBMONITOR.DataHandler(data),
        series_data = dataHandler.prepareSeries(this.metrics[this.container]),
        container = "#" + this.container + " svg";

    var format = function(d) {
        return d3.time.format("%H:%M:%S")(new Date(d));
    };

    nv.addGraph(function() {
        var chart = nv.models.lineWithFocusChart().tooltips(false).forceY([0]);

        if (container === "#first_view svg") {
            chart.tooltipContent(function(key, x, y, e, graph) {
                return "<h4>" + y + "</h4>";
            });
            chart.tooltips(true);
        } else {
            chart.tooltips(false);
        }

        chart.xAxis.tickFormat(format);
        chart.x2Axis.tickFormat(format);
        chart.yAxis.tickFormat(d3.format(',.2s'));
        chart.y2Axis.tickFormat(d3.format(',.2s'));

        d3.select(container)
            .datum(series_data)
            .call(chart);
    });
};

CBMONITOR.GraphManager.prototype.PlotLine = function(data) {
    "use strict";

    var dataHandler = new CBMONITOR.DataHandler(data),
        series_data = dataHandler.prepareSeries(this.metrics[this.container]),
        container = "#" + this.container + " svg";

    var format = function(d) {
        return d3.time.format("%H:%M:%S")(new Date(d));
    };

    nv.addGraph(function() {
        var chart = nv.models.lineChart().forceY([0]);
        if (container === "#first_view svg") {
            chart.tooltipContent(function(key, x, y, e, graph) {
                return "<h4>" + y + "</h4>";
            });
            chart.tooltips(true);
        } else {
            chart.tooltips(false);
        }

        chart.xAxis.tickFormat(format);
        chart.yAxis.tickFormat(d3.format(',.2s'));

        d3.select(container)
            .datum(series_data)
            .call(chart);
    });
};

CBMONITOR.GraphManager.prototype.query = function(ui) {
    "use strict";

    var chart_data,
        data = {
            cluster: ui.draggable.attr("cluster"),
            server: ui.draggable.attr("server"),
            bucket: ui.draggable.attr("bucket"),
            collector: ui.draggable.attr("collector"),
            name: ui.draggable.text()
        };

    $.ajax({url: "/seriesly/", dataType: "json", async: false, data: data,
        success: function(data) {
            chart_data = data;
        }
    });
    return chart_data;
};

CBMONITOR.GraphManager.prototype.plot = function(container, ui, chart_type) {
    "use strict";

    var new_metric = ui.draggable.text();

    if (this.metrics[container] === undefined) {
        this.metrics[container] = [new_metric];
        this.uis = [ui];
    } else if (this.metrics[container].indexOf(new_metric) === -1) {
        this.metrics[container].push(new_metric);
        this.uis.push(ui);
    }
    this.container = container;

    var chart_data = [];
    for(var i = 0, l = this.uis.length; i < l; i++) {
        chart_data.push(
            this.query(this.uis[i])
        );
    }
    if (chart_type === "lineWithFocus") {
        this.PlotLineWithFocus(chart_data);
    } else {
        this.PlotLine(chart_data);
    }
};

CBMONITOR.GraphManager.prototype.clear = function() {
    "use strict";

    this.metrics = {};
    $("#first_view").empty().append("<svg>");
    $("#second_view").empty().append("<svg>");
    $("#second_view_double").empty().append("<svg>");
    $("#third_view").empty().append("<svg>");
    $("#fourth_view").empty().append("<svg>");
};

CBMONITOR.DataHandler = function(data) {
    "use strict";

    this.data = data;
};

CBMONITOR.DataHandler.prototype.prepareTimestamps = function(dataset) {
    "use strict";

    var timestamps = [];
    for(var timestamp in dataset) {
        if (dataset.hasOwnProperty(timestamp)) {
            timestamps.push(parseInt(timestamp, 10));
        }
    }
    return timestamps.sort();
};

CBMONITOR.DataHandler.prototype.prepareSeries = function(metrics) {
    "use strict";

    var timestamp, timestamps, value, values,
        series = [];
    for(var i = 0, lenm = metrics.length; i < lenm; i++) {
        timestamps = this.prepareTimestamps(this.data[i]);
        values = [];
        for(var j = 0, lent = timestamps.length; j < lent; j++) {
            timestamp = timestamps[j];
            value = parseFloat(this.data[i][timestamp]) || 0;
            values.push({x: timestamp, y: value});
        }
        series.push({
            key: metrics[i],
            values: values
        });
    }
    return series;
};
