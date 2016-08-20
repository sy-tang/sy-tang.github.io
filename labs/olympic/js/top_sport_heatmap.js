function initTopSportHeatmap(alasql) {
    alasql.promise(" SELECT Edition, Sport, SUM([Gold]) As Golds FROM olympics WHERE NOC = 'CHN' GROUP BY Sport, Edition")
        .then(function(res) {
            var opt = generateHeatmapOpt(res);

            var myChart = echarts.init(document.getElementById('heatmap'));

            var option = {
                tooltip: {
                    position: 'top',
                    formatter: function(params) {
                        return params.name + "年: " + params.value[2];
                    },
                    textStyle: {
                        fontSize: 12,
                    }
                },
                animation: false,
                grid: {
                    left: 0,
                    right: 10,
                    top: 10,
                    bottom: 0,
                    containLabel: true,
                },
                xAxis: {
                    type: 'category',
                    data: opt.xAxisData,
                    splitArea: {
                        show: true
                    },
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    axisLabel: style.axisLabel
                },
                yAxis: {
                    type: 'category',
                    data: opt.yAxisData.map(function(item) {return locale(item);}),
                    splitArea: {
                        show: true
                    },
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    axisLabel: style.axisLabel
                },
                visualMap: {
                    min: opt.min || 1,
                    max: opt.max || 10,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '0%',
                    textStyle: style.textStyle,
                    show: false
                },
                series: [{
                    name: '金牌数',
                    type: 'heatmap',
                    data: opt.seriesData,
                    label: {
                        normal: {
                            show: opt.xAxisData.length > 8 ? false : true
                            // show: false
                        }
                    },
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };

            myChart.setOption(option);

            myChart.group = "group1";

            echarts.connect('group1');

            // $("#heatmap").parent().find(".country").text(locale(selectedCountry));

            myChart.on("mapselectchanged", function(params) {
                console.log(params);
                if (params && params.name) {
 
                    // $("#heatmap").parent().find(".country").text(locale(selectedCountry));

                    var targetIOC = IOC_CodeHelper.getIOCByCountryName(selectedCountry);

                    var sql;
                    if (targetIOC) {
                        var countryStatic = allCountryStatics[targetIOC.toUpperCase()];
                        var totalGolds = countryStatic ? countryStatic.gold : 0;
                        $("#heatmap").parent().find(".total").text(totalGolds);
                        
                        sql = " SELECT Edition, Sport, SUM([Gold]) As Golds FROM olympics WHERE NOC = '" + targetIOC + "' GROUP BY Sport, Edition ";
                        alasql.promise(sql)
                            .then(function(res) {
                                var opt = generateHeatmapOpt(res);

                                if (opt && opt.seriesData.length) {

                                    $("#heatmap").show();
                                    $("#heatmap").siblings(".zero").hide();

                                    myChart.setOption({
                                        visualMap: {
                                            min: opt.min,
                                            max: opt.max,
                                        },
                                        yAxis: {
                                            data: opt.yAxisData
                                        },
                                        xAxis: {
                                            data: opt.xAxisData
                                        },
                                        series: {
                                            data: opt.seriesData,
                                            label: {
                                                normal: {
                                                    show: opt.xAxisData.length > 8 ? false : true
                                                    // show: false
                                                }
                                            },
                                        }
                                    });

                                } else {
                                    $("#heatmap").parent().find(".total").text(0);
                                    $("#heatmap").hide();
                                    $("#heatmap").siblings(".zero").show();
                                }

                            }).catch(function(err) {
                                console.log(err);
                                $("#countryDetail").hide();
                                $("#countryDetail").siblings(".zero").show();

                            });

                    } else {
                        $("#heatmap").parent().find(".total").text(0);
                        $("#heatmap").hide();
                        $("#heatmap").siblings(".zero").show();
                        // sql = " SELECT Edition, Sport, SUM([Gold]) As Golds FROM olympics GROUP BY Sport ORDER BY Golds DESC ";
                    }

                }
            });


        }).catch(function(err) {
            console.log(err);
        });


}

function generateHeatmapOpt(data) {

    var maxLength = ($("#heatmap").height() - 40) / 20;

    var editions = {}, sports = {};
    data.forEach(function(item) {
        var edition = item.Edition, sport = item.Sport, medal = item.Golds;
        editions[edition] = medal + (editions[edition] || 0);
        sports[sport] = medal + (sports[sport] || 0);
    });

    var xAxisData = Object.keys(editions), yAxisData = Object.keys(sports);

    xAxisData.sort(function(a, b) {
        return (+a) - (+b);
    });

    yAxisData.sort(function(a, b) {
        return sports[b] - sports[a];
    });

    yAxisData = yAxisData.slice(0, maxLength).reverse();

    var seriesData = [], min = 0, max = 0;
    data.forEach(function(item) {
        var edition = item.Edition + "", sport = item.Sport, medal = +item.Golds;

        if (yAxisData.indexOf(sport) > -1 && medal > 0) {
            var point = [];
            point.push(xAxisData.indexOf(edition));
            point.push(yAxisData.indexOf(sport));
            point.push(medal);

            seriesData.push(point);
            min = Math.min(min, medal);
            max = Math.max(max, medal);
        }
    });

    var opt = {
        xAxisData: xAxisData,
        yAxisData: yAxisData.map(function(item) {return locale(item);}),
        seriesData: seriesData,
        min: 1,
        max: max
    };

    return opt;

}
