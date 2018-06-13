
'use strict';
app.hightGuard = kendo.observable({
    onShow: function () { },
    afterShow: function () { },
    isUpdated: false,
    showEditDelete: true
});
(function (parent) {
    var dataProvider = app.data.progressDataProvider,
        current,
        //אובייקט מבדקים
        jsdoOptions = {
            name: 'CheckupObject',
            autoFill: false
        },
        jsdoOptionsProjectDashboard = {
            name: 'ProjectDashboard',
            autoFill: false
        },
        dataSourceOptions = {
            type: 'jsdo',
            transport: {},
            requestEnd: function (e) {
                var response = e.response;
                var type = e.type;

                if (type == "create") { current = response }
            },
            schema: {
                model: {
                    fields: {
                        'name': {
                            field: 'name',
                            defaultValue: ''
                        },
                    }
                }
            },
            serverFiltering: true,
        },
        dataSource = new kendo.data.DataSource({
            pageSize: 50
        }),
        dataSourceProjectDashboard = new kendo.data.DataSource({
            pageSize: 50
        }),
        homeModel = kendo.observable({
            dataSource: dataSource,
            dataSourceProjectDashboard: dataSourceProjectDashboard,
            _dataSourceOptions: dataSourceOptions,
            _jsdoOptionsProjectDashboard: jsdoOptionsProjectDashboard,
            _jsdoOptions: jsdoOptions,
            currentCheck: null,
            projectDetails: {},
            projectDetailsCheck: {},
            projectDetailsCheckF:false,
            //גירסא
            onClickVersion: function () {
                //cordova.getAppVersion.getVersionNumber().then(function (version) {
                //$('#versionLabel').text(version);
                //   versionLabel.innerHTML = version
                //  });
                versionLabel.innerHTML = " 1.2.1";
                $("#popVersion").kendoMobileModalView("open");
            },
            closePopVersion: function () {
                $("#popVersion").kendoMobileModalView("close");
            },
            //dayCheckClick: function (e) {
            //    homeModel.set("dailyCheckOrLikuy", true);
            //    app.mobileApp.navigate('#components/controlPoint/dayCheck.html');
            //},
            //סוגר פופאפ משתתפים בסיור
            closePopParticipants: function () {
                $("#popParticipants").kendoMobileModalView("close");
            },
            //המשך מפופאפ משתתפים בסיור
            resumePopParticipants: function () {
                $("#popParticipants").kendoMobileModalView("close");
                var IfMoreselect = document.getElementById("tourParticipantstext").value;
                var checkParticipants = "";
                if (IfMoreselect != " " && IfMoreselect != "" && IfMoreselect != "null") {
                    checkParticipants = document.getElementById("tourParticipantsLabel").value + ", " + IfMoreselect;
                    if (checkParticipants[0] == ",") {
                        var checkParticipants2 = "";
                        for (var i = 1; i < checkParticipants.length; i++) {
                            checkParticipants2 += checkParticipants[i]
                        }
                        checkParticipants = checkParticipants2;
                    }
                }
                else
                    checkParticipants = document.getElementById("tourParticipantsLabel").value;


                if (checkParticipants == " " || checkParticipants == "" || checkParticipants == "null")
                    checkParticipants = "אין";

                document.getElementById("tourParticipantstext").value = "";
                document.getElementById("tourParticipantsLabel").value = "";

                homeModel.addCheck(checkParticipants);
            },
            //פונקציה המייצרת מבדק חדש
            addCheck: function (checkParticipants) {
                app.mobileApp.showLoading();
                var jsdoOptions = homeModel.get('_jsdoOptions'),
                    jsdo = new progress.data.JSDO(jsdoOptions),
                    dataSourceOptions = homeModel.get('_dataSourceOptions'),
                    dataSource;
                dataSourceOptions.transport.jsdo = jsdo;
                dataSource = new kendo.data.DataSource(dataSourceOptions);

                var pos = {
                    "lat": "",
                    "lng": "",
                }

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        pos.lat = position.coords.latitude;
                        pos.lng = position.coords.longitude;
                    });
                }

                function saveModel(data) {
                    var checkObj = {
                        "TourParticipants": checkParticipants,
                        "locationId": (app.project.homeModel.get("dataItem")).locationId,
                        "Latitude": pos.lat,
                        "Longitude": pos.lng,

                    }
                    dataSource.add(checkObj);
                    dataSource.one('change', function (e) {
                        var cur = current;
                        homeModel.set("itemIs", false)
                        homeModel.currentCheck = current;
                        //setTimeout(function () {
                        app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
                        app.mobileApp.hideLoading();
                        //   }, 100);
                    });
                    dataSource.sync();
                };
                saveModel();
            },
            itemClick: function (e) {
                app.mobileApp.showLoading();
                var item = e.dataItem.uid;
                var dataSource = homeModel.get('dataSource');
                var itemModel = dataSource.getByUid(item);
                homeModel.set("itemIs", true)
                homeModel.currentCheck = itemModel;
                setTimeout(function () {
                app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
                app.mobileApp.hideLoading();
                  }, 300);

            },

            detailsProject: function () {
                app.mobileApp.showLoading();
              
                    var jsdoOptions = homeModel.get('_jsdoOptionsProjectDashboard'),
                        jsdo = new progress.data.JSDO(jsdoOptions),
                        dataSourceOptions = homeModel.get('_dataSourceOptions'),
                        dataSource;
                    dataSourceOptions.transport.jsdo = jsdo;
                    dataSource = new kendo.data.DataSource(dataSourceOptions)
                    dataSource.filter({
                        field: "locationId",
                        operator: "==",
                        value: (app.project.homeModel.get("dataItem")).locationId
                    });
                  

                      
                    dataSource.fetch(function () {
                        projectNamePop.innerHTML = (app.project.homeModel.get("dataItem")).LocationName;
                        if (homeModel.projectDetailsCheck) {
                            console.log(homeModel.projectDetailsCheck)
                            document.getElementById("projectDetailsCheckTable").style.display = "";
                            if (homeModel.projectDetailsCheck.structureNum == "null")//  מס' מבנים באתר:
                                homeModel.projectDetailsCheck.set("structureNum", "");

                            if (homeModel.projectDetailsCheck.builtUpArea == "null")// הערכת שטח בנוי:
                                homeModel.projectDetailsCheck.set("builtUpArea", "");

                            if (homeModel.projectDetailsCheck.FillingStructuresURL != "null")
                                document.getElementById("FillingStructuresPD").src = homeModel.projectDetailsCheck.FillingStructuresURL;
                            else
                                document.getElementById("FillingStructuresPD").src = "";

                            if (homeModel.projectDetailsCheck.siteSignageURL != "null")
                                document.getElementById("siteSignagePD").src = homeModel.projectDetailsCheck.siteSignageURL;
                            else
                                document.getElementById("siteSignagePD").src = "";
                              //FillingStructuresURL
                        //siteSignageURL
                        }
                        else {
                            document.getElementById("projectDetailsCheckTable").style.display = "none";
                        }
                        var view = dataSource.view();
                        if (view.length > 0) {
                            var itemModel = view[0];
                            removeNULL("ProjectAddress");
                            removeNULL("Longitude");
                            removeNULL("Latitude");
                            removeNULL("initiateName");
                            removeNULL("initiateNum");
                            removeNULL("ExecutiveCompanyName");
                            removeNULL("operatorNum");
                            removeNULL("settlement");
                            removeNULL("lot");
                            removeNULL("constructionType");
                            removeNULL("ProjectManager");
                            homeModel.set("projectDetails", itemModel)
                            function removeNULL(item) {
                                if (itemModel[item] == "null")
                                    itemModel[item] = "";
                            }
                        }
                        homeModel.set("dataSourceProjectDashboard", dataSource)
                        $("#popProjectDetails").kendoMobileModalView("open");
                        app.mobileApp.hideLoading();
                    });
              
               
            },
            closepopProjectDetails: function () {
                $("#popProjectDetails").kendoMobileModalView("close");

            },
            assignDetails: function () {
                $("#popProjectDetails").kendoMobileModalView("close");
                var dataSource = homeModel.get("dataSourceProjectDashboard")
                var view = dataSource.view();
                if (view.length > 0) {
                    //var obj = {
                    //    "ProjectAddress": document.getElementById('ProjectAddressPop').value,//כתובת
                    //    "Foreman": document.getElementById('ForemanPop').value,//מנהל עבודה
                    //    "ProjectManager": document.getElementById('ProjectManagerPop').value,//מנהל פרויקט
                    //    "ExecutiveCompanyName": document.getElementById('ExecutiveCompanyNamePop').value,//חברה מבצעת
                    //}
                    var obj = homeModel.get("projectDetails");
                    try {
                        var jsdo = dataSource.transport.jsdo;
                        var jsrow = jsdo.findById(view[0].id);
                        var afterUpdateFn;
                        jsrow.assign(obj);
                        afterUpdateFn = function (jsdo, record, success, request) {
                            jsdo.unsubscribe('afterUpdate', afterUpdateFn);
                            if (success === true) {
                                app.mobileApp.hideLoading();
                                app.mobileApp.navigate('#components/hightGuard/view.html');
                            }
                            else {
                                alert("שגיאה");
                            }
                        };
                        jsdo.subscribe('afterUpdate', afterUpdateFn);
                        jsdo.saveChanges();
                    } catch (e) {
                        alert("התגלתה בעיה בטעינת הנתונים, אנא נסה שוב  מאוחר יותר")
                    }
                }

            },
        });

    parent.set('homeModel', homeModel);
    parent.set('onShow', function (e) {
        try {
            var scroller = e.view.scroller;
            scroller.reset();
            app.mobileApp.showLoading();
            projectNameHome.innerHTML = (app.project.homeModel.get("dataItem")).LocationName;
            dataProvider.loadCatalogs().then(function _catalogsLoaded() {
                var jsdoOptions = homeModel.get('_jsdoOptions'),
                    jsdo = new progress.data.JSDO(jsdoOptions),
                    dataSourceOptions = homeModel.get('_dataSourceOptions'),
                    dataSource;
                dataSourceOptions.transport.jsdo = jsdo;
                dataSource = new kendo.data.DataSource(dataSourceOptions)
                dataSource.filter({
                    field: "locationId",
                    operator: "==",
                    value: (app.project.homeModel.get("dataItem")).locationId
                });
                dataSource.sort({ field: 'createdAt', dir: 'desc' });
                homeModel.set('projectDetailsCheck', {})
                homeModel.set('projectDetailsCheckF', false)
                homeModel.set('dataSource', dataSource)
                app.mobileApp.hideLoading();
                document.getElementById('projectDetailsTab').style.display = "";
                document.getElementById('machozTab').style.display = "";
                document.getElementById('VersionTab').style.display = "";
                document.getElementById('logOutTab').style.display = "";
            });
            app.mobileApp.hideLoading();
        } catch (e) {
            alert("שגיאה")
        }
    });

})(app.hightGuard);

