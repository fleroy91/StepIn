/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true */
var _curWin = null;
function Spinner(){ 'use strict';
    return this;
}

Spinner.add = function(win) { 'use strict';
    win = win || _curWin;
    if(win && ! win.spinner_func_added && typeof win === 'TiUIWindow') {
        win.addEventListener('focus', function(e) {
            _curWin = win;
        });
        win.spinner_func_added = true;
    }
};

Spinner.show = function(win) { 'use strict';
    var w = win || _curWin;
    if(w && ! w.spinner && typeof win === 'TiUIWindow') {
        Ti.API.info("Spinner : SHOW : " + w.hiddenTitle);
        var spinner=Ti.UI.createActivityIndicator({
            zIndex : 1000,
            style : Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
            font : {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'},
            indicatorColor : '#d92276'
        });
        win.add(spinner);
        win.spinner = spinner;
    }
};

Spinner.hide = function(win) { 'use strict';
    var w = win || _curWin;
    if(w && w.spinner) {
        Ti.API.info("Spinner : HIDE : " + w.hiddenTitle);
        win.remove(w.spinner);
        w.spinner = null;
    }
};

module.exports = Spinner;
