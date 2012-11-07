/*global Ti: true, Titanium : true, Tools:true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var Tools = require("/etc/Tools");
require("ti.viewshadow");

// To be able to delete an image, just give {update : true}. The object must have a defaultFilename property
function Image() { 'use strict';
    return this;    
}

Image.loadOrTakeImage = function(img) {'use strict'; 
    var items = ['Prendre une photo', 'Choisir une photo'];
    if (img.defaultFilename !== img.image) {
        items.push("Supprimer la photo");
    }
    var cancelIndex = items.length;
    items.push("Annuler");

    var dialog = Ti.UI.createAlertDialog({
        buttonNames : items
    });
    dialog.addEventListener('click', function(e) {
        if (e.index === 0) {
            Titanium.Media.showCamera({
                success : function(event) {
                    var cropRect = event.cropRect;
                    var image = event.media;
                    var filename = Titanium.Filesystem.applicationDataDirectory + "/" + "article" + new Date().getTime() + ".png";
                    var f = Titanium.Filesystem.getFile(filename);
                    if (f.exists()) {
                        f.deleteFile();
                        f = Titanium.Filesystem.getFile(filename);
                    }
                    f.write(image);
                    e.source.img.setImage(f.nativePath);
                    e.source.img.changed = true;
                },
                cancel : function() {

                },
                error : function(error) {
                    var a = Titanium.UI.createAlertDialog({
                        title : 'Camera'
                    });
                    if (error.code === Titanium.Media.NO_CAMERA) {
                        if(Tools.isSimulator()) {
                            e.source.img.setImage('images/shop_debug_photo.png');
                            e.source.img.changed = true;
                        } else {
                            a.setMessage('Impossible de prendre une photo avec cet appareil');
                        }
                    } else {
                        a.setMessage('Erreur inattendue: ' + error.code);
                    }
                    a.show();
                },
                mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
                allowEditing : true,
                saveToPhotoGallery : true
            });
        } else if (e.index === 1) {
            Titanium.Media.openPhotoGallery({
                success : function(event) {
                    var image = event.media;

                    // set image view
                    Ti.API.debug('Our type was: ' + event.mediaType);
                    e.source.img.setImage(image);
                    e.source.img.changed = true;

                },
                cancel : function() {

                },
                error : function(error) {
                },
                allowEditing : false,
                mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
            });
        } else if (e.index !== cancelIndex) {
            // It must be the delete photo
            e.source.img.setImage(e.source.img.defaultFilename);
            e.source.img.changed = true;
        }
    });
    dialog.img = img;
    dialog.show();
};

// Zoom on a photo (e.source should be the image)
Image.displayZoom = function(e) { 'use strict';
    var img = e.source;
    var t = Titanium.UI.create2DMatrix();
    t = t.scale(0);

    var w = Titanium.UI.createWindow({
        backgroundColor : 'white',
        borderWidth : 2,
        borderColor : 'black',
        height : 400,
        width : 300,
        borderRadius : 3,
        opacity : 0.92,
        transform : t
    });

    // create first transform to go beyond normal size
    var t1 = Titanium.UI.create2DMatrix();
    t1 = t1.scale(1.1);
    var a = Titanium.UI.createAnimation();
    a.transform = t1;
    a.duration = 200;

    // when this animation completes, scale to normal size
    a.addEventListener('complete', function() {
        // Titanium.API.info('here in complete');
        var t2 = Titanium.UI.create2DMatrix();
        t2 = t2.scale(1.0);
        w.animate({
            transform : t2,
            duration : 200
        });

    });

    var i = Ti.UI.createImageView({
        image : img.image,
        height : 350,
        width : 250,
        top : 10
    });
    w.add(i);

    // create a button to close window
    var b = Titanium.UI.createButtonBar({
        labels : ['Fermer'],
        backgroundColor:'#336699',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 25,
        width : 150,
        bottom : 8
    });
    w.add(b);
    b.addEventListener('click', function() {
        var t3 = Titanium.UI.create2DMatrix();
        t3 = t3.scale(0);
        w.close({
            transform : t3,
            duration : 300
        });
    });

    w.open(a);
};

Image.displayMapZoom = function(mapview) { 'use strict';
    var t = Titanium.UI.create2DMatrix();
    t = t.scale(0);

    var w = Titanium.UI.createWindow({
        backgroundColor : 'white',
        borderWidth : 2,
        borderColor : 'black',
        height : 400,
        width : 300,
        borderRadius : 3,
        opacity : 0.92,
        transform : t
    });

    // create first transform to go beyond normal size
    var t1 = Titanium.UI.create2DMatrix();
    t1 = t1.scale(1.1);
    var a = Titanium.UI.createAnimation();
    a.transform = t1;
    a.duration = 200;

    // when this animation completes, scale to normal size
    a.addEventListener('complete', function() {
        // Titanium.API.info('here in complete');
        var t2 = Titanium.UI.create2DMatrix();
        t2 = t2.scale(1.0);
        w.animate({
            transform : t2,
            duration : 200
        });
    });

    var m = Titanium.Map.createView({
        mapType: Titanium.Map.STANDARD_TYPE,
        animate:true,
        userLocation:true,
        height : 350,
        width : 250,
        top : 10
    });
    w.add(m);
    m.setLocation(mapview.location);
    
    // create a button to close window
    var b = Titanium.UI.createButtonBar({
        labels : ['Fermer'],
        backgroundColor:'#336699',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 25,
        width : 150,
        bottom : 8
    });
    w.add(b);
    b.addEventListener('click', function() {
        var t3 = Titanium.UI.create2DMatrix();
        t3 = t3.scale(0);
        w.close({
            transform : t3,
            duration : 300
        });
    });

    
    w.addEventListener('open', function(e) {
        // We add the annotations of the mapview
        var annotations = mapview.getAnnotations();
        if(annotations) {
            var i;
            for(i = 0 ; i<annotations.length; i++) {
                var an = annotations[i];
                var img = Image.createImageView('read', an.leftView.img.image, null, {width : 30, height : 30});
                var annotation = Ti.Map.createAnnotation({
                    latitude:an.latitude,
                    longitude:an.longitude,
                    leftView : img,
                    title : an.title,
                    subtitle : an.subtitle,
                    animate:true
                });
                m.addAnnotation(annotation);
                m.selectAnnotation(annotation);
            }
        }
    });
    
    w.addEventListener('close', function(e) {
        m.setUserLocation(false); 
    });

    w.open(a);
}; 

// Zoom on a list of photos (e.source should be the scrollview)
Image.displayViewZoomMany = function(imgs) { 'use strict';
    // var img = e.source;
    var t = Titanium.UI.create2DMatrix();
    t = t.scale(0);

    var w = Titanium.UI.createWindow({
        backgroundColor : 'white',
        borderWidth : 2,
        borderColor : 'black',
        height : 400,
        width : 300,
        borderRadius : 3,
        opacity : 0.92,
        transform : t
    });

    // create first transform to go beyond normal size
    var t1 = Titanium.UI.create2DMatrix();
    t1 = t1.scale(1.1);
    var a = Titanium.UI.createAnimation();
    a.transform = t1;
    a.duration = 200;

    // when this animation completes, scale to normal size
    a.addEventListener('complete', function() {
        var t2 = Titanium.UI.create2DMatrix();
        t2 = t2.scale(1.0);
        w.animate({
            transform : t2,
            duration : 200
        });

    });

    var views = [];
    if(imgs) {
        var nbImgs = imgs.length, i;
        for(i = 0; i < nbImgs; i ++) {
            var imgBig = Ti.UI.createImageView({
                image : imgs[i].getImage()
            });
            views.push(imgBig);
        }
        var svbig = Ti.UI.createScrollableView({
            showPagingControl:true,
            pagingControlColor : 'lightgray',
            height : 400 - 60, 
            views:views
        });
        w.add(svbig);
    }

    // create a button to close window
    var b = Titanium.UI.createButtonBar({
        labels : ['Fermer'],
        backgroundColor:'#336699',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 25,
        width : 150,
        bottom : 8
    });
    w.add(b);
    b.addEventListener('click', function() {
        var t3 = Titanium.UI.create2DMatrix();
        t3 = t3.scale(0);
        w.close({
            transform : t3,
            duration : 300
        });
    });

    w.open(a);
};
/* 
    Developed by Kevin L. Hopkins (http://kevin.h-pk-ns.com)
    You may borrow, steal, use this in any way you feel necessary but please
    leave attribution to me as the source.  If you feel especially grateful,
    give me a linkback from your blog, a shoutout @Devneck on Twitter, or 
    my company profile @ http://wearefound.com.

   Expects parameters of the directory name you wish to save it under, the url of the remote image, 
   and the Image View Object its being assigned to. */
Image.isGoodUrl = function(url) { 'use strict';
    return (url && Tools.startsWith(url, "http"));
};
Image.imageDirectoryName = 'cachedImages';
Image.convertUrlInFile = function(url, width, height) { 'use strict';
    var filenames = url.split('/'), filename;
    
    var suffix = '';
    if(width && height) {
        suffix = width + 'x' + height + '_';
    }
    
    // URL are always like "http://files.storageroomapp.com/accounts/4ff6ebed1b338a6ace001893/collection/4ff6f9851b338a3e72000c64/entries/4ff6fa0d1b338a5c1e0007f5/fields/k4ff6f9ec1b338a5c1e0007af/file.jpg?m_version=xxx"
    if(url.indexOf("files.storageroomapp.com") > 0) {
        filename = filenames[filenames.length - 4] + "_" + filenames[filenames.length - 2] ;
        var end = filenames[filenames.length - 1].split('?');
        if(end.length > 1) {
            filename += '_' + end[1];
        }
        filename += suffix + '_' + end[0];
    } else {
        // We only keep the name of the file
        filename = suffix + filenames[filenames.length - 1];
    }

    var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Image.imageDirectoryName, filename);
    return file;
};
/**
 * Load the image from the URL and returns a blob
 * 
 * @param {url} url: The url of the image to load
 * @param {callback} func : the callback
 * @returns : nothing because blbo is sent via the callback
 */
Image.loadImage = function(url, func) { 'use strict';
    if(url) {
        var xhr = Ti.Network.createHTTPClient();
        xhr.onload = function() {
            if (xhr.status === 200) {
                func(xhr.responseData);
            }
        };
        xhr.open('GET', url);
        xhr.send();
    } else {
        func(null);
    }
};

// Return the image to set to the image view
Image.cacheImage = function(url, func, width, height) { 'use strict';
    // Grab the filename
    // Ti.API.info("Cache Photo : " + url);
    var ret = null, imageDirectoryName = 'cachedImages';
    if(typeof url === "string" && Image.isGoodUrl(url)) {
        var file = Image.convertUrlInFile(url, width, height);
    
        if (file.exists()) {
            // If it has been cached, assign the local asset path to the image view object.
            // Ti.API.info("Read cached image : " + file.nativePath);
            ret = file.nativePath;
            if(func) {
                func(ret) ;
            }
        } else {
            // If it hasn't been cached, grab the directory it will be stored in.
            var g = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Image.imageDirectoryName);
            if (!g.exists()) {
                // If the directory doesn't exist, make it
                g.createDirectory();
            }
            // Ti.API.info("Create cached image : " + file.nativePath);
    
            // Create the HTTP client to download the asset.
            var xhr = Ti.Network.createHTTPClient();
    
            xhr.onload = function() {
                if (xhr.status === 200) {
                    // On successful load, take that image file we tried to grab before and 
                    // save the remote image data to it.
                    var data = xhr.responseData;
                    file.write(data);
                    // Assign the local asset path to the image view object.
                    ret = file.nativePath;
                    if(func) {
                        func(ret);
                    }
                }
            };
    
            // Issuing a GET request to the remote URL
            xhr.open('GET', url);
            // Finally, sending the request out.
            xhr.send();
        }
    } else {
        // Ti.API.info("==> bad Url");
        ret = url;   
        if(func) {
            func(ret) ;
        }
    }
    return ret;
};

Image.cachedImageView = function(url, imageViewObject) { 'use strict';
    Image.cacheImage(url, function(image) {
        imageViewObject.image = image;    
    });
};

Image.replaceCache = function(url, newVersion, blob) { 'use strict';
    // We need to delete the current version
    if(Image.isGoodUrl(url)) {
        var file = Image.convertUrlInFile(url);
        if (file.exists()) {
            file.deleteFile();
        }

        // We need to create the new one !
        var sp = url.split('=');
        var newUrl = sp[0] + "=" + newVersion;
        var newFile = Image.convertUrlInFile(newUrl);
        if(file.exists()) {
            Ti.API.info("**** ERROR : the file should not exists !");
        }
        file.write(blob);
    }
};

// Options must contain :
// id, top, left, height, width
// other params :
// - noEvent : true | false -> do we have to add eventListeners
Image.createImageView = function(crud, image, defaultFilename, options) {'use strict';
    var edition_mode = (crud === 'create' || crud === 'update');
    if(! options) { options = {}; }
    options.defaultFilename = defaultFilename;
    options.borderColor = options.borderColor || 'black';
    if(! options.hasOwnProperty('borderWidth')) {
        options.borderWidth = 1;
    }
    if(! options.hasOwnProperty('borderRadius')) {
        options.borderRadius = 2;
    }

    var view = Ti.UI.createView(options);
    view.backgroundColor = 'white';

    var img = Ti.UI.createImageView({
        width : options.width, 
        height : options.height,
        scaled : true,
        centerpt : null
    });
    Image.cachedImageView((image || defaultFilename), img);
    
    view.add(img);
    view.img = img;
    // We add the label
    if(edition_mode) {
        var lbl = Ti.UI.createLabel({
            text : "Modifier",
            width : img.width,
            height : 15,
            bottom : 0,
            font : {fontSize : 10},
            color : 'white',
            backgroundColor : 'gray',
            opacity : 0.8,
            textAlign : Titanium.UI.TEXT_ALIGNMENT_CENTER 
        });
        lbl.img = img;
        view.add(lbl);
        if(! options.noEvent) {
            lbl.addEventListener('click', function(e){ Image.loadOrTakeImage(e.source.img);});
            img.addEventListener('click', function(e) { Image.loadOrTakeImage(e.source);});
        }
    } else {
        if(! options.noEvent) {
            img.addEventListener('click', Image.displayZoom);
        }
    }
    return view;
};

Image.createStepInStar = function(options, disable) { 'use strict';
    options.image = options.image || (disable ? '/images/checked.png' : '/images/stepin-star.png');
    options.height = options.height || 30;
    options.width = options.width || 30;
    var img = Ti.UI.createImageView(options);
    return img;
};

// To create a view of points !
Image.createPointView_v1 = function(points, height, width, disabled, options) { 'use strict';
    var pv = Ti.UI.createView({
        height : height
    });
    var color = (disabled ? '#b9b9b9' :  Ti.App.PinkColor); 
    var lblOptions = {
        text : '+' + points,
        textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
        font : {fontSize : 20, fontWeight : 'bold'},
        color : color,
        height : height,
        right : 22,
        shadowOffset : {x:1,y:1},
        shadowColor : 'white'
    };
    var key;
    for(key in options) {
        if(options.hasOwnProperty(key)) {
            lblOptions[key] = options.key;
        }
    }
    var lbl = Ti.UI.createLabel(lblOptions);
    pv.add(lbl);
    var star = Image.createStepInStar({height : 18, right : 0, width : 18}, disabled);
    pv.add(star);
    
    return pv;
};

Image.createPointView_v2 = function(points, height, width, disabled, options) { 'use strict';
    var pv = Ti.UI.createView(options);
    pv.height = height;
    pv.width = width;
    var color = (disabled ? '#b9b9b9' :  Ti.App.PinkColor);

    var lblOptions = {
        text : (disabled ? '✔ ' : '+') + points,
        textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
        font : {fontSize : 23, fontWeight : 'bold'},
        color : color,
        bottom :2,
        right : 27,
        shadowOffset : (options && options.shadowOffset),
        shadowColor : (options && options.shadowColor)
    };

    var lbl = Ti.UI.createLabel(lblOptions);
    pv.add(lbl);
    
    lblOptions.text = "steps";
    lblOptions.font = {fontSize : 10, fontWeight : 'normal'};
    lblOptions.bottom = 5;
    lblOptions.right = 0;
    
    var lblSmall = Ti.UI.createLabel(lblOptions);
    pv.add(lblSmall);
    
    pv.setPoints = function(newPoints) {
        lbl.text = (disabled ? '✔ ' : '+') + newPoints;
    };
    
    return pv;
};

Image.createPointView = function(points, height, width, disabled, options) { 'use strict';
    return Image.createPointView_v2(points, height, width, disabled, options);
};

Image.createIconsPointView_v1 = function(points, stepin, scanin, options) { 'use strict';
    var size = Math.round(options.height/ 2); 
    options.width = 90;
    var pv = Ti.UI.createView(options);
    var color = Ti.App.PinkColor;
    
    var lblOptions = {
        text : '+' + points,
        width : options.width,
        top : 2,
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : {fontSize : size - 7, fontWeight : 'bold'},
        color : color,
        height : size,
        shadowColor: 'white',
        shadowOffset: {x:1,y:1}
    };
    var lbl = Ti.UI.createLabel(lblOptions);
    pv.add(lbl);
    
    var nbIcons = (stepin ? 1 : 0) + (scanin ? 1 : 0);
    var iconSize = size - 5;
    var nleft = ((options.width - nbIcons * iconSize) / (nbIcons * 2 + 1)) * 2;
    
    var iconStepIn = Ti.UI.createImageView({
        image : "/images/steps.png",
        left : nleft,
        height : iconSize,
        width : iconSize,
        bottom : 2
    });
    var iconScan = Ti.UI.createImageView({
        image : "/images/tag.png",
        right : nleft,
        height : iconSize,
        width : iconSize,
        bottom : 2
    });
    if(stepin) {
        pv.add(iconStepIn);
    }
    if(scanin) {
        pv.add(iconScan);
    }
    
    var star = Image.createStepInStar({right : 0, width : size - 7, height : size - 7});
    // pv.add(star);
    return pv;
};
Image.createIconsPointView_v2 = function(points, stepin, scanin, options) { 'use strict';
    var size = Math.round(options.height); 
    options.width = 90;
    var pv = Ti.UI.createView(options);
    var color = Ti.App.PinkColor;
    
    var lblOptions = {
        text : '+' + points,
        width : options.width,
        textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
        font : {fontSize : 26, fontWeight : 'bold'},
        color : color,
        shadowColor: 'white',
        shadowOffset: {x:1,y:1},
        right : 30,
        bottom : 2
    };
    var lbl = Ti.UI.createLabel(lblOptions);
    pv.add(lbl);
    
    var lblSmall = Ti.UI.createLabel({
        text : "steps",
        font : {fontSize : 12, fontWeight : 'normal'},
        color : color,
        right : 0,
        bottom : 5,
        shadowColor: 'white',
        shadowOffset: {x:1,y:1},
        textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT
    });
    pv.add(lblSmall);    
    
    return pv;
};

Image.createIconsPointView = function(points, stepin, scanin, options) { 'use strict';
    return Image.createIconsPointView_v2(points, stepin, scanin, options);
};

/**
 * 
 * @param {Object} image : the image URL
 * @param {Object} width : the desire width
 * @param {Object} height : the desire 
 */
Image.squareImage = function(image, size) { 'use strict';
    // Here's our base (full-size) image. 
    // It's never displayed as-is.
    var ret = null;
    if(image) {
        var blob;
        if(typeof image === "string") {
            // It's a file so we load it !!
            var file = Ti.Filesystem.getFile(image);
            blob = file.read();
        } else {
            blob = image;
        }
        
        ret = blob.imageAsThumbnail(size, 0);
    } 
    return ret;
};

Image.createStepInStarPoints = function(image, points, over) { 'use strict';
    var view = Ti.UI.createView({
        width : 100,
        height : 55 
    });
    var img = Ti.UI.createImageView({
        image : image,
        height : 40,
        bottom : 0
    });
    view.add(img);
    var lbl = Ti.UI.createLabel({
        text : '+' + points,
        color : (over ? 'black' : "#d92276"),
        font : {fontSize : 14, fontWeight : 'bold'},
        shadowColor : (over ? '#f0f0f0' : '#f0f0f1'),
        shadowOffset : {x:1,y:1},
        top : 0,
        left : 25
    });
    view.add(lbl);
    return view.toImage();
};        
    
module.exports = Image;