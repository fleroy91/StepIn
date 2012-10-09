/*global Ti: true, Titanium : true, Tools:true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var Tools = require("/etc/Tools");

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

    w.open(a);
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
    return (url && Tools.startsWith(url, "http:"));
};
Image.imageDirectoryName = 'cachedImages';
Image.convertUrlInFile = function(url) { 'use strict';
    var filenames = url.split('/'), filename;
    // URL are always like "http://files.storageroomapp.com/accounts/4ff6ebed1b338a6ace001893/collection/4ff6f9851b338a3e72000c64/entries/4ff6fa0d1b338a5c1e0007f5/fields/k4ff6f9ec1b338a5c1e0007af/file.jpg?m_version=xxx"
    if(url.indexOf("files.storageroomapp.com") > 0) {
        filename = filenames[filenames.length - 4] + "_" + filenames[filenames.length - 2] ;
        var end = filenames[filenames.length - 1].split('?');
        if(end.length > 1) {
            filename += '_' + end[1];
        }
        filename += '_' + end[0];
    } else {
        // We only keep the name of the file
        filename =  filenames[filenames.length - 1];
    }

    var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Image.imageDirectoryName, filename);
    return file;
};

// Return the image to set to the image view
Image.cacheImage = function(url, func) { 'use strict';
    // Grab the filename
    // Ti.API.info("Cache Photo : " + url);
    var ret = null, imageDirectoryName = 'cachedImages';
    if(Image.isGoodUrl(url)) {
        var file = Image.convertUrlInFile(url);
    
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
                    file.write(xhr.responseData);
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

// To create a view of points !
Image.createPointView = function(points, height, width) { 'use strict';
    var pv = Ti.UI.createView({
        width : width,
        height : height
    });
    
    /*
    var img = Ti.UI.createImageView({
        image : '/images/stepin.png',
        width : width,
        height : height,
        left : 0,
        top : 0
    });
    pv.add(img);
    */
    
    var lbl = Ti.UI.createLabel({
        text : (points > 0 ? '+' : '') + points,
        textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
        font : {fontSize : 18, fontWeight : 'bold'},
        color : '#d92276',
        height : height,
        right : 20
    });
    pv.add(lbl);
    var lblSmall = Ti.UI.createLabel({
        text : " pts",
        textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
        verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM,
        font : {fontSize : 12, fontWeight : 'bold'},
        color : '#d92276',
        height : height,
        right : 1
    });
    pv.add(lblSmall);
    
    return pv;
};
    
module.exports = Image;