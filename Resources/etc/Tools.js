/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
function Tools() { 'use strict';
    return this;
}

Tools.endsWith = function(str, suffix) { 'use strict';
    return (str.indexOf(suffix, str.length - suffix.length) !== -1);
};
Tools.startsWith = function(str, prefix) { 'use strict';
    return (str.indexOf(prefix, 0) === 0);
};

Tools.getEmails = function(person, nb) { 'use strict';
    var key;
    var emails = [];
    nb = nb || 100;
    for(key in person.email) {
        if(person.email.hasOwnProperty(key)) {
            var i, arr = person.email[key];
            for(i = 0; nb >=0 && i < arr.length; i++) {
                emails.push(arr[i]);
                nb --;
            }
        }
    }
    return emails;
};
Tools.hasEmail = function(person) { 'use strict';
    var key;
    var found = false;
    for(key in person.email) {
        if(person.email.hasOwnProperty(key)) {
            var i, arr = person.email[key];
            for(i = 0; !found && i < arr.length; i++) {
                found = true;
            }
        }
    }
    return found;
};

Tools.getImageBlob = function(imgView) { 'use strict';
    var blob = imgView.toBlob();
    var image = imgView.getImage();

    if(image === imgView.defaultFilename) {
        blob = null;
    }
    return blob;
};

Tools.strcmp = function(a, b) { 'use strict';
    if (a.toString() < b.toString()) { return -1; }
    if (a.toString() > b.toString()) { return 1; }
    return 0;
};

Tools.isSimulator = function() { 'use strict';
    var ret = (Titanium.Platform.model === 'google_sdk' || Titanium.Platform.model === 'Simulator');
    return ret;
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

function twoDigits(x) { 'use strict';
    var ret = x.toString();
    if(x < 10) {
        ret = "0" + ret;
    }
    return ret;
}

Tools.formatDate = function(date) { 'use strict';
    var str = twoDigits(date.getDate()) + "/" + twoDigits(date.getMonth() + 1) + "/" + date.getFullYear() + 
        " à " + twoDigits(date.getHours()) + ":" + twoDigits(date.getMinutes());
    return str;
};

module.exports = Tools;