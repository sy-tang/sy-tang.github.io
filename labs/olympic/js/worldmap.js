function initWorldMap() {
    window.selectedCountry = "";

    alasql.promise(" SELECT NOC, SUM([Gold]) As Golds FROM olympics GROUP BY NOC ORDER BY Golds DESC ")
        .then(function(res) {

            var data = [];
            res.forEach(function(item) {
                var iso = IOC_CodeHelper.getISOCodeByIOC(item.NOC);
                if (!iso) return;

                var country = IOC_CodeHelper.getCountryNameByIOC(item.NOC);
                if (!country) return;

                data.push( {
                    name: country,
                    value: +item.Golds,
                    selected: selectedCountry === country,
                });
            });

            var myChart = echarts.init(document.getElementById('worldmap'));

            var option = {
                // tooltip: {
                //     trigger: 'item',
                //     formatter: function (params) {
                //         return locale(params.name) + ' : ' + (params.value || 0);
                //     }
                // },
                // visualMap: {
                //     min: 0,
                //     max: data[1].value,
                //     text:['>1','0'],
                //     realtime: false,
                //     calculable: true,
                //     inRange: {
                //         color: ['#f6efa6', '#e9c090', "#f4a689"]
                //     },
                //     show: false,
                //     orient: 'horizontal',
                //     left: 'center',
                //     textStyle: style.textStyle,
                // },
                visualMap: {
                    type: 'piecewise',
                    pieces: [
                        { gt: data[1].value, color: "#d95d5f"},
                        { gt: data[10].value, lte: data[1].value, color: "#f4a689" },
                        { gt: data[20].value, lte: data[10].value, color: "#e9c090" },
                        { lt: data[20].value, color: "#f6efa6" },
                    ],
                    inRange: {
                        color: ['#f6efa6', '#e9c090', "#f4a689"]
                    },
                    show: false,
                    orient: 'horizontal',
                    left: 'center',
                    textStyle: style.textStyle,
                },
                series: [
                    {
                        name: '获得的金牌数',
                        type: 'map',
                        mapType: 'world',
                        roam: true,
                        itemStyle:{
                            emphasis:{label:{show:true}}
                        },
                        top: 0,
                        bottom: 0,
                        data: data,
                        selectedMode: 'single',
                        itemStyle: {
                            emphasis: {
                                areaColor: "#428bca",
                            }
                        },
                        label: {
                            emphasis: {
                                // show: false,
                                textStyle: {
                                    color: "#fff",
                                    fontSize: 12,
                                },
                                formatter: function(params) {
                                    // return locale(params.name) + ": " + (params.value || 0);
                                    return locale(params.name);
                                }
                            }
                        }
                    }
                ]
            };

            myChart.setOption(option);
            myChart.group = "group1";

            var handler = function(params) {
                if (params && params.name) {
                    if (params.type === "mapselected") {  // 筛选器触发选中
                        console.log("mapSelect");
                        data.forEach(function(item) {
                            if (item.name === params.name) {
                                item.selected = true;
                            } else {
                                item.selected = false;
                            }
                        });
                        myChart.setOption({
                            series: [{
                                data: data
                            }]
                        });
                    }

                    if (selectedCountry === params.name) {
                        selectedCountry = "";
                        // $("#world-statics").css('opacity', 1);
                        // $("#country-statics").css('opacity', 0);
                        $("#world-statics").show();
                        $("#country-statics").hide();

                    } else {
                        selectedCountry = params.name;
                        // $("#world-statics").css('opacity', 0);
                        $("#country-statics").css('opacity', 1);
                        $("#world-statics").hide();
                        $("#country-statics").show();

                    }

                    if (params.type === "mapselectchanged") {  // 点击地图区域触发选中
                        var ioc = IOC_CodeHelper.getIOCByCountryName(selectedCountry);
                        $("body").trigger("mapselectchanged", ioc);
                    }
                }
            };

            myChart.on("mapselectchanged", handler);
            myChart.on("mapselected", handler);

            $("body").on("filterChange", function(event, ioc) {
                var name = IOC_CodeHelper.getCountryNameByIOC(ioc.toUpperCase());
                if (name) {
                    myChart.dispatchAction({
                        type: 'mapSelect',
                        name: name,
                        seriesId: "获得的金牌数"
                    });

                } else {
                    console.log("can't find country with a code: " + ioc);
                }
            });

            myChart.on("map")

            return alasql;

            
        }).then(function(res) {

            initColumnChart();

            alasql.promise(" SELECT TOP 20 Sport, SUM([Gold]) As Golds FROM olympics GROUP BY Sport ORDER BY Golds DESC ")
                .then(function(res) {
                    initTopSports(res);
                });

            initTopSportHeatmap(alasql);


        }).catch(function(err) {
            console.log(err);
        })
}

