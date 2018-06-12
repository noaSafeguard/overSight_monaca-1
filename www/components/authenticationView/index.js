'use strict';

app.authenticationView = kendo.observable({
    onShow: function () { },
    afterShow: function () { }
});

// START_CUSTOM_CODE_home
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_home
(function (parent) {
    var provider = app.data.progressDataProvider,
        mode = 'signin',
        registerRedirect = 'authenticationView',
        signinRedirect = 'machoz',
        rememberKey = 'hadrachaDataProvider_authData_homeModel',
        init = function (error, result) {
            $('.status').text('');
            if (error) {
                if (error.message) {
                    $('.status').text(error.message);
                }
                try {
                    var err = '';
                    if (result === progress.data.Session.AUTHENTICATION_FAILURE) {
                        err = 'Login failed. Authentication error.';
                    } else if (result === progress.data.Session.GENERAL_FAILURE) {
                        err = 'Login failed. Unspecified error.';
                    }

                    $('.status').text(err);
                } catch (e) { }

                return false;
            }

            var activeView = mode === 'signin' ? '.signin-view' : '.signup-view',
                model = parent.homeModel;

            if (provider.setup && provider.setup.offlineStorage && !app.isOnline()) {
                $('.signin-view', 'signup-view').hide();
                $('.offline').show();
            } else {
                $('.offline').hide();

                if (mode === 'signin') {
                    $('.signup-view').hide();
                } else {
                    $('.signin-view').hide();
                }

                $(activeView).show();
            }

            if (model && model.set) {
                model.set('logout', null);
            }

            var rememberedData = localStorage ? JSON.parse(localStorage.getItem(rememberKey)) : app[rememberKey];
            if (rememberedData && rememberedData.email && rememberedData.password) {

                parent.homeModel.set('email', rememberedData.email);
               
              
                parent.homeModel.set('password', rememberedData.password);
                parent.homeModel.signin();
            }
        },
        successHandler = function (data) {
            var redirect = mode === 'signin' ? signinRedirect : registerRedirect,
                model = parent.homeModel || {},
                logout = model.logout;

            if (logout) {
                model.set('logout', null);
            }
            if (data) {
                if (logout) {
                    provider.Users.logout(init, init);
                    return;
                }
                var rememberedData = {
                    email: model.email,
                    password: model.password
                };
                if (model.rememberme && rememberedData.email && rememberedData.password) {
                    if (localStorage) {
                        localStorage.setItem(rememberKey, JSON.stringify(rememberedData));
                    } else {
                        app[rememberKey] = rememberedData;
                    }
                }
                //lizis@safeguard.co.il
                //Lizzi0001
                setTimeout(function () {
                    localStorage.setItem("email", $('#email').val());
                    //alert($('#email').val());
                    var email1 = localStorage.getItem("email");
                    var pas1 = parent.homeModel.get('password');
                    //var srRequest = "https://www.rollbase.com/rest/api/login?loginName=" + email1 + "&password=" + pas1;
                    //+ "&output=json";
                    //request = WebRequest.Create(srRequest);
                    //HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                    //Stream dataStream = response.GetResponseStream();
                    //StreamReader reader = new StreamReader(dataStream);
                    //string responseFromServer = reader.ReadToEnd();
                    //return responseFromServer;
                    //var xmlHttp = new XMLHttpRequest();
                    //xmlHttp.open("GET", srRequest, true);
                    //xmlHttp.send();
                    //var response = xmlHttp.responseText;
                    //alert(response);
                    //json = JSON.parse(srRequest);
                    app.mobileApp.navigate('components/' + redirect + '/view.html');
                }, 0);
            } else {
                init();
            }
        },
        homeModel = kendo.observable({
            displayName: '',
            email: '',
            password: '',
            errorMessage: '',
            validateData: function (data) {
                var model = homeModel;

                if (!data.email && !data.password) {
                    model.set('errorMessage', 'Missing credentials.');
                    return false;
                }

                if (!data.email) {
                    model.set('errorMessage', 'Missing username or email.');
                    return false;
                }

                if (!data.password) {
                    model.set('errorMessage', 'Missing password.');
                    return false;
                }

                return true;
            },
            signin: function () {
                var model = homeModel,
                    email = model.email.toLowerCase(),
                    password = model.password;

                if (!model.validateData(model)) {
                    return false;
                }

                provider.Users.login(email, password, successHandler, init);

            },
          
            register: function () {
                var model = homeModel,
                    email = model.email.toLowerCase(),
                    password = model.password,
                    displayName = model.displayName,
                    attrs = {
                        Email: email,
                        DisplayName: displayName
                    };

                if (!model.validateData(model)) {
                    return false;
                }

                model.set('errorMessage', 'Progress Data Service provider does not support registering new users.');

            },
            toggleView: function () {
                var model = homeModel;
                model.set('errorMessage', '');

                mode = mode === 'signin' ? 'register' : 'signin';

                init();
            }
        });

    parent.set('homeModel', homeModel);
    parent.set('afterShow', function (e) {
     document.getElementById('projectDetailsTab').style.display = "none";
     document.getElementById('machozTab').style.display = "none";
     document.getElementById('VersionTab').style.display = "";
     document.getElementById('logOutTab').style.display = "none";
        if (e && e.view && e.view.params && e.view.params.logout) {
            if (localStorage) {
                localStorage.setItem(rememberKey, null);
            } else {
                app[rememberKey] = null;
            }
            homeModel.set('logout', true);
        }
        provider.Users.currentUser().then(successHandler, init);
    });
})(app.authenticationView);

// START_CUSTOM_CODE_homeModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_homeModel