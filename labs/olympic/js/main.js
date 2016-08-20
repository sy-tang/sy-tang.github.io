
$("#country-statics").find(".chart-block").css("height", ($(window).height() - 244) + "px");

$("#country-statics").slick({
    'slidesToShow': 1, 
    'slidesToScroll': 1,
    'arrows': true,
    // 'dots': true,
    'infinite': false,
});

$(".start-btn").on("click", function() {
    $("#cover").addClass("gone");
    $("body").css("overflow-y", "visible");
});

$(".next-btn").on("click", function() {
    $("#back-cover").removeClass("gone");
    $("body").css("overflow", "hidden");
});

$(".back-btn").on("click", function() {
    $("#back-cover").addClass("gone");
    $("body").css("overflow-y", "visible");
});

function loadAllOtherData() {
    var dataSource = "1896_2012_all_sports_medalists.csv";

    alasql.promise([
            // 'CREATE TABLE IF NOT EXISTS olympics (ICO string, Edition number, Medal string, Sport string, MedalCount number);',
            'CREATE TABLE olympics',
            'SELECT * INTO olympics FROM CSV("data/1896_2012_all_sports_medalists.csv", {headers:true, separator:";"})',
        ])
        .then(function(res) {
            // console.log("Import data from csv succss: " + res.length + " rows");
            return alasql.promise(" select NOC, SUM([Gold]) As Golds from olympics GROUP BY NOC ORDER BY Golds DESC")
                
        }).then(function(res) {
            console.log(res);
            initWorldMap(res);

        }).catch(function(err) {
            console.log("Error: ", err);
        });            
}

loadAllOtherData();

initTopCountryCount();

// $.get({
//     url: "data/all_country_results_zh.json",
//     success: function(response) {
//         // console.log(response);
//         window.allCountryStatics = response;
//         loadAllOtherData();
//     }
// });

function initTopCountryCount() {
    var topCountryStatics = [{"year":"1896年","first":" 美国","gold":"11","silver":"7","bronze":"2","total":"20"},{"year":"1900年","first":" 法国","gold":"26","silver":"41","bronze":"34","total":"101"},{"year":"1904年","first":" 美国","gold":"78","silver":"82","bronze":"79","total":"239"},{"year":"1908年","first":" 英国","gold":"56","silver":"51","bronze":"38","total":"146"},{"year":"1912年","first":" 美国","gold":"25","silver":"19","bronze":"19","total":"63"},{"year":"1920年","first":" 美国","gold":"41","silver":"27","bronze":"27","total":"95"},{"year":"1924年","first":" 美国","gold":"45","silver":"27","bronze":"27","total":"99"},{"year":"1928年","first":" 美国","gold":"22","silver":"18","bronze":"16","total":"56"},{"year":"1932年","first":" 美国","gold":"41","silver":"32","bronze":"30","total":"103"},{"year":"1936年","first":" 纳粹德国","gold":"33","silver":"26","bronze":"30","total":"89"},{"year":"1948年","first":" 美国","gold":"38","silver":"27","bronze":"19","total":"84"},{"year":"1952年","first":" 美国","gold":"40","silver":"19","bronze":"17","total":"76"},{"year":"1956年","first":" 苏联","gold":"37","silver":"29","bronze":"32","total":"98"},{"year":"1960年","first":" 苏联","gold":"43","silver":"29","bronze":"31","total":"103"},{"year":"1964年","first":" 美国","gold":"36","silver":"26","bronze":"28","total":"90"},{"year":"1968年","first":" 美国","gold":"45","silver":"28","bronze":"34","total":"107"},{"year":"1972年","first":" 苏联","gold":"50","silver":"27","bronze":"22","total":"99"},{"year":"1976年","first":" 苏联","gold":"49","silver":"41","bronze":"35","total":"125"},{"year":"1980年","first":" 苏联","gold":"80","silver":"69","bronze":"46","total":"195"},{"year":"1984年","first":" 美国","gold":"83","silver":"61","bronze":"30","total":"174"},{"year":"1988年","first":" 苏联","gold":"55","silver":"31","bronze":"46","total":"132"},{"year":"1992年","first":" 独联体","gold":"45","silver":"38","bronze":"29","total":"112"},{"year":"1996年","first":" 美国","gold":"44","silver":"32","bronze":"25","total":"101"},{"year":"2000年","first":" 美国","gold":"37","silver":"24","bronze":"33","total":"94"},{"year":"2004年","first":" 美国","gold":"36","silver":"39","bronze":"27","total":"102"},{"year":"2008年","first":" 中国","gold":"51","silver":"21","bronze":"28","total":"100"},{"year":"2012年","first":" 美国","gold":"46","silver":"29","bronze":"29","total":"104"}];

    var myChart = echarts.init(document.getElementById('topCountryCount'));

    var option = {
        title: [],
        singleAxis: [],
        series: []
    };

    var scale =  100 / 7;

    var xAxisData = topCountryStatics.map(function(item) { return item.year; });

    var seriesData = [], dataMap = {};
    topCountryStatics.forEach(function(item) {
        var country = item.first.slice(1);
        var arr = dataMap[country];
        if (!arr) {
            dataMap[country] = arr = [];
        }
        arr.push([xAxisData.indexOf(item.year), +item.gold]);
        // arr.push([item.year, item.gold]);
    });
    
    var height = 30;
    var yAxisData = ["美国", "法国", "英国", "纳粹德国", "苏联", "独联体", "中国"];
    yAxisData.forEach(function(country, idx) {
        option.title.push({
            textBaseline: 'middle',
            top: (idx + 0.5) * height + 15,
            text: country,
            textStyle: style.textStyle,
        });

        option.singleAxis.push({
            left: 60,
            type: 'category',
            boundaryGap: false,
            data: xAxisData,
            top: idx * height + 20,
            height: height,
            axisLabel: idx > 0 ? {show: false} : $.extend(true, { margin: "-50"}, style.axisLabel),
            // axisLine: idx > 0 ? {show: false} : style.axisLine
            axisLine: { show: false}
        });

        option.series.push({
            singleAxisIndex: idx,
            coordinateSystem: 'singleAxis',
            type: 'scatter',
            data: dataMap[country],
            // symbolSize: function (dataItem) {
                // return dataItem[1];
            // }
        });

    });

    myChart.setOption(option);
}


function initFilter() {
    var $filterPopup = $("<div>").addClass("filter-popup");

    $filterPopup.append('<div class="mask"></div>');

    var countries = Object.keys(allCountryStatics);

    var selectedCountry = window.selectedCountry;

    var listData = countries.map(function(ioc) {
        if (IOC_CodeHelper.getISOCodeByIOC(ioc)) {
            return allCountryStatics[ioc];
        } else {
            // return null;
        }
    });

    listData.sort(function(a, b) {
        if (a.gold !== b.gold) {
            return b.gold - a.gold;
        } else if (a.silver !== b.silver) {
            return b.silver - a.silver;
        } else {
            return b.bronze - a.bronze;
        }
    });

    var $ul = $("<ul>").addClass("filter-list");
    listData.forEach(function(item, idx) {
        if (item) {
            var htmlTpl = '<li data-ioc="{ioc}"><i class="flag18 {ioc}"></i><span class="name">{name_zh}</span></li>';
            var html = htmlTpl.replace(/{ioc}/g, item["ioc"].toLowerCase()).replace("{name_zh}", item["name_zh"]);
            $ul.append(html);
        }
    });

    $filterPopup.append($ul);

    $("body").append($filterPopup);

    $filterPopup.on('click', "li", function() {
        console.log($(this).data("ioc"));
        $(this).addClass("active").siblings(".active").removeClass("active");
        $("body").trigger("filterChange", $(this).data("ioc"));
        $filterPopup.hide();
    });

    $filterPopup.on('click', ".mask", function() {
        $filterPopup.hide();
    });

    $(".filter").on("click", function() {
        var activeIOC = IOC_CodeHelper.getIOCByCountryName(window.selectedCountry);
        $filterPopup.find("li.active").removeClass("active");
        if (activeIOC) {
            $filterPopup.find("li[data-ioc='" + activeIOC.toLowerCase() + "']").addClass("active");
        }
        $filterPopup.show();
    });

    $("body").on("filterChange mapselectchanged", function(event, ioc) {
        console.log(ioc);
        if (ioc) {
            var name = locale(IOC_CodeHelper.getCountryNameByIOC(ioc.toUpperCase()));
            $(".filter-value").find(".text").text(name);
            $(".filter-value").find("i").attr("class", "flag18 " + ioc.toLowerCase());
            $(".filter-value").removeClass("unset");
        } else {
            $(".filter-value").addClass("unset");
        }
    });
}




initFilter();





