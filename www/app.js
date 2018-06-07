'use strict';

(function() {
    var app = {
        data: {}
    };
    var bootstrap = function() {
        $(function() {
            app.mobileApp = new kendo.mobile.Application(document.body, {
                transition: 'none',
                skin: 'flat',
                
                 initial: 'components/authenticationView/view.html'
              
            });
        });
    };

    if (window.cordova) {
        document.addEventListener('deviceready', function() {
            if (navigator && navigator.splashscreen) {
                navigator.splashscreen.hide();
            }

            var element = document.getElementById('appDrawer');
            if (typeof(element) != 'undefined' && element !== null) {
                if (window.navigator.msPointerEnabled) {
                    $('#navigation-container').on('MSPointerDown', 'a', function(event) {
                        app.keepActiveState($(this));
                    });
                } else {
                    $('#navigation-container').on('touchstart', 'a', function(event) {
                        app.keepActiveState($(this));
                    });
                }
            }

            bootstrap();
        }, false);
    } else {
        bootstrap();
    }

    app.keepActiveState = function _keepActiveState(item) {
        var currentItem = item;
        $('#navigation-container li a.active').removeClass('active');
        currentItem.addClass('active');
    };

    window.app = app;

    app.isOnline = function() {
        if (!navigator || !navigator.connection) {
            return true;
        } else {
            return navigator.connection.type !== 'none';
        }
    };
}());

function CompassHelper() {
}

CompassHelper.prototype = {
	watchID : null,
    
	run: function() {
		var that = this,
		refreshButton = document.getElementById("refreshButton"),
		buttonWatch = document.getElementById("watchButton");
		
		buttonWatch.addEventListener("click", 
									 function() {
										 that._handleWatch.apply(that, arguments);
									 }, 
									 false);
		
		refreshButton.addEventListener("click", 
									   function() {
										   that._handleRefresh.apply(that, arguments)
									   }, 
									   false);
	},
    
	_handleRefresh: function() {
		var that = this;
		navigator.compass.getCurrentHeading(function() { 
			that._rotateCompassImage.apply(that, arguments);
			that._displayHeading.apply(that, arguments)
		},
											function() {
												that._onCompassWatchError.apply(that, arguments)
											});
	},
    
	_handleWatch: function() {
		var that = this,
		button = document.getElementById("watchButton");

		if (that.watchID !== null) {
			navigator.compass.clearWatch(that.watchID);
			that.watchID = null;
			button.innerHTML = "Start Compass";
			that._clearCurrentNotification();
		}
		else {
			var options = { frequency: 1000 };
			
			that._clearCurrentNotification();
			that._writeNotification("Waiting for compass information...");
			button.innerHTML = "Stop Compass";
            
			that.watchID = navigator.compass.watchHeading(function() { 
				that._displayHeading.apply(that, arguments)
				that._rotateCompassImage.apply(that, arguments);
			}, 
														  function() {
															  that._onCompassWatchError.apply(that, arguments)
														  }, 
														  options);
		}
	},
    
	_displayHeading: function(heading) {
		var that = this,
		magneticHeading = heading.magneticHeading,
		timestamp = heading.timestamp;
        
		var informationMessage = 'Magnetic field: ' + magneticHeading + '<br />' +
								 'Timestamp: ' + timestamp + '<br />' 
        
		that._clearCurrentNotification();
		that._writeNotification(informationMessage);
	},
    
	_onCompassWatchError: function(error) {
		var that = this,
		errorMessage,
		button = document.getElementById("watchButton");
		switch (error.code) {
			case 20:
				errorMessage = "Compass not supported";
				break;
			case 0:
				errorMessage = "Compass internal error";
				break;
			default:
				errorMessage = "Compass error";
		}
        
		button.innerHTML = "Start Compass";
		that.watchID = null;
		that._clearCurrentNotification();
		that._writeNotification(errorMessage);
	},
    
	_writeNotification: function(text) {
		var result = document.getElementById("result");
		result.innerHTML = text;
	},
    
	_clearCurrentNotification: function() {
		var result = document.getElementById("result");
		result.textContent = "";
	}, 
      
	_rotateCompassImage : function(heading) {
		var compassDiv = document.getElementById("compass"),
		magneticHeading = magneticHeading = 360 - heading.magneticHeading;
        
		var rotation = "rotate(" + magneticHeading + "deg)";
              
		compassDiv.style.webkitTransform = rotation;
	}
}
// START_CUSTOM_CODE_kendoUiMobileApp
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_kendoUiMobileApp