/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true */
function Tools() { 'use strict';
    return this;
}

Tools.endsWith = function(str, suffix) { 'use strict';
    return (str.indexOf(suffix, str.length - suffix.length) !== -1);
};
Tools.startsWith = function(str, prefix) { 'use strict';
    return (str.indexOf(prefix, 0) === 0);
};

Tools.getImageBlob = function(imgView) { 'use strict';
    var blob = imgView.toBlob();
    var image = imgView.getImage();

    if(image === imgView.defaultFilename) {
        blob = null;
    }
    return blob;
};

Tools.StringToUTF8 = function(str) { 'use strict';
    var buffer = Ti.createBuffer({ length: str.length * 2 + 2});
    Ti.Codec.encodeString({
        source: str,
        dest: buffer,
        charset: Ti.Codec.CHARSET_UTF8
    });
    return buffer.toString();
};

Tools.Hash2Qparams = function(args) { 'use strict';
    var key, qparams = "";
    for(key in args) {
        if(args.hasOwnProperty(key)) {
            var value = args[key];
            if(key === "email") {
                value = Ti.Network.encodeURIComponent(value.toLowerCase());
            }
            var param = (key + "=" + value);
            if(qparams.length > 0) {
                qparams += "&";
            } 
            qparams += param;
        }
    }
    return qparams;
};

module.exports = Tools;