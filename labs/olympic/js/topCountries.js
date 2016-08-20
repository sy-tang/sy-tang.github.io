function initColumnChart(data) {
    var years = ["1896", "1900", "1904", "1908", "1912", "1920", "1924", "1928", "1932", "1936", "1948", "1952", "1956", "1960", "1964", "1968", "1972", "1976", "1980", "1984", "1988", "1992", "1996", "2000", "2004", "2008", "2012"];

    alasql.promise(" SELECT NOC, Edition, SUM(Gold) As Gold, SUM(Silver) As Silver, Sum(Bronze) As Bronze FROM olympics GROUP BY NOC, Edition")
        .then(function(res) {
                
                var data = getTopCountriesData(res);

                var myChart = echarts.init(document.getElementById('topCountries'));

                var left = 120;

                var series = [], xAxis = [], yAxis = [], grid = [], title = [];
                var maxLength = Math.min(10, data.length);

                var padding = 2;
                var percent = (1 / maxLength) * 100 - padding;
                var max = 0;

                data = data.slice(0, maxLength);

                initCountryList(data, maxLength);

                for (var i = 0; i < maxLength; i++) {
                    grid.push({
                        top: i * (percent + padding) + "%",
                        height: percent + "%",
                        left: left,
                        right: 10,
                        bottom: 0,
                        containLabel: false,
                    });

                    xAxis.push({
                        gridIndex: i,
                        type : 'category',
                        data : years.slice(),
                        axisTick: {
                            show: false,
                        },
                        axisLabel: {
                            show: i == 0 ? true : false,
                            textStyle: style.axisLabel.textStyle
                        },
                        axisLine: style.axisLine
                    });

                    yAxis.push({
                        gridIndex: i,
                        type : 'value',
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            show: false
                        },
                        splitLine: {
                            show: false,
                        }

                    });

                    var originData = data[i].data;
                    var seriesData = years.map(function(year) {
                        if (originData[year]) {
                            max = Math.max(max, originData[year]["gold"]);
                            return originData[year]["gold"];
                        } else {
                            return 0;
                        }
                    });

                    // console.log(seriesData);
                    series.push({
                        xAxisIndex: i,
                        yAxisIndex: i,
                        name: data[i].ioc,
                        type:'bar',
                        barWidth: '60%',
                        data: seriesData
                    })
                }

                // console.log(grid, xAxis, yAxis, series);
                console.log(max);
                yAxis.forEach(function(axis) {
                    axis.min = 0;
                    axis.max = max;
                });

                var option = {
                    color: ['#3398DB'],
                    // color: ['#ff5f46'],
                    tooltip : {
                        trigger: 'item',
                        // axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                        //     type : 'line'        // 默认为直线，可选为：'line' | 'shadow'
                        // }
                    },
                    grid: grid,
                    xAxis : xAxis,
                    yAxis : yAxis,
                    series : series
                };

                myChart.setOption(option);


            }); 
        

    return;
    
}

function getTopCountriesData(res) {
    var newData = {};
    res.forEach(function(item) {
        var ioc = item.NOC, countryData = newData[ioc];
        if (!countryData) {
            newData[ioc] = countryData = {
                ioc: ioc,
                data: {},
                total: {
                    bronze: 0,
                    gold: 0,
                    silver: 0
                }
            };
        }

        var year = item.Edition, 
            medal = {
                bronze: +item.Bronze || 0,
                gold: +item.Gold || 0,
                silver: +item.Silver || 0
            };

        countryData.data[year] = medal;

        ["Bronze", "Gold", "Silver"].forEach(function(type) {
            countryData.total[type.toLowerCase()] += (+item[type] || 0);
        });

    });

    var list = [];
    Object.keys(newData).forEach(function(ioc) {
        list.push(newData[ioc]);
    });

    list.sort(function(a, b) {
        if (a.total.gold !== b.total.gold) {
            return b.total.gold - a.total.gold;

        } else if ((a.total.silver !== b.total.silver)) {
            return b.total.silver - a.total.silver;

        } else {
            return b.total.bronze - a.total.bronze;
        }
    });

    return list;
}

function initCountryList(data, length) {
    // $.get({
    //     url: "data/all_country_results_zh.json",
    //     success: function(response) {
    //         // console.log(response);
    //         window.allCountryStatics = response;

    var $list = $("<div>").addClass("top-list");
    var percent = 100 / length;

    var statics = ["gold", "silver", "bronze"];

    for(var i = 0; i < length; i++) {
        var ioc = data[i].ioc;
        var countryData = allCountryStatics[ioc.toUpperCase()];

        if (countryData) {
            // console.log(countryData);
            var $info = $("<div>").css({
                    position: 'absolute',
                    top: (i * percent) + "%",
                    left: 0,
                });

            var $div = $("<div>").addClass("info");

            var $flag = $("<i>").addClass("flag18 " + ioc.toLowerCase());
            var countryName = countryData.name_zh;

            var $countryText = $("<span>").addClass("name").text(countryName);
            $div.append("<span class='rank'>" + (i + 1) + ". </span>").append($countryText).append($flag)
                
            $info.append($div);

            $div = $("<div>").addClass("statics");

            statics.forEach(function(item) {
                var $span = $("<span>").addClass(item).text(countryData[item]);
                $div.append($span);
            });

            $info.append($div);

            $list.append($info);
        }
    }
    $("#topCountries").parent().append($list);
    console.log("append list")
        // }
    // });
}