
var u = navigator.userAgent, app = navigator.appVersion;
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
var reportLink = isiOS ? "http://promote.caixin.com/upload/accenture2015_m.pdf" :
                "http://promote.caixin.com/2015/accenture_technology_vision/index.html";

$(".anchor6").attr("href", reportLink);

Pace.on("done", function() {
    $("#pageContain").show();
});

var ctlBtns = $(".fixed_block"), navBtn = $(".nav_btn");

var $pages = $(".page"), runPage, pageCursor = 0, swipeEnable = false;

runPage = new FullPage({

    id : 'pageContain',                            // id of contain
    slideTime : 800,                               // time of slide
    continuous : false,                            // create an infinite feel with no endpoints
    effect : {                                     // slide effect
            transform : {
                translate : 'Y',                   // 'X'|'Y'|'XY'|'none'
                scale : [1, 1],                   // [scalefrom, scaleto]
                rotate : [0, 0]                    // [rotatefrom, rotateto]
            },
            opacity : [1, 1]                       // [opacityfrom, opacityto]
        },                           
    mode : 'wheel,touch',               // mode of fullpage
    easing : 'ease'                                // easing('ease','ease-in','ease-in-out' or use cubic-bezier like [.33, 1.81, 1, 1];
     ,onSwipeStart : function(index, thisPage) {   // callback before pageChange
        if (!swipeEnable)
            return 'stop';
        // if (index < 2) {
        //     return "stop";
        // }
     }
    //  ,beforeChange : function(index, thisPage) {   // callback before pageChange
    //    return 'stop';
    //  }
     ,callback : function(index, thisPage) {       // callback when pageChange
       if (pageCursor > 1) {
          $pages.eq(pageCursor).find(".contain.hide").removeClass("hide")
            .siblings().addClass("hide");
       } 
       pageCursor = index;
       swipeEnable = false;
     }
});

// runPage.go(6);

navBtn.on("touchstart", function() {
    runPage.go(1);
});

$(".nav_anchor").on("click", function() { 
    var page = parseInt($(this).data("page"));
    runPage.go(page);
    return false;
});

$(".start_btn").on("click", function() {
    runPage.next();
});

$(".download_btn").on("click", function() {
    window.open(reportLink);
});

$("#pageContain").on("click", ".slide_btn", function() {
    runPage.next();
});

$("#pageContain").on("click", ".tag .tapBlock", function() {
    $(".tag.showing").removeClass("showing");
    $(this).parent().addClass("showing");
});

$("#pageContain").on("click", ".explore", function() {
    var page = $pages.eq(runPage.thisPage());
    page.find(".contain").eq(0).addClass("hide");
    page.find(".contain").eq(1).removeClass("hide");
    swipeEnable = true;
});