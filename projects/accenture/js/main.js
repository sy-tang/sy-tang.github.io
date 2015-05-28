// 定义微信分享的数据
var wxData = {
    "appId": "", // 服务号可以填写appId
    "imgUrl" : 'http://sy-tang.github.io/projects/accenture/img/page_nav.png',
    "link" : window.location.href,
    "desc" : '埃森哲2015技术展望报告 - content',
    "title" : "埃森哲2015技术展望报告"
};

// 分享的回调
var wxCallbacks = {
    // 收藏操作是否触发回调，默认是开启的
    favorite : false,

    // 分享操作开始之前
    ready : function() {
        // 你可以在这里对分享的数据进行重组
        alert("准备分享");
    },
    // 分享被用户自动取消
    cancel : function(resp) {
        // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
        alert("分享被取消，msg=" + resp.err_msg);
    },
    // 分享失败了
    fail : function(resp) {
        // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
        alert("分享失败，msg=" + resp.err_msg);
    },
    // 分享成功
    confirm : function(resp) {
        // 分享成功了，我们是不是可以做一些分享统计呢？
        alert("分享成功，msg=" + resp.err_msg);
    },
    // 整个分享过程结束
    all : function(resp,shareTo) {
        // 如果你做的是一个鼓励用户进行分享的产品，在这里是不是可以给用户一些反馈了？
        alert("分享" + (shareTo ? "到" + shareTo : "") + "结束，msg=" + resp.err_msg);
    }
};
// 自定义分享到：微信好友、朋友圈、腾讯微博、QQ好友
WeixinApi.share(wxData,wxCallbacks);
WeixinApi.enableDebugMode();


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