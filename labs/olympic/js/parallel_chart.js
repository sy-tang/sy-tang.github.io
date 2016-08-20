loadData("data/all_sport_medal_values_by_noc.xlsx", function(workbook) {
    var sheetName = workbook.SheetNames[0];
    var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    window.sportsData = data;

    var sports = Object.keys(data[0]);
    var sportsMap = {}

    data.forEach(function(item) {
        Object.keys(item).forEach(function(key) {
            if (key === 'NOC') {
                return;
            }
            var count = +item[key];
            if (!sportsMap[key]) {
                sportsMap[key] = count;
            } else {
                sportsMap[key] += count;
            }
        })
    });

    sports = Object.keys(sportsMap);

    sports.sort(function(a, b) {
        return sportsMap[b] - sportsMap[a];
    });

    sports = sports.splice(0, 10);

    // console.log(sports);

    data.sort(function(a, b) {
        var sumA = 0, sumB = 0;

        Object.keys(a).forEach(function(key) {
            if (key !== 'NOC' && sports.indexOf(key) > -1) {
                sumA += a[key];
            }
        });

        Object.keys(b).forEach(function(key) {
            if (key !== 'NOC' && sports.indexOf(key) > -1) {
                sumB += b[key];
            }
        });

        return sumB - sumA;
    });

    initParallelChart({
        dimensions: sports,
        seriesData: data
    }); 
})

function initParallelChart(opt) {

    var continents = ["NA", "AS", "EU", "AF", "SA", "OC"];

    var continents_locale = continents.map(function(item) { return locale(item); });

    var myChart = echarts.init(document.getElementById('parallel'));

    var lineStyle = {
        normal: {
            width: 1,
            opacity: 1
        }
    };

    var legendData = opt.seriesData.map(function(item) {
        return item.NOC;
    });

        // by continent code
    var seriesData = {};
    opt.seriesData.forEach(function(item) {
        var continent_code = IOC_CodeHelper.getContinentCodeByIOC(item.NOC);

        if (!continent_code) {
            // console.log(item);
            return;
        }

        var data = [locale(continent_code)];

        opt.dimensions.forEach(function(dim, idx) {
            if (item[dim]) {
                var value = +item[dim];
                data.push(value);

            } else {
                data.push(0);
            }
        });
        if (seriesData[continent_code]) {
            seriesData[continent_code].push(data);
            // seriesData[continent_code][0] = seriesData[continent_code][0].map(function(item, idx) {
            //     if (idx === 0) return item;
            //     else return item + data[idx];
            // });
        } else {
            seriesData[continent_code] = [data];
        }
    });


    var option = {
        backgroundColor: style.backgroundColor,
        tooltip: {
            padding: 10,
            backgroundColor: '#222',
            borderColor: '#777',
            borderWidth: 1,
            formatter: function (obj) {
                var value = obj[0].value;
                var html = '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                    + obj[0].seriesName;

                sports.forEach(function(sport, idx) {
                    html += + sports + '：' + value[idx] + '<br>'
                });
                console.log(html);
                return html + "</div>";
            }
        },

        parallelAxis: [
            {
                dim: 0,
                name: 'Continent',
                type: 'category',
                data: continents_locale,
                inverse: true,
                axisLabel: {
                    // show: false,
                    margin: -20
                },
                slient: false,
                triggerEvent: true           
            }
        ],
        // visualMap: {
        //     show: false,
        //     // min: 0,
        //     // max: max,
        //     dimension: 2,
        //     orient: 'horizontal',
        //     left: 'center',
        //     bottom: '0%',
        //     inRange: {
        //         color: ['#d94e5d','#eac736','#50a3ba'].reverse(),
        //         // colorAlpha: [0, 1]
        //     }
        // },
        parallel: {
            left: 10,
            top: 20,
            right: 70,
            bottom: 40,
            layout: 'vertical',
            parallelAxisDefault: {
                type: 'value',
                name: 'Sport',
                nameLocation: 'end',
                nameGap: 20,
                nameTextStyle: style.textStyle,
                axisLine: style.axisLine,
                axisTick: style.axisTick,
                splitLine: {
                    show: false
                },
                axisLabel: style.axisLabel,
                slient: true,
            }
        },
        series: [],
        blendMode: 'lighter',

    };


    opt.dimensions.forEach(function(dim, idx) {
        option.parallelAxis.push({
            dim: idx + 1,
            name: locale(dim),
        });
    });

    continents.forEach(function(key) {
        option.series.push({
            name: key,
            type: "parallel",
            lineStyle: lineStyle,
            data: seriesData[key],
            slient: true,
            smooth: true,
        });

        // console.log(key);
    })

    // by country
    // opt.seriesData.forEach(function(item, idx) {
    //     var data = [];
    //     opt.dimensions.forEach(function(dim, idx) {
    //         if (item[dim]) {
    //             var value = +item[dim];
    //             data.push(value);
    //             max = Math.max(value, max);

    //         } else {
    //             data.push(0);
    //         }
    //     });

    //     option.series.push({
    //         name: item["NOC"],
    //         type: "parallel",
    //         lineStyle: lineStyle,
    //         data: [data],
    //         smooth: true,
    //     });

    //     // console.log(data);
    // });

    myChart.setOption(option);

    var originOption = option, hasDrillDown = false;
    myChart.on("click", function(params) {
        console.log(params)
        if (!hasDrillDown && params && params.componentType === 'parallelAxis' && params.targetType === "axisLabel") {
            var targetIdx = continents_locale.indexOf(params.value);
            // console.log(originSeries.slice(visibleIdx, visibleIdx+1));
            var targetContinent = continents[targetIdx];

            var series = [], categories = [];
            opt.seriesData.forEach(function(item) {
                var continent_code = IOC_CodeHelper.getContinentCodeByIOC(item.NOC);
                var category = item.NOC;

                if (!continent_code || continent_code != targetContinent) {
                    // console.log(item);
                    return;
                }

                var data = [category];

                opt.dimensions.forEach(function(dim, idx) {
                    if (item[dim]) {
                        var value = +item[dim];
                        data.push(value);

                    } else {
                        data.push(0);
                    }
                });

                // if (Math.max.apply(null, data.slice(1)) > 10) {
                    // categories.push(category);
                    series.push({
                        data: [data],
                        name: category,
                        type: "parallel",
                        lineStyle: lineStyle,
                        slient: true,
                        smooth: true,
                    });
                // }
            });

            series.sort(function(a, b) {
                var sumA = a.data.reduce(function(val, sum) { return val + sum; }, 0);
                var sumB = b.data.reduce(function(val, sum) { return val + sum; }, 0);
                return sumB - sumA;
            });

            series = series.slice(0, 8);

            categories = series.map(function(item) { return item.name; });

            myChart.clear();
            var newOption = $.extend(true, {}, option);

            newOption.series = series;
            newOption.parallelAxis[0].data = categories;

            // $("#parallel").hide();
            // var newChart = echarts.init(document.getElementById('parallel2'));
            myChart.setOption(newOption);

            hasDrillDown = true;
            $("#parallel").siblings(".drill-down").show();
        } 
    });

    $("body").on("click", ".drill-down", function() {
        myChart.clear();
        myChart.setOption(option);
        $("#parallel").siblings(".drill-down").hide();
        hasDrillDown = false;
    });
}
