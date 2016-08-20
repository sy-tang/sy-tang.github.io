/* set up XMLHttpRequest */
function loadData(url, callback) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function(e) {
        var arraybuffer = oReq.response;

        /* convert data to binary string */
        var data = new Uint8Array(arraybuffer);
        var arr = new Array();
        for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");

        /* Call XLSX */
        var workbook = XLSX.read(bstr, {type:"binary"});

        if (callback && typeof callback === 'function') {
            callback(workbook);
        }
    }

    oReq.send();
}

function locale(key) {
    return Translate.locale(key);
}
