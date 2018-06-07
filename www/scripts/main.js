

//document.addEventListener("deviceready", onDeviceReady, false);

//function id(element) {
//    return document.getElementById(element);
//}

//function onDeviceReady() {
//    cameraApp = new cameraApp();
//    cameraApp.run();

//    navigator.splashscreen.hide();
//}


//var lastImg;
//function cameraApp() { }

//cameraApp.prototype = {
//    _pictureSource: null,

//    _destinationType: null,

//    run: function () {
//        var that = this;

//        that._pictureSource = navigator.camera.PictureSourceType;
//        that._destinationType = navigator.camera.DestinationType;
//        // that._capturePhoto.apply(that, arguments);

//        id("capturePhotoButton").addEventListener("click", function () {
//            that._capturePhoto.apply(that, arguments);
//        });
//        id("capturePhotoButton11").addEventListener("click", function () {
//            that._capturePhoto1.apply(that, arguments);
//        });
//        //id("capturePhotoEditButton").addEventListener("click", function(){
//        //    that._capturePhotoEdit.apply(that,arguments)
//        //});
//        //id("getPhotoFromLibraryButton").addEventListener("click", function(){
//        //    that._getPhotoFromLibrary.apply(that,arguments)
//        //});
//        //id("getPhotoFromAlbumButton").addEventListener("click", function(){
//        //    that._getPhotoFromAlbum.apply(that,arguments);
//        //});
//    },

//    _capturePhoto: function () {
//        var that = this;
//        var elem = document.getElementById("capturePhotoButton");
//        if (elem.style.color == "red") {
//            $("#popImg1").kendoMobileModalView("open");
//            var imagePop = document.getElementById('imagePop');
//            sessionStorage.setItem("src", imagePop.src);
//        }
//        else {
//            navigator.camera.getPicture(function () {
//                that._onPhotoDataSuccess.apply(that, arguments);
//            }, function () {
//                that._onFail.apply(that, arguments);
//            }, {
//                quality: 50,
//                destinationType: that._destinationType.DATA_URL
//            });
//        }

//    },
//    _capturePhoto1: function () {
//        var that = this;
//        navigator.camera.getPicture(function () {
//            that._onPhotoDataSuccess.apply(that, arguments);
//        }, function () {
//            that._onFail.apply(that, arguments);
//        }, {
//            quality: 50,
//            destinationType: that._destinationType.DATA_URL
//        });
//    },
//    _capturePhotoEdit: function () {
//        var that = this;
//        // Take picture using device camera, allow edit, and retrieve image as base64-encoded string. 
//        // The allowEdit property has no effect on Android devices.
//        navigator.camera.getPicture(function () {
//            that._onPhotoDataSuccess.apply(that, arguments);
//        }, function () {
//            that._onFail.apply(that, arguments);
//        }, {
//            quality: 20, allowEdit: true,
//            destinationType: cameraApp._destinationType.DATA_URL
//        });
//    },

//    _getPhotoFromLibrary: function () {
//        var that = this;
//        // On Android devices, pictureSource.PHOTOLIBRARY and
//        // pictureSource.SAVEDPHOTOALBUM display the same photo album.
//        that._getPhoto(that._pictureSource.PHOTOLIBRARY);
//    },

//    _getPhotoFromAlbum: function () {
//        var that = this;
//        // On Android devices, pictureSource.PHOTOLIBRARY and
//        // pictureSource.SAVEDPHOTOALBUM display the same photo album.
//        that._getPhoto(that._pictureSource.SAVEDPHOTOALBUM)
//    },

//    _getPhoto: function (source) {
//        var that = this;
//        // Retrieve image file location from specified source.
//        navigator.camera.getPicture(function () {
//            that._onPhotoURISuccess.apply(that, arguments);
//        }, function () {
//            cameraApp._onFail.apply(that, arguments);
//        }, {
//            quality: 50,
//            destinationType: cameraApp._destinationType.FILE_URI,
//            sourceType: source
//        });
//    },

//    _onPhotoDataSuccess: function (imageData) {
//        var src = "data:image/jpeg;base64," + imageData;
//        sessionStorage.setItem("srcSave", src);
//        var elem = document.getElementById("capturePhotoButton");
//        $(function () {
//            var imagePop = document.getElementById('imagePop1');
//            imagePop.src = src;
//        });

//        if (elem.style.color != "red") {
//            var text = $('#file');
//            text.val(src);
//            document.getElementById('capturePhotoButton').style.color = "red";

//        }
//    },

//    _onPhotoURISuccess: function (imageURI) {
//        var smallImage = document.getElementById('smallImage');
//        smallImage.style.display = 'block';

//        // Show the captured photo.
//        smallImage.src = imageURI;
//    },

//    _onFail: function (message) {
//        alert(message);
//    }
//}



document.addEventListener("deviceready", onDeviceReady, false);
function id(element) {
    return document.getElementById(element);
}
function onDeviceReady() {
    cameraApp = new cameraApp();
    cameraApp.run();
    navigator.splashscreen.hide();
}
var lastImg;
function cameraApp() { }
cameraApp.prototype = {
    _pictureSource: null,
    _destinationType: null,
    run: function () {
        var that = this;
        that._pictureSource = navigator.camera.PictureSourceType;
        that._destinationType = navigator.camera.DestinationType;
        $('body').on('click', ".capturePhotoButtonClass", function () {
            // alert($(this).attr('id'));
            addEventListener("click", that._capturePhoto.apply(that, arguments, myid = $(this).attr('id')));
        });
        //id("capturePhotoButton").addEventListener("click", function () {
        //    that._capturePhoto.apply(that, arguments);
        //});
        //id("capturePhotoButton1").addEventListener("click", function () {
        //    that._capturePhoto1.apply(that, arguments);
        //});
    },

    _capturePhoto: function () {
        var that = this;
        var elem = document.getElementById("capturePhotoButton");
        if (elem.style.color == "red") {

            jQuery.noConflict();
            $("#popImg1").kendoMobileModalView("open");
            // document.getElementById("popImg1").style.display = "block";
            var imagePop = document.getElementById('imagePop');
            sessionStorage.setItem("src", imagePop.src);
        }
        else {
            navigator.camera.getPicture(function () {
                that._onPhotoDataSuccess.apply(that, arguments);
            }, function () {
                that._onFail.apply(that, arguments);
            }, {
                quality: 50,
                destinationType: that._destinationType.DATA_URL
            });
        }

    },
    _capturePhoto1: function () {

        var that = this;
        navigator.camera.getPicture(function () {
            that._onPhotoDataSuccess.apply(that, arguments);
        }, function () {
            that._onFail.apply(that, arguments);
        }, {
            quality: 50,
            destinationType: that._destinationType.DATA_URL
        });
    },
    _capturePhotoEdit: function () {
        var that = this;
        // Take picture using device camera, allow edit, and retrieve image as base64-encoded string.
        // The allowEdit property has no effect on Android devices.
        navigator.camera.getPicture(function () {
            that._onPhotoDataSuccess.apply(that, arguments);
        }, function () {
            that._onFail.apply(that, arguments);
        }, {
            quality: 20, allowEdit: true,
            destinationType: cameraApp._destinationType.DATA_URL
        });
    },

    _getPhotoFromLibrary: function () {
        var that = this;
        // On Android devices, pictureSource.PHOTOLIBRARY and
        // pictureSource.SAVEDPHOTOALBUM display the same photo album.
        that._getPhoto(that._pictureSource.PHOTOLIBRARY);
    },

    _getPhotoFromAlbum: function () {
        var that = this;
        // On Android devices, pictureSource.PHOTOLIBRARY and
        // pictureSource.SAVEDPHOTOALBUM display the same photo album.
        that._getPhoto(that._pictureSource.SAVEDPHOTOALBUM)
    },

    _getPhoto: function (source) {
        var that = this;
        // Retrieve image file location from specified source.
        navigator.camera.getPicture(function () {
            that._onPhotoURISuccess.apply(that, arguments);
        }, function () {
            cameraApp._onFail.apply(that, arguments);
        }, {
            quality: 50,
            destinationType: cameraApp._destinationType.FILE_URI,
            sourceType: source
        });
    },

    _onPhotoDataSuccess: function (imageData) {
        var src = "data:image/jpeg;base64," + imageData;
        sessionStorage.setItem("srcSave", src);
        var imagePop = document.getElementById('imagePop');
        imagePop.src = src;
        var text = $('#file');
        text.val(src);

        //var elem = document.getElementById("capturePhotoButton");
        //$(function () {
        //    var imagePop = document.getElementById('imagePop');
        //    imagePop.src = src;

        //});

        //if (elem.style.color != "red") {
        //    var text = $('#file');
        //    text.val(src);
        //}
        document.getElementById('capturePhotoButton').style.color = "red";
    },

    _onPhotoURISuccess: function (imageURI) {
        var smallImage = document.getElementById('smallImage');
        smallImage.style.display = 'block';

        // Show the captured photo.
        smallImage.src = imageURI;
    },

    _onFail: function (message) {
        alert(message);
    }
}