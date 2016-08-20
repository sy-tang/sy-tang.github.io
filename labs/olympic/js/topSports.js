function initTopSports(res) {
    var sportsListData = getSportsListData(res);
    if (sportsListData) {
        // init sports list
        var myChart = echarts.init(document.getElementById('countryDetail'));

        option = {
            grid: {
                right: 20,
                left: 0,
                top: 0,
                bottom: 0,
                height: Math.min(sportsListData.data.length * 10, 100) + "%",
                containLabel: true
            },
            xAxis: {
                min: 0,
                type: 'value',
                scale: true,
                position: 'top',
                boundaryGap: false,
                splitLine: {show: false},
                axisLine: {show: false},
                axisTick: {show: false},
                axisLabel: {margin: 2, textStyle: {fontSize: 10, color: '#aaa'}},
            },
            yAxis: {
                type: 'category',
                // name: 'TOP 10 Sports',
                nameGap: 16,
                axisLine: {show: false},
                axisTick: {show: false},
                axisLabel: {interval: 0, textStyle: {fontSize: 10, color: '#ddd'}},
                data: sportsListData.categories
            },
            visualMap: {
                // type: "continue"
                min: sportsListData.data[0].value,
                max: sportsListData.data[sportsListData.data.length - 1].value,
                inRange: {
                    color: ["#e69e92", "#ff5f46"]
                },
                dimension: 0,
                show: false,
            },
            series: {
                id: 'bar',
                zlevel: 2,
                type: 'bar',
                symbol: 'none',
                itemStyle: {
                    normal: {
                        color: '#ff5f46'
                    }
                },
                data: sportsListData.data
            }
        };

        myChart.setOption(option);

        // $("#countryDetail").parent().find(".country").text(locale(selectedCountry));

        myChart.group = "group1";

        echarts.connect('group1');

        var handler = function(params) {
            console.log(params);
            if (params && params.name) {

                // $("#countryDetail").parent().find(".country").text(locale(selectedCountry));

                var targetIOC = IOC_CodeHelper.getIOCByCountryName(selectedCountry);

                
                var sql;
                if (targetIOC) {
                    var countryStatic = allCountryStatics[targetIOC.toUpperCase()];
                    var totalGolds = countryStatic ? countryStatic.gold : 0;
                    $("#countryDetail").parent().find(".total").text(totalGolds);

                    sql = " SELECT TOP 20 Sport, SUM([Gold]) As Golds FROM olympics WHERE NOC = '" + targetIOC + "' GROUP BY Sport ORDER BY Golds DESC ";
                    alasql.promise(sql)
                        .then(function(res) {
                            var sportsListData = getSportsListData(res);

                            if (sportsListData) {

                                $("#countryDetail").show();
                                $("#countryDetail").siblings(".zero").hide();

                                var len = sportsListData.data.length;
                                myChart.setOption({
                                    yAxis: {
                                        data: sportsListData.categories
                                    },
                                    series: {
                                        data: sportsListData.data
                                    },
                                    visualMap: {
                                        min: sportsListData.data[0].value,
                                        max: sportsListData.data[sportsListData.data.length - 1].value,
                                    },
                                    grid: {
                                        height: Math.min(len * 10, 100) + "%"
                                    }
                                });
                            } else {
                                $("#countryDetail").hide();
                                $("#countryDetail").siblings(".zero").show();
                            }

                        }).catch(function(err) {
                            console.log(err);
                            $("#countryDetail").hide();
                            $("#countryDetail").siblings(".zero").show();

                        });
                } else {
                    $("#countryDetail").parent().find(".total").text(0);
                    $("#countryDetail").hide();
                    $("#countryDetail").siblings(".zero").show();
                }

            }
        };

        myChart.on("mapselectchanged", handler);
        myChart.on("mapselected", handler);

    }
}

function getSportsListData(rawData) {
    console.log(rawData);
    if (rawData[0] && rawData[0].Sport) {
        rawData = rawData.filter(function(item) {
            return item.Golds > 0;
        });
        return {
            categories: rawData.map(function(item) { return locale(item.Sport); }).reverse(),
            data: rawData.map(function(item) { return {name: locale(item.Sport), value: item.Golds}; }).reverse()
        };

    } else {
        return null;
    }
}