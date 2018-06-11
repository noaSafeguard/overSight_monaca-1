
'use strict';
app.controlPoint = kendo.observable({
    onShow: function () { },
    afterShow: function () { },
    isUpdated: false,
    showEditDelete: true,
    flagImage: false,
    flagImageEdit: false,
    flagIsEdit: false
});
(function (parent) {
    var dataProvider = app.data.progressDataProvider,
        current,
        currentUpdate,
        //אובייקט נקודות בקרה לפי אתר
        jsdoOptions = {
            name: 'ControlPointEconomy',
            autoFill: false
        },
        //אובייקט סעיפי בידקה
        jsdoOptionsCategorySection = {
            name: 'CategorySection',
            autoFill: false
        },
        //אובייקט  סעיפים שניבחרו
        jsdoOptionsSectionCheckup = {
            name: 'SectionCheckup',
            autoFill: false
        },
        //אובייקט  נקודות בקרה למבדק
        jsdoOptionsControlPointCheckup = {
            name: 'ControlPointCheckup',
            autoFill: false
        },
        //אובייקט מבדקים
        jsdoOptionsCheckupObject = {
            name: 'CheckupObject',
            autoFill: false
        },
        //אובייקט מפגעים
        jsdoOptionsHazhardCPE = {
            name: 'HazhardCPE',
            autoFill: false
        },
        //אובייקט מפגעים למבדק
        jsdoOptionsHazhardCPEC = {
            name: 'HazhardCPEC',
            autoFill: false
        },
        dataSourceOptions = {
            type: 'jsdo',
            transport: {},
            requestEnd: function (e) {
                var response = e.response;
                var type = e.type;
                if (type == "update") { currentUpdate = response }
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
        dataSourceCategorySection = new kendo.data.DataSource({
            pageSize: 50
        }),
        dataSourceCategorySectionFilter = new kendo.data.DataSource({
            pageSize: 50
        }),
        dataSourceSectionCheckupEdit = new kendo.data.DataSource({
            pageSize: 50
        }),

        homeModel = kendo.observable({
            dataSource: dataSource,
            dataSourceCategorySection: dataSourceCategorySection,
            _dataSourceOptions: dataSourceOptions,
            _jsdoOptions: jsdoOptions,
            _jsdoOptionsCategorySection: jsdoOptionsCategorySection,
            _jsdoOptionsSectionCheckup: jsdoOptionsSectionCheckup,
            _jsdoOptionsControlPointCheckup: jsdoOptionsControlPointCheckup,
            _jsdoOptionsCheckupObject: jsdoOptionsCheckupObject,
            _jsdoOptionsHazhardCPE: jsdoOptionsHazhardCPE,
            _jsdoOptionsHazhardCPEC: jsdoOptionsHazhardCPEC,
            dataSourceSectionCheckupEdit: dataSourceSectionCheckupEdit,
            EditSectionItem: null,
            itemClickCp: {},
            sectionStatus: [],
            SectionStatusArr: [],
            currentControlPointCheckup: null,
            default: null,
            dailyCheckOrLikuy: false,
            flagFoundCheck: false,

            cameraId: "null",
            capturePhoto1: "null",
            capturePhoto2: "null",
            fileURI: "null",

            cameraIdEdit: "null",
            capturePhoto1Edit: "null",
            capturePhoto2Edit: "null",
            fileURIEdit: "null",


            //בלחיצה על ציון בסעיף
            myChooseSectionStatusN: function (this1,seif, val) {
               
                var arrObjectes = homeModel.get('arrObjectes');
                for (var i = 0; i < arrObjectes.length; i++) {
                    for (var j = 0; j < arrObjectes[i].seif.length; j++) {
                        if (arrObjectes[i].seif[j].id == seif) {
                            if (this1.checked == true)
                                arrObjectes[i].seif[j].value = val;
                            else
                                arrObjectes[i].seif[j].value = "null";
                            break
                        }

                    }
                }
                homeModel.set('arrObjectes', arrObjectes)

            },
            myChooseSectionStatusND: function (this1, seif, val) {

                var arrObjectes = homeModel.get('arrObjectes');
                for (var i = 0; i < arrObjectes.length; i++) {
                    for (var j = 0; j < arrObjectes[i].seif.length; j++) {
                        if (arrObjectes[i].seif[j].id == seif) {
                            if (this1.checked == true)
                                arrObjectes[i].seif[j].value = val;
                            else
                                arrObjectes[i].seif[j].value = "null";
                            break
                        }

                    }
                }
                homeModel.set('arrObjectes', arrObjectes)

            },
            //יצירת נקודת בקרה
            save1: function () {
                app.mobileApp.showLoading();
                document.getElementById('sectionStatusDiv').innerHTML = "";
                //שמירת יצירת נקודת בקרה למבדק
                var jsdoOptions = homeModel.get('_jsdoOptionsControlPointCheckup'),
                    jsdo = new progress.data.JSDO(jsdoOptions),
                    dataSourceOptions = homeModel.get('_dataSourceOptions'),
                    dataSource;
                dataSourceOptions.transport.jsdo = jsdo;
                dataSource = new kendo.data.DataSource(dataSourceOptions);
                function saveModel(data) {
                    var obj = {
                        "locationId": (app.project.homeModel.get("dataItem")).locationId,
                        "R370259027": (app.controlPoint.homeModel.get("itemClickCp")).id,//מקשרת לנקודת בקרה
                        "R370258935": (app.hightGuard.homeModel.get("currentCheck")).id,//מקשרת למבדק
                        "ControlPointComment": document.getElementById("description_html").value,
                        "cb_isActive": true//פעיל
                    };
                    dataSource.add(obj);
                    dataSource.one('change', function (e) {
                        homeModel.currentControlPointCheckup = current;
                        //homeModel.save2();
                        //תמונות
                        if (app.controlPoint.homeModel.get("capturePhoto1") != null && app.controlPoint.homeModel.get("capturePhoto1") != "null" ||
                            app.controlPoint.homeModel.get("capturePhoto2") != null && app.controlPoint.homeModel.get("capturePhoto2") != "null") {
                            uploadWork(current);
                        }
                        else {
                            homeModel.save2();
                        }
                    });
                    dataSource.sync();
                };
                saveModel();
            },
            //יצירת  סעיפים ומפגעים
            save2: function () {
                var arrObjectes = homeModel.get('arrObjectes');
                var arr = []
                for (var i = 0; i < arrObjectes.length; i++) {
                    var flag = false;
                    for (var j = 0; j < arrObjectes[i].seif.length; j++) {
                        if (arrObjectes[i].seif[j].value != "null") {
                            flag = true;
                            var obj = {
                                "R408159700": arrObjectes[i].id,//מקשרת למפגע שניבחר
                                "R370259173": arrObjectes[i].seif[j].id,//מקשרת לסעיף בנק
                                "IntScore": arrObjectes[i].seif[j].value,//ערך
                                "locationId": (app.project.homeModel.get("dataItem")).locationId,
                                "cb_isActive": true//פעיל
                            };
                            arr.push(obj);
                        }
                    }
                    if (flag == true) {
                        var obj = {
                            "R408159685": homeModel.currentControlPointCheckup.id,//מקשרת לנקודת בקרה שנוצרה
                            "R408159765": arrObjectes[i].id,//מקשרת למפגע בנק
                            "locationId": (app.project.homeModel.get("dataItem")).locationId,
                            "cb_isActive": true//פעיל
                        };
                        saveMefga(obj)
                    }
                }

                function saveMefga(obj) {
                    dataProvider.loadCatalogs().then(function _catalogsLoaded() {
                        var jsdoOptions = homeModel.get('_jsdoOptionsHazhardCPEC'),
                            jsdo = new progress.data.JSDO(jsdoOptions),
                            dataSourceOptions = homeModel.get('_dataSourceOptions'),
                            dataSource;
                        dataSourceOptions.transport.jsdo = jsdo;
                        dataSource = new kendo.data.DataSource(dataSourceOptions)
                        function saveModel() {
                            dataSource.add(obj);
                            dataSource.one('change', function (e) {
                                for (var k = 0; k < arr.length; k++) {
                                    if (arr[k].R408159700 == current.R408159765) {
                                        arr[k].R408159700 = current.id;
                                        saveSeif(arr[k])
                                    }

                                }

                            
                            });
                            dataSource.sync();
                        };
                        saveModel();
                    });
                }
                //שמירת סעיף למבדק
                function saveSeif(obj) {
                    dataProvider.loadCatalogs().then(function _catalogsLoaded() {
                        var jsdoOptions = homeModel.get('_jsdoOptionsSectionCheckup'),
                            jsdo = new progress.data.JSDO(jsdoOptions),
                            dataSourceOptions = homeModel.get('_dataSourceOptions'),
                            dataSource;
                        dataSourceOptions.transport.jsdo = jsdo;
                        dataSource = new kendo.data.DataSource(dataSourceOptions)
                        function saveModel() {
                            dataSource.add(obj);
                            dataSource.one('change', function (e) {
                                console.log(current.R408159700)
                                $("input:checkbox").prop("checked", false);
                                homeModel.arrObjectes = [];
                                app.mobileApp.hideLoading();
                                app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
                            });
                            dataSource.sync();
                        };
                        saveModel();
                    });
                }
            },

            //בלחיצת וי על אחד מסעיפי בדיקה יומית שומר בחירה במערך
            addToSectionStatusArr: function (sectionId, statusId) {
                var arr = homeModel.get('SectionStatusArr');
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].sectionId == sectionId) {
                        arr[i].statusId = statusId;
                        break;
                    }
                }
                homeModel.set('SectionStatusArr', arr)
            },
            //בהסרת וי על אחד מסעיפי בדיקה יומית משנה בחירה אוטומטית ללא רלוונטית
            removeToSectionStatusArr: function (sectionId) {
                var arr = homeModel.get('SectionStatusArr');
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].sectionId == sectionId) {
                        arr[i].statusId = homeModel.default;
                        break;
                    }
                }
                homeModel.set('SectionStatusArr', arr)
            },
            //יצירת סעיפים
            save2B: function () {
                var arr = homeModel.get('SectionStatusArr');
                console.log("arr.length")
                console.log(arr.length)
                for (var i = 0; i < arr.length; i++) {
                    homeModel.save3(arr[i].sectionId, arr[i].statusId)
                }
                $("input:checkbox").prop("checked", false);
                homeModel.SectionStatusArr = [];
                app.mobileApp.hideLoading();
                app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
            },
            save3B: function (sectionId, statusId) {
                //שמירת סעיף
                var jsdoOptions = homeModel.get('_jsdoOptionsSectionCheckup'),
                    jsdo = new progress.data.JSDO(jsdoOptions),
                    dataSourceOptions = homeModel.get('_dataSourceOptions'),
                    dataSource;
                dataSourceOptions.transport.jsdo = jsdo;
                dataSource = new kendo.data.DataSource(dataSourceOptions);
                function saveModel(data) {
                    var obj = {
                        "R370259173": sectionId,
                        "SectionStatus": statusId,
                        "R370259182": (homeModel.get("currentControlPointCheckup")).id,
                    };
                    dataSource.add(obj);
                    dataSource.one('change', function (e) {
                    });
                    dataSource.sync();
                };
                saveModel();
            },

            //בלחיצה על נקודת בקרה
            itemClick: function (e) {
                app.mobileApp.showLoading();
                homeModel.set("dailyCheckOrLikuy", false);
                var dataSource3 = homeModel.get("dataSource1");
                var itemClick = dataSource3.getByUid(e);
                homeModel.set('itemClickCp', itemClick)
                homeModel.editOrNew(itemClick);
            },
            //בלחיצה על נקודת בקרה בודק או עריכה או יצירה
            editOrNew: function (itemClick) {
                try {
                    app.mobileApp.showLoading();
                    //שולף טבלה מהשרת
                    dataProvider.loadCatalogs().then(function _catalogsLoaded() {
                        var jsdoOptions = homeModel.get('_jsdoOptionsControlPointCheckup'),
                            jsdo = new progress.data.JSDO(jsdoOptions),
                            dataSourceOptions = homeModel.get('_dataSourceOptions'),
                            dataSource;
                        dataSourceOptions.transport.jsdo = jsdo;
                        dataSource = new kendo.data.DataSource(dataSourceOptions)

                        dataSource.filter({
                            logic: "and",
                            filters: [
                                { field: "R370258935", operator: "eq", value: (app.hightGuard.homeModel.get("currentCheck")).id },
                                { field: "R370259027", operator: "eq", value: itemClick.id }
                            ]
                        })
                        dataSource.fetch(function () {
                            var view = dataSource.view();
                            if (view.length > 0) {
                                homeModel.editSection(view[0].id)
                                homeModel.currentControlPointCheckup = view[0];
                            }
                            else {
                                // setTimeout(function () {
                                app.mobileApp.navigate('#components/controlPoint/sections.html');
                                app.mobileApp.hideLoading();
                                // }, 100);
                            }
                        });
                        //app.mobileApp.hideLoading();
                    });
                } catch (e) {
                    alert("שגיאה")
                }
            },
            //עריכה- שליפת כל הסעיפים שקשורים לתחום הניבחר
            editSection: function (cpId) {
                try {
                    
                    var arrObjectesSelect = [];
                    //שליפת כל המפגעים
                    //dataProvider.loadCatalogs().then(function _catalogsLoaded() {
                        var jsdoOptions = homeModel.get('_jsdoOptionsHazhardCPEC'),
                            jsdo = new progress.data.JSDO(jsdoOptions),
                            dataSourceOptions = homeModel.get('_dataSourceOptions'),
                            dataSource;
                        dataSourceOptions.transport.jsdo = jsdo;
                        dataSource = new kendo.data.DataSource(dataSourceOptions)
                        dataSource.filter({
                            logic: "and",
                            filters: [
                                { field: "R408159685", operator: "eq", value: cpId },
                            ]
                        })
                        var jsdoOptions = homeModel.get('_jsdoOptionsSectionCheckup'),
                            jsdo = new progress.data.JSDO(jsdoOptions),
                            dataSourceOptions = homeModel.get('_dataSourceOptions'),
                            dataSource1;
                        dataSourceOptions.transport.jsdo = jsdo;
                        dataSource1 = new kendo.data.DataSource(dataSourceOptions)
                        var view;
                        var view1
                        dataSource.fetch(function () {
                             view = dataSource.view();
                            if (view && view1)
                                foritemes();
                          
                        });
                        dataSource1.fetch(function () {
                             view1 = dataSource1.view();
                            if (view && view1)
                                foritemes();


                        });
                    //});

                    function foritemes() {
                        for (var i = 0; i < view.length; i++) {//עובר כל כל המפגעים
                            for (var j = 0; j < view1.length; j++) {//עובר על כל הסעיפים
                                //אם הסעיף מקושר ל
                                if (view[i].id == view1[j].R408159700) {//אם מקושר סעיף למפגע
                                    var obj = { "idMefga": view[i].R408159765, "idSeif": view1[j].R370259173, "id": view1[j].id, "val": view1[j].IntScore }
                                    arrObjectesSelect.push(obj);
                                }
                            }
                        }
                        homeModel.set("arrObjectesSelect", arrObjectesSelect);
                      
                        app.mobileApp.hideLoading();
                        //app.mobileApp.navigate('#components/controlPoint/sectionsEdit.html');
                        app.mobileApp.navigate('#components/controlPoint/sectionsDetails.html');
                       
                    }

                } catch (e) {
                    alert("שגיאה")
                }
            },
            //עריכה- שליפת כל הסעיפים שקשורים לתחום הניבחר
            editSection2: function (getId) {
                try {
                    //app.mobileApp.showLoading();
                    //שולף טבלה מהשרת
                    dataProvider.loadCatalogs().then(function _catalogsLoaded() {
                        var jsdoOptions = homeModel.get('_jsdoOptionsSectionCheckup'),
                            jsdo = new progress.data.JSDO(jsdoOptions),
                            dataSourceOptions = homeModel.get('_dataSourceOptions'),
                            dataSource;
                        dataSourceOptions.transport.jsdo = jsdo;
                        dataSource = new kendo.data.DataSource(dataSourceOptions)
                        dataSource.filter({
                            logic: "and",
                            filters: [
                                { field: "R370259182", operator: "eq", value: getId },
                            ]
                        })
                        dataSource.fetch(function () {
                            var view = dataSource.view();
                            homeModel.set('EditSectionItem', view);
                            homeModel.set('dataSourceSectionCheckupEdit', dataSource);


                            setTimeout(function () {
                                app.mobileApp.navigate('#components/controlPoint/sectionsEdit.html');
                                app.mobileApp.hideLoading();
                            }, 100);
                        });
                        //app.mobileApp.hideLoading();
                    });
                } catch (e) {
                    alert("שגיאה")
                }
            },
            //סוגר את העמוד של נקודות בקרה
            closeCurrentPage: function () {
                app.mobileApp.navigate('#components/MB/home.html');
            },
            //בלחיצה על כפתור ערוך
            startEdit: function () {
                editSection1.hidden = true;
                saveSectionAssign1.hidden = false;
                $("input:checkbox").attr("disabled", false);
                $("#descriptionEdit").attr("disabled", false);
                imageEdit1.hidden = false;
                imageEdit2.hidden = false;
                app.controlPoint.set("flagIsEdit", true)
            },
            //שמירת עריכה
            saveEdit1: function () {
                app.mobileApp.showLoading();
                var currentControlPointCheckup = homeModel.currentControlPointCheckup;
                //שמירת יצירת נקודת בקרה למבדק
                var jsdoOptions = homeModel.get('_jsdoOptionsControlPointCheckup'),
                    jsdo = new progress.data.JSDO(jsdoOptions),
                    dataSourceOptions = homeModel.get('_dataSourceOptions'),
                    dataSource;
                dataSourceOptions.transport.jsdo = jsdo;
                dataSource = new kendo.data.DataSource(dataSourceOptions);
                var descriptionEdit = document.getElementById("descriptionEdit").value;
                if ((descriptionEdit != currentControlPointCheckup.ControlPointComment && descriptionEdit != "null" && descriptionEdit != "" && descriptionEdit != " ")
                    || (app.controlPoint.homeModel.get("capturePhoto1Edit") != null && app.controlPoint.homeModel.get("capturePhoto1Edit") != "null" ||
                        app.controlPoint.homeModel.get("capturePhoto2Edit") != null && app.controlPoint.homeModel.get("capturePhoto2Edit") != "null")) {
                    dataSource.fetch(function () {
                        if (descriptionEdit != currentControlPointCheckup.ControlPointComment && descriptionEdit != "null" && descriptionEdit != "" && descriptionEdit != " ") {
                            var obj = {
                                "ControlPointComment": descriptionEdit
                            }
                            try {
                                var jsdo = dataSource.transport.jsdo;
                                var jsrow = jsdo.findById(currentControlPointCheckup.id);
                                var afterUpdateFn;
                                jsrow.assign(obj);
                                afterUpdateFn = function (jsdo, record, success, request) {
                                    jsdo.unsubscribe('afterUpdate', afterUpdateFn);
                                    if (success === true) {
                                        //תמונות
                                        if (app.controlPoint.homeModel.get("capturePhoto1Edit") != null && app.controlPoint.homeModel.get("capturePhoto1Edit") != "null" ||
                                            app.controlPoint.homeModel.get("capturePhoto2Edit") != null && app.controlPoint.homeModel.get("capturePhoto2Edit") != "null") {
                                            uploadWorkEdit(currentControlPointCheckup);
                                        }
                                        else
                                            homeModel.saveEdit2();
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
                        else {
                            //תמונות
                            if (app.controlPoint.homeModel.get("capturePhoto1Edit") != null && app.controlPoint.homeModel.get("capturePhoto1Edit") != "null" ||
                                app.controlPoint.homeModel.get("capturePhoto2Edit") != null && app.controlPoint.homeModel.get("capturePhoto2Edit") != "null") {
                                uploadWorkEdit(currentControlPointCheckup);
                            }
                            else
                                homeModel.saveEdit2();
                        }


                    });
                }
                else {
                    homeModel.saveEdit2();
                }

            },
            saveEdit2: function () {

                var dataSource = homeModel.get('dataSourceSectionCheckupEdit');
                var view = dataSource.view();
                var arr = homeModel.get('SectionStatusArr');
                for (var i = 0; i < view.length; i++) {
                    for (var j = 0; j < arr.length; j++) {
                        if (arr[j].sectionId == view[i].R370259173 && arr[j].statusId != view[i].SectionStatus) {
                            var obj = {
                                "SectionStatus": arr[j].statusId
                            }
                            try {
                                var jsdo = dataSource.transport.jsdo;
                                var jsrow = jsdo.findById(view[i].id);
                                var afterUpdateFn;
                                jsrow.assign(obj);
                                afterUpdateFn = function (jsdo, record, success, request) {
                                    jsdo.unsubscribe('afterUpdate', afterUpdateFn);
                                    if (success === true) {
                                        //console.log("הצלחה")
                                        //app.mobileApp.hideLoading();

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
                            break;
                        }
                    }
                }
                document.getElementById('sectionStatusEditDiv').innerHTML = "";
                $("input:checkbox").prop("checked", false);
                homeModel.SectionStatusArr = [];
                app.mobileApp.hideLoading();
                app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
            },
            //סוגר דף סעיפים עריכה
            closeEdit1: function () {
                document.getElementById('sectionStatusEditDiv').innerHTML = "";
                $("input:checkbox").prop("checked", false);
                homeModel.SectionStatusArr = [];
                app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
            },
            //סיום מבדק
            endCheck1: function () {
                $("#popEndCheck").kendoMobileModalView("open");
            },
            closePopEndCheck: function () {
                $("#popEndCheck").kendoMobileModalView("close");
            },
            //סיום מבדק
            endCheck: function () {
                app.mobileApp.showLoading();
                $("#popEndCheck").kendoMobileModalView("close");
                var jsdoOptions = homeModel.get('_jsdoOptionsCheckupObject'),
                    jsdo = new progress.data.JSDO(jsdoOptions),
                    dataSourceOptions = homeModel.get('_dataSourceOptions'),
                    dataSource;
                dataSourceOptions.transport.jsdo = jsdo;
                dataSource = new kendo.data.DataSource(dataSourceOptions);
                dataSource.filter({
                    logic: "and",
                    filters: [
                        { field: "id", operator: "eq", value: (app.hightGuard.homeModel.get("currentCheck")).id }
                    ]
                })
                var pos = {
                    lat: "",
                    lng: ""
                };
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        pos.lat = position.coords.latitude;
                        pos.lng = position.coords.longitude;
                    });
                }

                dataSource.fetch(function () {
                    var view = dataSource.view();
                    console.log(view);
                    var obj = {
                        "DroneURL": document.getElementById("DroneURL").value,//רחפן
                        "TourParticipants": document.getElementById("TourParticipants").value,//משתתפים בסיור
                        "AdditionalComments": document.getElementById("AdditionalComments").value,//הערות נוספות
                        "Latitude": pos.lat,
                        "Longitude": pos.lng

                    }
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
                });
            },

            open_pop_item_description: function () {
                $("#pop_item_description").kendoMobileModalView("open");
            },

            close_pop_item_description: function () {
                $("#pop_item_description").kendoMobileModalView("close");

                var name = document.getElementById("description_html").value;

                if (name != " " && name != "") {
                    document.getElementById("description_all_control_point").style.color = "red";
                }
                else
                    document.getElementById("description_all_control_point").style.color = "black";

            },

            //camera
            ifOpenPictureFrom: function () {
                var check1 = app.controlPoint.homeModel.get("cameraId");

                if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto1") {
                    $("#pop_image_all_control_point_1").kendoMobileModalView("open");
                }
                else
                    if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto2") {
                        $("#pop_image_all_control_point_2").kendoMobileModalView("open");
                    }
                    else
                        $("#popPictureFrom").kendoMobileModalView("open");
            },
            ifOpenPictureFromEdit: function () {
                var check1 = app.controlPoint.homeModel.get("cameraIdEdit");
                if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto1Edit") {
                    $("#pop_image_all_control_point_1Edit").kendoMobileModalView("open");
                }
                else
                    if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto2Edit") {
                        $("#pop_image_all_control_point_2Edit").kendoMobileModalView("open");
                    }
                    else {
                        if (app.controlPoint.get("flagIsEdit") == true) {
                            $("#popPictureFromEdit").kendoMobileModalView("open");
                        }
                    }


            },


            getPhotoLibrary: function (e) {
                $("#popPictureFrom").kendoMobileModalView("close");

                var check1 = app.controlPoint.homeModel.get("cameraId");

                if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto1") {

                    $("#pop_image_all_control_point_1").kendoMobileModalView("open");
                }
                else {
                    if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto2") {

                        $("#pop_image_all_control_point_2").kendoMobileModalView("open");

                    }

                    else {
                        navigator.camera.getPicture(onSuccessUploadPhoto, function (message) {
                            alert("Failed to get a picture. Please select one.");
                        }, {
                                quality: 30,
                                destinationType: Camera.DestinationType.DATA_URL,
                                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                                correctOrientation: true,
                            });
                    }
                    $("#popPictureFrom").kendoMobileModalView("close");
                }
                $("#popPictureFrom").kendoMobileModalView("close");
            },
            getPhotoLibraryEdit: function (e) {
                $("#popPictureFromEdit").kendoMobileModalView("close");
                var check1 = app.controlPoint.homeModel.get("cameraIdEdit");
                if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto1Edit") {
                    $("#pop_image_all_control_point_1Edit").kendoMobileModalView("open");
                }
                else {
                    if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto2Edit") {

                        $("#pop_image_all_control_point_2Edit").kendoMobileModalView("open");

                    }

                    else {
                        navigator.camera.getPicture(onSuccessUploadPhotoEdit, function (message) {
                            alert("Failed to get a picture. Please select one.");
                        }, {
                                quality: 30,
                                destinationType: Camera.DestinationType.DATA_URL,
                                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                                correctOrientation: true,
                            });
                    }
                    $("#popPictureFromEdit").kendoMobileModalView("close");
                }
                $("#popPictureFromEdit").kendoMobileModalView("close");
            },

            image_all_control_point_1_ClosePop: function () {
                $("#pop_image_all_control_point_1").kendoMobileModalView("close");

            },
            image_all_control_point_1_ClosePopEdit: function () {
                $("#pop_image_all_control_point_1Edit").kendoMobileModalView("close");

            },

            image_all_control_point_2_ClosePop: function () {
                $("#pop_image_all_control_point_2").kendoMobileModalView("close");
            },
            image_all_control_point_2_ClosePopEdit: function () {
                $("#pop_image_all_control_point_2Edit").kendoMobileModalView("close");
            },
            //פותח מצלמה
            takePhoto: function (e) {
                $("#popPictureFrom").kendoMobileModalView("close");

                var check1 = app.controlPoint.homeModel.get("cameraId");

                if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto1") {
                    $("#pop_image_all_control_point_1").kendoMobileModalView("open");
                }
                else {
                    if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto2") {
                        $("#pop_image_all_control_point_2").kendoMobileModalView("open");
                    }
                    else {
                        navigator.camera.getPicture(onSuccessUploadPhoto, function (message) {
                            alert("Failed to get a picture. Please select one.");
                        }, {
                                quality: 30,
                                destinationType: Camera.DestinationType.DATA_URL,
                                // reduce-image-size
                                // http://stackoverflow.com/questions/23682740/phonegap-reduce-image-size
                                correctOrientation: true,
                            });
                    }
                }
            },
            takePhotoEdit: function (e) {
                $("#popPictureFromEdit").kendoMobileModalView("close");

                var check1 = app.controlPoint.homeModel.get("cameraIdEdit");

                if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto1Edit") {
                    $("#pop_image_all_control_point_1Edit").kendoMobileModalView("open");
                }
                else {
                    if (document.getElementById(check1).style.color == "red" && check1 == "capturePhoto2Edit") {
                        $("#pop_image_all_control_point_2Edit").kendoMobileModalView("open");
                    }
                    else {
                        navigator.camera.getPicture(onSuccessUploadPhotoEdit, function (message) {
                            alert("Failed to get a picture. Please select one.");
                        }, {
                                quality: 30,
                                destinationType: Camera.DestinationType.DATA_URL,
                                // reduce-image-size
                                // http://stackoverflow.com/questions/23682740/phonegap-reduce-image-size
                                correctOrientation: true,
                            });
                    }
                }
            },

            openPopPictureFrom: function () {

                $("#popPictureFrom").kendoMobileModalView("open");
            },
            openPopPictureFromEdit: function () {

                $("#popPictureFromEdit").kendoMobileModalView("open");
            },

            closePopPictureFrom: function () {

                $("#popPictureFrom").kendoMobileModalView("close");
            },
            closePopPictureFromEdit: function () {

                $("#popPictureFromEdit").kendoMobileModalView("close");
            },

            openPopPictureFrom1: function () {
                $("#pop_image_all_control_point_1").kendoMobileModalView("close");
                $("#pop_image_all_control_point_2").kendoMobileModalView("close");
                $("#popPictureFrom1").kendoMobileModalView("open");
            },
            openPopPictureFrom1Edit: function () {
                $("#pop_image_all_control_point_1Edit").kendoMobileModalView("close");
                $("#pop_image_all_control_point_2Edit").kendoMobileModalView("close");
                $("#popPictureFrom1Edit").kendoMobileModalView("open");
            },

            closePopPictureFrom1: function () {

                $("#popPictureFrom1").kendoMobileModalView("close");
            },
            closePopPictureFrom1Edit: function () {

                $("#popPictureFrom1Edit").kendoMobileModalView("close");
            },

            getPhotoLibrary1: function (e) {
                $("#popPictureFrom1").kendoMobileModalView("close");
                $("#pop_image_all_control_point_1").kendoMobileModalView("close");
                $("#pop_image_all_control_point_2").kendoMobileModalView("close");
                var check1 = app.controlPoint.homeModel.get("cameraId");
                navigator.camera.getPicture(onSuccessUploadPhoto, function (message) {
                    alert("Failed to get a picture. Please select one.");
                }, {
                        quality: 30,
                        destinationType: Camera.DestinationType.DATA_URL,
                        correctOrientation: true,
                        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY

                    });
            },
            getPhotoLibrary1Edit: function (e) {
                $("#popPictureFrom1Edit").kendoMobileModalView("close");
                $("#pop_image_all_control_point_1Edit").kendoMobileModalView("close");
                $("#pop_image_all_control_point_2Edit").kendoMobileModalView("close");
                var check1 = app.controlPoint.homeModel.get("cameraIdEdit");
                navigator.camera.getPicture(onSuccessUploadPhotoEdit, function (message) {
                    alert("Failed to get a picture. Please select one.");
                }, {
                        quality: 30,
                        destinationType: Camera.DestinationType.DATA_URL,
                        correctOrientation: true,
                        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY

                    });
            },

            takePhoto1: function (e) {
                $("#pop_image_all_control_point_1").kendoMobileModalView("close");
                $("#pop_image_all_control_point_2").kendoMobileModalView("close");
                var check1 = app.controlPoint.homeModel.get("cameraId");
                navigator.camera.getPicture(onSuccessUploadPhoto, function (message) {
                    alert("Failed to get a picture. Please select one.");
                }, {
                        quality: 30,
                        correctOrientation: true,
                        destinationType: Camera.DestinationType.DATA_URL,

                    });
            },
            takePhoto1Edit: function (e) {
                $("#pop_image_all_control_point_1Edit").kendoMobileModalView("close");
                $("#pop_image_all_control_point_2Edit").kendoMobileModalView("close");
                var check1 = app.controlPoint.homeModel.get("cameraIdEdit");
                navigator.camera.getPicture(onSuccessUploadPhotoEdit, function (message) {
                    alert("Failed to get a picture. Please select one.");
                }, {
                        quality: 30,
                        correctOrientation: true,
                        destinationType: Camera.DestinationType.DATA_URL,

                    });
            },


        });
    //מעלה תמונה לוקלי לאחר תצלום או מגלריה או ממצלמה
    function uploadPhoto(fileURI) {
        $("#popPictureFrom").kendoMobileModalView("close");
        $("#popPictureFrom1").kendoMobileModalView("close");
        var cameraId = app.controlPoint.homeModel.get("cameraId");
        if (cameraId == "capturePhoto1") {
            app.controlPoint.homeModel.set("capturePhoto1", fileURI);
            document.getElementById("picture_all_control_point1").src = fileURI;
        }
        if (cameraId == "capturePhoto2") {
            app.controlPoint.homeModel.set("capturePhoto2", fileURI);
            document.getElementById("picture_all_control_point2").src = fileURI;
        }
        document.getElementById(cameraId).style.color = "red";
        app.controlPoint.homeModel.set("fileURI", fileURI);
    }
    function uploadPhotoEdit(fileURI) {
        $("#popPictureFromEdit").kendoMobileModalView("close");
        $("#popPictureFrom1Edit").kendoMobileModalView("close");
        var cameraId = app.controlPoint.homeModel.get("cameraIdEdit");
        if (cameraId == "capturePhoto1Edit") {
            app.controlPoint.homeModel.set("capturePhoto1Edit", fileURI);
            document.getElementById("picture_all_control_point1Edit").src = fileURI;
        }
        if (cameraId == "capturePhoto2Edit") {
            app.controlPoint.homeModel.set("capturePhoto2Edit", fileURI);
            document.getElementById("picture_all_control_point2Edit").src = fileURI;
        }
        document.getElementById(cameraId).style.color = "red";
        app.controlPoint.homeModel.set("fileURIEdit", fileURI);
    }

    //לאחר ההעלה תמונה לוקלי
    function onSuccessUploadPhoto(imageData) {
        $("#popPictureFrom").kendoMobileModalView("close");
        $("#popPictureFrom1").kendoMobileModalView("close");
        var cameraId = app.controlPoint.homeModel.get("cameraId");
        if (cameraId == "capturePhoto1") {
            var image = document.getElementById('picture_all_control_point1');
            image.src = "data:image/jpeg;base64," + imageData;
            app.controlPoint.homeModel.set("capturePhoto1", cameraId);
        }
        if (cameraId == "capturePhoto2") {
            var image = document.getElementById('picture_all_control_point2');
            image.src = "data:image/jpeg;base64," + imageData;
            app.controlPoint.homeModel.set("capturePhoto2", cameraId);
        }

        var cameraIdT = cameraId;
        //if (cameraIdT == "capturePhoto1")
        //    cameraIdT = "capturePhoto1T"
        //else
        //    if (cameraIdT == "capturePhoto2")
        //        cameraIdT = "capturePhoto2T"
        document.getElementById(cameraIdT).style.color = "red";
        app.controlPoint.set("flagImage", true);
        app.controlPoint.homeModel.set("fileURI", cameraId);
    }
    function onSuccessUploadPhotoEdit(imageData) {
        $("#popPictureFromEdit").kendoMobileModalView("close");
        $("#popPictureFrom1Edit").kendoMobileModalView("close");
        var cameraId = app.controlPoint.homeModel.get("cameraIdEdit");
        if (cameraId == "capturePhoto1Edit") {
            var image = document.getElementById('picture_all_control_point1Edit');
            image.src = "data:image/jpeg;base64," + imageData;
            app.controlPoint.homeModel.set("capturePhoto1Edit", cameraId);
        }
        if (cameraId == "capturePhoto2") {
            var image = document.getElementById('picture_all_control_point2Edit');
            image.src = "data:image/jpeg;base64," + imageData;
            app.controlPoint.homeModel.set("capturePhoto2Edit", cameraId);
        }

        var cameraIdT = cameraId;

        document.getElementById(cameraIdT).style.color = "red";
        app.controlPoint.set("flagImageEdit", true);
        app.controlPoint.homeModel.set("fileURIEdit", cameraId);
    }



    //ההעלת תמונות לשרת
    function uploadWork(cur) {
        //alert("uploadWork")
        var fileURI = app.controlPoint.homeModel.set("fileURI");
        //alert(fileURI)
        var jsdoOptions = homeModel.get('_jsdoOptionsControlPointCheckup'),
            jsdo = new progress.data.JSDO(jsdoOptions),
            dataSourceOptions = homeModel.get('_dataSourceOptions'),
            dataSource;
        dataSourceOptions.transport.jsdo = jsdo;
        dataSource = new kendo.data.DataSource(dataSourceOptions)

        var mone = 0;
        var moneS = 0;
        var myData;
        var myId;

        if (app.controlPoint.homeModel.get("capturePhoto1") != null && app.controlPoint.homeModel.get("capturePhoto1") != "null") {
            mone++;
        }
        if (app.controlPoint.homeModel.get("capturePhoto2") != null && app.controlPoint.homeModel.get("capturePhoto2") != "null") {
            mone++;
        }
        //var dataSource = homeModel.get('dataSource')
        //dataSource.fetch(function () {
        //    var view = dataSource.view();
        //    for (var i = 0; i < view.length; i++) {
        var options = new FileUploadOptions();
        options.quality = 10;
        options.fileKey = "fileContents";
        //options.fileName = key;

        options.mimeType = "image/jpeg";
        options.params = {};
        options.headers = {
            Connection: "Close"
        };
        options.chunkedMode = false;
        var ft = new FileTransfer();
        var imageObj1, imageObj2;
        var fileURI1, fileURI2;
        var urlRB1, urlRB2;

        if (app.controlPoint.homeModel.get("capturePhoto1") != null && app.controlPoint.homeModel.get("capturePhoto1") != "null") {
            imageObj1 = $.parseJSON(cur.CategoryImage1);
            fileURI1 = document.getElementById('picture_all_control_point1').src;
            urlRB1 = app.controlPoint.homeModel._dataSourceOptions.transport.jsdo.url + imageObj1.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
            options.fileName = "photo1.jpeg";
            ft.upload(
                fileURI1,
                encodeURI(urlRB1),
                onFileUploadSuccess("photo1"),
                onFileTransferFail,
                options,
                true);
        }
        //else {
        //    alert("no image 1")
        //}
        if (app.controlPoint.homeModel.get("capturePhoto2") != null && app.controlPoint.homeModel.get("capturePhoto2") != "null") {
            imageObj2 = $.parseJSON(cur.CategoryImage2);
            fileURI2 = document.getElementById('picture_all_control_point2').src;
            urlRB2 = app.controlPoint.homeModel._dataSourceOptions.transport.jsdo.url + imageObj2.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
            options.fileName = "photo2.jpeg";
            ft.upload(
                fileURI2,
                encodeURI(urlRB2),
                onFileUploadSuccess("photo2"),
                onFileTransferFail,
                options,
                true);
        }
        //else {
        //    alert("no image 2")
        //}
        //    }
        //    myData = dataSource;
        //    myId = view[0].id;
        //    homeModel.set("idToShare", myId)
        //});

        function onFileUploadSuccess(fieldName) {
            //alert("in")
            //alert(fieldName)
            //if (fieldName === "photo1") {
            //    window.plugins.toast.showWithOptions(
            //        {
            //            message: "תמונה עלתה בהצלחה",
            //            duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
            //            position: "bottom",
            //            addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            //        }

            //    );
            //}
            //if (fieldName === "photo2") {
            //    window.plugins.toast.showWithOptions(
            //        {
            //            message: "תמונה עלתה בהצלחה",
            //            duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
            //            position: "bottom",
            //            addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            //        }

            //    );
            //}
            moneS++;
            if (mone == moneS) {
                app.controlPoint.homeModel.set("fileURI", "null");
                app.controlPoint.homeModel.set("capturePhoto1", "null");
                app.controlPoint.homeModel.set("capturePhoto2", "null");
                homeModel.save2();
            }
        }
        function onFileTransferFail(error) {

            console.log("FileTransfer Error:");
            console.log("Code: " + error.code);
            console.log("Body:" + error.body);
            console.log("Source: " + error.source);
            console.log("Target: " + error.target);
            alert("Error loading the image");
        }


    }
    //ההעלת תמונות לשרת
    function uploadWorkEdit(cur) {
        var fileURI = app.controlPoint.homeModel.set("fileURIEdit");
        var jsdoOptions = homeModel.get('_jsdoOptionsControlPointCheckup'),
            jsdo = new progress.data.JSDO(jsdoOptions),
            dataSourceOptions = homeModel.get('_dataSourceOptions'),
            dataSource;
        dataSourceOptions.transport.jsdo = jsdo;
        dataSource = new kendo.data.DataSource(dataSourceOptions)

        var mone = 0;
        var moneS = 0;
        var myData;
        var myId;

        if (app.controlPoint.homeModel.get("capturePhoto1Edit") != null && app.controlPoint.homeModel.get("capturePhoto1Edit") != "null") {
            mone++;
        }
        if (app.controlPoint.homeModel.get("capturePhoto2Edit") != null && app.controlPoint.homeModel.get("capturePhoto2Edit") != "null") {
            mone++;
        }
        var options = new FileUploadOptions();
        options.quality = 10;
        options.fileKey = "fileContents";

        options.mimeType = "image/jpeg";
        options.params = {};
        options.headers = {
            Connection: "Close"
        };
        options.chunkedMode = false;
        var ft = new FileTransfer();
        var imageObj1, imageObj2;
        var fileURI1, fileURI2;
        var urlRB1, urlRB2;

        if (app.controlPoint.homeModel.get("capturePhoto1Edit") != null && app.controlPoint.homeModel.get("capturePhoto1Edit") != "null") {
            imageObj1 = $.parseJSON(cur.CategoryImage1);
            fileURI1 = document.getElementById('picture_all_control_point1Edit').src;
            urlRB1 = app.controlPoint.homeModel._dataSourceOptions.transport.jsdo.url + imageObj1.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
            options.fileName = "photo1.jpeg";
            ft.upload(
                fileURI1,
                encodeURI(urlRB1),
                onFileUploadSuccessEdit("photo1"),
                onFileTransferFailEdit,
                options,
                true);
        }
        if (app.controlPoint.homeModel.get("capturePhoto2Edit") != null && app.controlPoint.homeModel.get("capturePhoto2Edit") != "null") {
            imageObj2 = $.parseJSON(cur.CategoryImage2);
            fileURI2 = document.getElementById('picture_all_control_point2Edit').src;
            urlRB2 = app.controlPoint.homeModel._dataSourceOptions.transport.jsdo.url + imageObj2.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
            options.fileName = "photo2.jpeg";
            ft.upload(
                fileURI2,
                encodeURI(urlRB2),
                onFileUploadSuccessEdit("photo2"),
                onFileTransferFailEdit,
                options,
                true);
        }

        function onFileUploadSuccessEdit(fieldName) {
            if (fieldName === "photo1") {
                window.plugins.toast.showWithOptions(
                    {
                        message: "תמונה עלתה בהצלחה",
                        duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                    }

                );
            }
            if (fieldName === "photo2") {
                window.plugins.toast.showWithOptions(
                    {
                        message: "תמונה עלתה בהצלחה",
                        duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                    }

                );
            }
            moneS++;
            if (mone == moneS) {
                app.controlPoint.homeModel.set("fileURIEdit", "null");
                app.controlPoint.homeModel.set("capturePhoto1Edit", "null");
                app.controlPoint.homeModel.set("capturePhoto2Edit", "null");
                homeModel.saveEdit2();
            }
        }
        function onFileTransferFailEdit(error) {

            console.log("FileTransfer Error:");
            console.log("Code: " + error.code);
            console.log("Body:" + error.body);
            console.log("Source: " + error.source);
            console.log("Target: " + error.target);
            alert("Error loading the image");
        }


    }
    //function uploadWorkEdit(fileURI, cur) {
    //    var mone = 0;
    //    var moneS = 0;
    //    var myData;
    //    var myId;

    //    if (app.controlPoint.homeModel.get("capturePhoto1Edit") != null && app.controlPoint.homeModel.get("capturePhoto1Edit") != "null") {
    //        mone++;
    //    }
    //    if (app.controlPoint.homeModel.get("capturePhoto2Edit") != null && app.controlPoint.homeModel.get("capturePhoto2Edit") != "null") {
    //        mone++;
    //    }
    //    //var dataSource = homeModel.get('dataSource')
    //    //dataSource.fetch(function () {
    //    //    var view = dataSource.view();
    //    //    for (var i = 0; i < view.length; i++) {
    //    var options = new FileUploadOptions();
    //    options.quality = 10;
    //    options.fileKey = "fileContents";
    //    //options.fileName = key;

    //    options.mimeType = "image/jpeg";
    //    options.params = {};
    //    options.headers = {
    //        Connection: "Close"
    //    };
    //    options.chunkedMode = false;
    //    var ft = new FileTransfer();
    //    var imageObj1, imageObj2;
    //    var fileURI1, fileURI2;
    //    var urlRB1, urlRB2;

    //    if (app.controlPoint.homeModel.get("capturePhoto1Edit") != null && app.controlPoint.homeModel.get("capturePhoto1Edit") != "null") {
    //        imageObj1 = $.parseJSON(cur.CategoryImage1);
    //        fileURI1 = document.getElementById('picture_all_control_point1Edit').src;
    //        urlRB1 = app.controlPoint.homeModel._dataSourceOptions.transport.jsdo.url + imageObj1.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
    //        options.fileName = "photo1.jpeg";
    //        ft.upload(
    //            fileURI1,
    //            encodeURI(urlRB1),
    //            onFileUploadSuccess("photo1"),
    //            onFileTransferFail,
    //            options,
    //            true);
    //    }
    //    else {
    //    }
    //    if (app.controlPoint.homeModel.get("capturePhoto2Edit") != null && app.controlPoint.homeModel.get("capturePhoto2Edit") != "null") {
    //        imageObj2 = $.parseJSON(cur.CategoryImage2);
    //        fileURI2 = document.getElementById('picture_all_control_point2Edit').src;
    //        urlRB2 = app.controlPoint.homeModel._dataSourceOptions.transport.jsdo.url + imageObj2.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
    //        options.fileName = "photo2.jpeg";
    //        ft.upload(
    //            fileURI2,
    //            encodeURI(urlRB2),
    //            onFileUploadSuccess("photo2"),
    //            onFileTransferFail,
    //            options,
    //            true);
    //    }
    //    else {
    //    }
    //    //    }
    //    //    myData = dataSource;
    //    //    myId = view[0].id;
    //    //    homeModel.set("idToShare", myId)
    //    //});

    //    function onFileUploadSuccess(fieldName) {

    //        if (fieldName === "photo1") {
    //            window.plugins.toast.showWithOptions(
    //                {
    //                    message: "תמונה עלתה בהצלחה",
    //                    duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
    //                    position: "bottom",
    //                    addPixelsY: -40  // added a negative value to move it up a bit (default 0)
    //                }

    //            );
    //        }
    //        if (fieldName === "photo2") {
    //            window.plugins.toast.showWithOptions(
    //                {
    //                    message: "תמונה עלתה בהצלחה",
    //                    duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
    //                    position: "bottom",
    //                    addPixelsY: -40  // added a negative value to move it up a bit (default 0)
    //                }

    //            );
    //        }
    //        moneS++;
    //        if (mone == moneS) {
    //            app.controlPoint.homeModel.set("fileURIEdit", "null");
    //            app.controlPoint.homeModel.set("capturePhoto1Edit", "null");
    //            app.controlPoint.homeModel.set("capturePhoto2Edit", "null");
    //            homeModel.save2();
    //        }
    //    }
    //    function onFileTransferFail(error) {
    //        console.log("FileTransfer Error:");
    //        console.log("Code: " + error.code);
    //        console.log("Body:" + error.body);
    //        console.log("Source: " + error.source);
    //        console.log("Target: " + error.target);
    //        alert("Error loading the image");
    //    }
    //}
    //till camera

    parent.set('homeModel', homeModel);
    parent.set('onShow', function (e) {
        try {
            var scroller = e.view.scroller;
            scroller.reset();
            app.mobileApp.showLoading();

            //שולף טבלה מהשרת
            dataProvider.loadCatalogs().then(function _catalogsLoaded() {
                var jsdoOptions = homeModel.get('_jsdoOptions'),
                    jsdo = new progress.data.JSDO(jsdoOptions),
                    dataSourceOptions = homeModel.get('_dataSourceOptions'),
                    dataSource;
                dataSourceOptions.transport.jsdo = jsdo;
                dataSource = new kendo.data.DataSource(dataSourceOptions)
                //dataSource.filter({
                //    field: "locationId",
                //    operator: "==",
                //    value: (app.project.homeModel.get("dataItem")).locationId
                //});
                dataSource.sort({
                    field: "Index",
                    dir: "asc"
                })
                homeModel.set('dataSource', dataSource);
                var dataSource1 = homeModel.get("dataSource");
                homeModel.set("dataSource1", dataSource1)
                $("#listView").kendoListView({
                    dataSource: dataSource1,
                    template: kendo.template($("#template1").html()),
                    selectable: true,
                    change: function () {
                        var index = this.select().index(),
                            dataItem = this.dataSource.view()[index];
                    }
                });





                app.mobileApp.hideLoading();

            });

        } catch (e) {
            alert("שגיאה")
        }
    });
    parent.set('onShow2', function (e) {
        try {
            //projectNameControlPoint.innerHTML = (app.project.homeModel.get("dataItem")).LocationName;
            var scroller = e.view.scroller;
            scroller.reset();

            var txt = (app.hightGuard.homeModel.get("currentCheck")).DroneURL;
            if (txt != null && txt != "null")
                document.getElementById("DroneURL").value = txt;//רחפן
            else
                document.getElementById("DroneURL").value = "";

            txt = (app.hightGuard.homeModel.get("currentCheck")).TourParticipants;
            if (txt != null && txt != "null")
                document.getElementById("TourParticipants").value = txt;//משתתפים בסיור
            else
                document.getElementById("TourParticipants").value = "";

            txt = (app.hightGuard.homeModel.get("currentCheck")).AdditionalComments;
            if (txt != null && txt != "null")
                document.getElementById("AdditionalComments").value = txt;//הערות נוספות
            else
                document.getElementById("AdditionalComments").value = "";

            //דוח
            document.getElementById("CheckupReport_URL").setAttribute("href", (app.hightGuard.homeModel.get("currentCheck")).CheckupReport_URL);
            document.getElementById("CheckupScore").innerHTML = (app.hightGuard.homeModel.get("currentCheck")).CheckupScore;
            NameReviwerAndcreatedAt.innerHTML = (app.hightGuard.homeModel.get("currentCheck")).NameReviwer + " " + kendo.toString((app.hightGuard.homeModel.get("currentCheck")).createdAt, "dd/MM/yyyy HH:mm")




        } catch (e) {
            alert("שגיאה")
        }
    });
    parent.set('onShowSectionInit', function (e) {
        //try {

        //var scroller = e.view.scroller;
        //scroller.reset();
        //app.mobileApp.showLoading();
    


        //סעיפים למבדק זה
        //dataProvider.loadCatalogs().then(function _catalogsLoaded() {
        //    var jsdoOptions = homeModel.get('_jsdoOptionsSectionCheckup'),
        //        jsdo = new progress.data.JSDO(jsdoOptions),
        //        dataSourceOptions = homeModel.get('_dataSourceOptions'),
        //        dataSource2;
        //    dataSourceOptions.transport.jsdo = jsdo;
        //    dataSource2 = new kendo.data.DataSource(dataSourceOptions)
        //  //  debugger;
        // //   homeModel.set('IntScore', jsdo.getPicklist_IntScore().response.picklistData);

        //    //homeModel.set('sectionStatus', app.controlPoint.homeModel._dataSourceOptions.transport.jsdo.getPicklist_SectionStatus().response.picklistData);
        //});


        //שולף טבלה סעיפי בדיקה מהשרת
        dataProvider.loadCatalogs().then(function _catalogsLoaded() {
            var jsdoOptions = homeModel.get('_jsdoOptionsCategorySection'),
                jsdo = new progress.data.JSDO(jsdoOptions),
                dataSourceOptions = homeModel.get('_dataSourceOptions'),
                dataSource;
            dataSourceOptions.transport.jsdo = jsdo;
            dataSource = new kendo.data.DataSource(dataSourceOptions)
            homeModel.set('dataSourceCategorySection', dataSource);
          
            homeModel.set('IntScore', jsdo.getPicklist_IntScore().response.picklistData);


        });
       // app.mobileApp.hideLoading();
        //} catch (e) {
        //    alert("שגיאה")
        //}
    });
    parent.set('onShowSection', function (e) {
        //try {
        //projectNameTestSection.innerHTML = (app.project.homeModel.get("dataItem")).LocationName;
        controlPointLabel.innerHTML =  (app.controlPoint.homeModel.get("itemClickCp")).name;
        var scroller = e.view.scroller;
        scroller.reset();
        app.mobileApp.showLoading();
        app.controlPoint.set("flagImage", false);
        document.getElementById("capturePhoto1").style.color = "black";
        document.getElementById("capturePhoto2").style.color = "black";
        document.getElementById("description_all_control_point").style.color = "black";
        document.getElementById("description_html").value = "";

        //מפגעים לפי נקודת בקרה
        dataProvider.loadCatalogs().then(function _catalogsLoaded() {
            var jsdoOptions = homeModel.get('_jsdoOptionsHazhardCPE'),
                jsdo = new progress.data.JSDO(jsdoOptions),
                dataSourceOptions = homeModel.get('_dataSourceOptions'),
                dataSource;
            dataSourceOptions.transport.jsdo = jsdo;
            dataSource = new kendo.data.DataSource(dataSourceOptions)
            dataSource.filter({
                field: "R408159667",
                operator: "==",
                value: (app.controlPoint.homeModel.get("itemClickCp")).id
            });
            var viewMefga = [];
            var viewSeif = [];
            var flag = false;
            dataSource.fetch(function () {
                viewMefga = dataSource.view();
                if (viewMefga.length > 0 && viewSeif.length > 0 && flag == false) {
                    doTemplatePage()
                }
            });
            document.getElementById('sectionStatusDiv').innerHTML = "";
            var dataSource1 = homeModel.get('dataSourceCategorySection');
            dataSource1.fetch(function () {
                viewSeif = dataSource1.view();
                if (viewMefga.length > 0 && viewSeif.length > 0 && flag == false) {
                    doTemplatePage()
                }

            });

            function doTemplatePage() {
                var arrObjectes=[];
                flag = true;
                for (var j = 0; j < viewMefga.length; j++) {
                 
                    var node1 = document.createElement('div');
                    var string1 = "";
                    string1 += "<div style='width: 100 %;height: 36 %;box - shadow:0 4px 2px - 2px #c7c1c1; '>";
                    string1 += "<label  style='max-width: 80%;background-color:#1A607C;font-family: Tahoma, Geneva, sans-serif; color:white; font-size: small;font-weight: 200;text-align:right;padding-left: 6px;padding-top: 2px;padding-right: 12px;padding-bottom: 3px;float: right;'>" + viewMefga[j].HazhardName
                    string1 += "</label></div>"
                    node1.innerHTML = string1;
                    document.getElementById('sectionStatusDiv').appendChild(node1);
                    var arrSeif = [];
                    for (var i = 10; i < viewSeif.length + 10; i++) {
                        if (viewSeif[i - 10].R408388358 == viewMefga[j].id) {
                            var obj = { "id": viewSeif[i - 10].id, "value": "null" }
                            arrSeif.push(obj);
                            var  node = document.createElement('div');
                            var string = "";
                            string += '<center style="background-color:#ffffff"><table style="width:95%;background-color:#ffffff;margin-top:20px;margin-bottom:20px;" dir="rtl" >';
                            string += '<tr style= "width:100%" >';
                            string += '<td  style= "" >';
                            string += '<label id="' + viewSeif[i - 10].id + '" style="font-family:Tahoma, Geneva, sans-serif;font-weight: bold;font-size:small;color:black;"> ' + viewSeif[i - 10].SectionContent + '</label>';
                            string += '</td>';
                            string += '</tr>';
                            string += '<td  style= "" >';
                            string += ' <div style="background-color: #fff;height:5px;"></div>';
                            string += '</td>';
                            string += '</tr>';

                            string += '<tr style= "width:100%" >';
                            string += '<td  style= "width:100%" >';
                            string += '<table style="width:100%" dir="rtl" >';
                            var arr = getList(viewSeif[i - 10].IntScore);
                            for (var k = 0; k < arr.length; k++) {
                                if (k % 2 == 0) {

                                    string += '<tr style= "width:100%;" >';
                                }
                                string += '<td  style= "width:50%" >';
                                string += '<table style="width:100%" dir="rtl" >';
                                string += '<tr style= "width:100%" >';
                                string += ' <td style="width:25%;">';
                                var nameTxt = "";
                                for (var o = 0; o < homeModel.get('IntScore').length; o++) {
                                    if (arr[k] == homeModel.get('IntScore')[o].id)
                                        nameTxt = homeModel.get('IntScore')[o].name;
                                }
                                string += '<input  type= "checkbox" name="' + viewSeif[i - 10].id + '"  onclick="myChooseSectionStatusN(this,this.name,' + nameTxt+')"/>'
                                string += ' </td > '
                                string += '<td style= "width:75%;" > '
                               
                                string += '<label  style="font-family:Tahoma, Geneva, sans-serif;font-weight: bold;font-size:small;color:black;"> ' + nameTxt+'</label></td>'
                                string += '</tr>';
                                string += '</table>';
                                string += ' </td > ';


                                if (k % 2 != 0) {
                                    string += '</tr>';
                                }
                            }

                        
                            //var obj = { sectionId: viewSeif[i - 10].id };
                            //homeModel.SectionStatusArr.push(obj)
                            string += '</table>';
                            string += ' </td > '
                            string += '</tr>';
                            string += '</table></center><div style="background-color: #e9eaeb;height:5px;"></div>';
                            node.innerHTML = string;
                            document.getElementById('sectionStatusDiv').appendChild(node);
                        }

                    }
                    var obj = { "id": viewMefga[j].id, "seif": arrSeif }
                    arrObjectes.push(obj)
                   
                }
                homeModel.set("arrObjectes", arrObjectes)
                oneChecked();
                app.mobileApp.hideLoading();
            }
            function getList(IntScore) {
                var res = [];
                if (IntScore != "null" && IntScore != -1)

                    res = IntScore.split(",");
                return res;

            }
        });

        //} catch (e) {
        //    alert("שגיאה")
        //}
    });
    parent.set('onShowSectionEdit', function (e) {
        //try {
        //projectNameTestSectionEdit.innerHTML = (app.project.homeModel.get("dataItem")).LocationName;
        controlPointLabelEdit.innerHTML =  (app.controlPoint.homeModel.get("itemClickCp")).name;
        var scroller = e.view.scroller;
        scroller.reset();
        app.mobileApp.showLoading();
        editSection1.hidden = false;
        saveSectionAssign1.hidden = true;

        app.controlPoint.set("flagIsEdit", false);
        if (homeModel.currentControlPointCheckup.ControlPointComment != "null") {
            document.getElementById("descriptionEdit").value = homeModel.currentControlPointCheckup.ControlPointComment;
        }
        else {
            document.getElementById("descriptionEdit").value = "";
        }
        var imag1 = homeModel.currentControlPointCheckup.URL_Image1;
        var imag2 = homeModel.currentControlPointCheckup.URL_Image2;
        //תמונות
        if (imag1 == "null") {
            document.getElementById("capturePhoto1Edit").style.color = "black";
            $("#picture_all_control_point1Edit").attr("src", "");
        }
        else {
            document.getElementById("capturePhoto1Edit").style.color = "red";
            document.getElementById("picture_all_control_point1Edit").src = imag1;
        }
        if (imag2 == "null") {
            document.getElementById("capturePhoto2Edit").style.color = "black";
            $("#picture_all_control_point2Edit").attr("src", "");
        }
        else {
            document.getElementById("capturePhoto2Edit").style.color = "red";
            document.getElementById("picture_all_control_point2Edit").src = imag2;
        }

        //מפגעים לפי נקודת בקרה
        dataProvider.loadCatalogs().then(function _catalogsLoaded() {
            var jsdoOptions = homeModel.get('_jsdoOptionsHazhardCPE'),
                jsdo = new progress.data.JSDO(jsdoOptions),
                dataSourceOptions = homeModel.get('_dataSourceOptions'),
                dataSource;
            dataSourceOptions.transport.jsdo = jsdo;
            dataSource = new kendo.data.DataSource(dataSourceOptions)
            dataSource.filter({
                field: "R408159667",
                operator: "==",
                value: (app.controlPoint.homeModel.get("itemClickCp")).id
            });
            var viewMefga = [];
            var viewSeif = [];
            var flag = false;
            dataSource.fetch(function () {
                viewMefga = dataSource.view();
                if (viewMefga.length > 0 && viewSeif.length > 0 && flag == false) {
                    doTemplatePage()
                }
            });
            document.getElementById('sectionStatusEditDiv').innerHTML = "";
            var dataSource1 = homeModel.get('dataSourceCategorySection');
            dataSource1.fetch(function () {
                viewSeif = dataSource1.view();
                if (viewMefga.length > 0 && viewSeif.length > 0 && flag == false) {
                    doTemplatePage()
                }

            });

            function doTemplatePage() {
                var arrObjectes = [];
                flag = true;
                for (var j = 0; j < viewMefga.length; j++) {

                    var node1 = document.createElement('div');
                    var string1 = "";
                    string1 += "<div style='width: 100 %;height: 36 %;box - shadow:0 4px 2px - 2px #c7c1c1; '>";
                    string1 += "<label  style='max-width: 80%;background-color:#1A607C;font-family: Tahoma, Geneva, sans-serif; color:white; font-size: small;font-weight: 200;text-align:right;padding-left: 6px;padding-top: 2px;padding-right: 12px;padding-bottom: 3px;float: right;'>" + viewMefga[j].HazhardName
                    string1 += "</label></div>"
                    node1.innerHTML = string1;
                    document.getElementById('sectionStatusEditDiv').appendChild(node1);
                    var arrSeif = [];
                    for (var i = 10; i < viewSeif.length + 10; i++) {
                        if (viewSeif[i - 10].R408388358 == viewMefga[j].id) {
                            var obj = { "id": viewSeif[i - 10].id, "value": "null","was":false }
                            //arrSeif.push(obj);
                            var node = document.createElement('div');
                            var string = "";
                            string += '<center style="background-color:#ffffff"><table style="width:95%;background-color:#ffffff;margin-top:20px;margin-bottom:20px;" dir="rtl" >';
                            string += '<tr style= "width:100%" >';
                            string += '<td  style= "" >';
                            string += '<label id="' + viewSeif[i - 10].id + '" style="font-family:Tahoma, Geneva, sans-serif;font-weight: bold;font-size:small;color:black;"> ' + viewSeif[i - 10].SectionContent + '</label>';
                            string += '</td>';
                            string += '</tr>';
                            string += '<td  style= "" >';
                            string += ' <div style="background-color: #fff;height:5px;"></div>';
                            string += '</td>';
                            string += '</tr>';

                            string += '<tr style= "width:100%" >';
                            string += '<td  style= "width:100%" >';
                            string += '<table style="width:100%" dir="rtl" >';
                            var arr = getList(viewSeif[i - 10].IntScore);
                            for (var k = 0; k < arr.length; k++) {
                                if (k % 2 == 0) {

                                    string += '<tr style= "width:100%;" >';
                                }
                                string += '<td  style= "width:50%" >';
                                string += '<table style="width:100%" dir="rtl" >';
                                string += '<tr style= "width:100%" >';
                                string += ' <td style="width:25%;">';
                                var nameTxt = "";
                                for (var o = 0; o < homeModel.get('IntScore').length; o++) {
                                    if (arr[k] == homeModel.get('IntScore')[o].id)
                                        nameTxt = homeModel.get('IntScore')[o].name;
                                }
                                var txtCheckbox = "";
                                // var obj = { "idMefga": view[i].R408159765, "idSeif": view1[j].R370259173, "id": view1[j].id, "val": view1[j].IntScore }
                                var arrObjectesSelect = homeModel.get("arrObjectesSelect")
                                for (var f = 0; f < arrObjectesSelect.length; f++) {
                                    if (arrObjectesSelect[f].idMefga == viewMefga[j].id && arrObjectesSelect[f].idSeif == viewSeif[i - 10].id && nameTxt == arrObjectesSelect[f].val)
                                    {
                                       
                                        txtCheckbox= '<input  type= "checkbox" checked name="' + viewSeif[i - 10].id + '"  onclick="myChooseSectionStatusND(this,this.name,' + nameTxt + ')"/>'
                                        obj.value = arrObjectesSelect[f].val;
                                        obj.was = true;
                                    }
                                    


                                }
                                if (txtCheckbox=="")
                                   txtCheckbox = '<input  type= "checkbox" name="' + viewSeif[i - 10].id + '"  onclick="myChooseSectionStatusND(this,this.name,' + nameTxt + ')"/>'

                                string += txtCheckbox;
                                string += ' </td > '
                                string += '<td style= "width:75%;" > '

                                string += '<label  style="font-family:Tahoma, Geneva, sans-serif;font-weight: bold;font-size:small;color:black;"> ' + nameTxt + '</label></td>'
                                string += '</tr>';
                                string += '</table>';
                                string += ' </td > ';


                                if (k % 2 != 0) {
                                    string += '</tr>';
                                }
                            }


                            //var obj = { sectionId: viewSeif[i - 10].id };
                            //homeModel.SectionStatusArr.push(obj)
                            string += '</table>';
                            string += ' </td > '
                            string += '</tr>';
                            string += '</table></center><div style="background-color: #e9eaeb;height:5px;"></div>';
                            node.innerHTML = string;
                            document.getElementById('sectionStatusEditDiv').appendChild(node);

                            arrSeif.push(obj);
                        }

                    }

                    var obj = { "id": viewMefga[j].id, "seif": arrSeif }
                    arrObjectes.push(obj)

                }
                homeModel.set("arrObjectes", arrObjectes)
                oneCheckedEdit();
                $("input:checkbox").attr("disabled", true);
                $("#descriptionEdit").attr("disabled", true);
                imageEdit1.hidden = true;
                imageEdit2.hidden = true;
                app.mobileApp.hideLoading();
            }
            function getList(IntScore) {
                var res = [];
                if (IntScore != "null" && IntScore != -1)

                    res = IntScore.split(",");
                return res;

            }
        });

      
    });
    parent.set('onShowTestSectionInit2', function (e) {
        //try {

        var scroller = e.view.scroller;
        scroller.reset();
        app.mobileApp.showLoading();
        //סעיפים למבדק זה
        dataProvider.loadCatalogs().then(function _catalogsLoaded() {
            var jsdoOptions = homeModel.get('_jsdoOptionsSectionCheckup'),
                jsdo = new progress.data.JSDO(jsdoOptions),
                dataSourceOptions = homeModel.get('_dataSourceOptions'),
                dataSource2;
            dataSourceOptions.transport.jsdo = jsdo;
            dataSource2 = new kendo.data.DataSource(dataSourceOptions)
            homeModel.set('sectionStatus', app.controlPoint.homeModel._dataSourceOptions.transport.jsdo.getPicklist_SectionStatus().response.picklistData);
        });


        //שולף טבלה סעיפי בדיקה מהשרת
        dataProvider.loadCatalogs().then(function _catalogsLoaded() {
            var jsdoOptions = homeModel.get('_jsdoOptionsCategorySection'),
                jsdo = new progress.data.JSDO(jsdoOptions),
                dataSourceOptions = homeModel.get('_dataSourceOptions'),
                dataSource;
            dataSourceOptions.transport.jsdo = jsdo;
            dataSource = new kendo.data.DataSource(dataSourceOptions)
            homeModel.set('dataSourceCategorySection', dataSource);



        });
        app.mobileApp.hideLoading();
        //} catch (e) {
        //    alert("שגיאה")
        //}
    });
    parent.set('onShowTestSection2', function (e) {
        //try {
        //projectNameTestSection.innerHTML = (app.project.homeModel.get("dataItem")).LocationName;
        controlPointLabel.innerHTML =(app.controlPoint.homeModel.get("itemClickCp")).name;
        var scroller = e.view.scroller;
        scroller.reset();
        app.mobileApp.showLoading();
        app.controlPoint.set("flagImage", false);
        document.getElementById("capturePhoto1").style.color = "black";
        document.getElementById("capturePhoto2").style.color = "black";
        document.getElementById("description_all_control_point").style.color = "black";
        document.getElementById("description_html").value = "";
        //שולף טבלה מהשרת
        var dataSource = homeModel.get('dataSourceCategorySection');
        dataSource.filter({
            field: "R370259295",
            operator: "==",
            value: (app.controlPoint.homeModel.get("itemClickCp")).id
        });
        document.getElementById('sectionStatusDiv').innerHTML = "";

        dataSource.fetch(function () {
            homeModel.set('dataSourceCategorySectionFilter', dataSource);
            var dataSourceF = homeModel.get('dataSourceCategorySectionFilter');
            var view = dataSourceF.view();
            for (var i = 10; i < view.length + 10; i++) {
                var node = document.createElement('div');
                var string = "";
                if (i == 10)
                    string += ' <div style="background-color: #fff;height:5px;"></div>';
                string += '<center><table style="width:95%;background-color:#ffffff;margin-top:20px;margin-bottom:20px;" dir="rtl" >';
                string += '<tr style= "width:100%" >';
                string += '<td  style= "" >';
                string += '<label id="' + view[i - 10].id + '" style="font-family:Tahoma, Geneva, sans-serif;font-weight: bold;font-size:small;color:black;"> ' + view[i - 10].SectionContent + '</label>';
                string += '</td>';
                string += '</tr>';
                string += '<td  style= "" >';
                string += ' <div style="background-color: #fff;height:5px;"></div>';
                string += '</td>';
                string += '</tr>';

                string += '<tr style= "width:100%" >';
                string += '<td  style= "width:100%" >';
                string += '<table style="width:100%" dir="rtl" >';
                //for (var j = homeModel.sectionStatus.length-1; j >=0; j++) {
                for (var j = 0; j < homeModel.sectionStatus.length; j++) {
                    if (j % 2 == 0) {

                        string += '<tr style= "width:100%;" >';
                    }
                    string += '<td  style= "width:50%" >';
                    string += '<table style="width:100%" dir="rtl" >';
                    string += '<tr style= "width:100%" >';
                    string += ' <td style="width:25%;">';
                    var myname = "";
                    myname += view[i - 10].SectionContent;
                    string += '<input id= "' + homeModel.sectionStatus[j].id + i + '"name="' + view[i - 10].id + '"  type= "checkbox"  onclick="myChooseSectionStatus(this.name,this.id)"/>'
                    string += ' </td > '
                    string += '<td style= "width:75%;" > '
                    string += '<label  style="font-family:Tahoma, Geneva, sans-serif;font-weight: 200;font-size:small;color:black;"> ' + homeModel.sectionStatus[j].name + '</label></td>'
                    string += '</tr>';
                    string += '</table>';
                    string += ' </td > ';


                    if (j % 2 != 0) {
                        string += '</tr>';
                    }
                }
                homeModel.default = homeModel.sectionStatus[j - 1].id;
                var obj = { sectionId: view[i - 10].id, statusId: homeModel.default };
                homeModel.SectionStatusArr.push(obj)
                string += '</table>';
                string += ' </td > '
                string += '</tr>';
                string += '</table></center><div style="background-color: #e9eaeb;height:5px;"></div>';
                node.innerHTML = string;
                document.getElementById('sectionStatusDiv').appendChild(node);
            }
            oneChecked();

            app.mobileApp.hideLoading();
        });


        //} catch (e) {
        //    alert("שגיאה")
        //}
    });
    parent.set('onShowTestSectionEdit2', function (e) {
        //try {
        //projectNameTestSectionEdit.innerHTML = (app.project.homeModel.get("dataItem")).LocationName;
        controlPointLabelEdit.innerHTML = "תחום נבדק:" + (app.controlPoint.homeModel.get("itemClickCp")).name;
        var scroller = e.view.scroller;
        scroller.reset();
        app.mobileApp.showLoading();
        editSection1.hidden = false;
        saveSectionAssign1.hidden = true;

        app.controlPoint.set("flagIsEdit", false);
        if (homeModel.currentControlPointCheckup.ControlPointComment != "null") {
            document.getElementById("descriptionEdit").value = homeModel.currentControlPointCheckup.ControlPointComment;
        }
        else {
            document.getElementById("descriptionEdit").value = "";
        }
        var imag1 = homeModel.currentControlPointCheckup.URL_Image1;
        var imag2 = homeModel.currentControlPointCheckup.URL_Image2;
        //תמונות
        if (imag1 == "null") {
            document.getElementById("capturePhoto1Edit").style.color = "black";
            $("#picture_all_control_point1Edit").attr("src", "");
        }
        else {
            document.getElementById("capturePhoto1Edit").style.color = "red";
            document.getElementById("picture_all_control_point1Edit").src = imag1;
        }
        if (imag2 == "null") {
            document.getElementById("capturePhoto2Edit").style.color = "black";
            $("#picture_all_control_point2Edit").attr("src", "");
        }
        else {
            document.getElementById("capturePhoto2Edit").style.color = "red";
            document.getElementById("picture_all_control_point2Edit").src = imag2;
        }


        //שולף טבלה מהשרת

        var dataSource = homeModel.get('dataSourceCategorySection');
        dataSource.filter({
            field: "R370259295",
            operator: "==",
            value: (app.controlPoint.homeModel.get("itemClickCp")).id
        });
        document.getElementById('sectionStatusEditDiv').innerHTML = "";
        dataSource.fetch(function () {
            homeModel.set('dataSourceCategorySectionFilter', dataSource);
            var dataSourceF = homeModel.get('dataSourceCategorySectionFilter');
            var view = dataSourceF.view();
            var IsChecked;
            var EditSectionItem = homeModel.get('EditSectionItem');
            for (var i = 10; i < view.length + 10; i++) {
                for (var x = 0; x < EditSectionItem.length; x++) {
                    if (view[i - 10].id == EditSectionItem[x].R370259173) {
                        IsChecked = EditSectionItem[x].SectionStatus;
                        break;
                    }
                }
                var node = document.createElement('div');
                var string = "";
                if (i == 10)
                    string += ' <div style="background-color: #fff;height:5px;"></div>';
                string += '<center><table style="width:95%;background-color:#ffffff;margin-top:20px;margin-bottom:20px;" dir="rtl" >';
                string += '<tr style= "width:100%" >';
                string += '<td  style= "" >';
                string += '<label id="' + view[i - 10].id + '" style="font-family:Tahoma, Geneva, sans-serif;font-weight: bold;font-size:small;color:black;"> ' + view[i - 10].SectionContent + '</label>';
                string += '</td>';
                string += '</tr>';
                string += '<td  style= "" >';
                string += ' <div style="background-color: #fff;height:5px;"></div>';
                string += '</td>';
                string += '</tr>';

                string += '<tr style= "width:100%" >';
                string += '<td  style= "width:100%" >';
                string += '<table style="width:100%" dir="rtl" >';
                //for (var j = homeModel.sectionStatus.length-1; j >=0; j++) {
                for (var j = 0; j < homeModel.sectionStatus.length; j++) {
                    if (j % 2 == 0) {
                        string += '<tr style= "width:100%;" >';
                    }
                    string += '<td  style= "width:50%" >';
                    string += '<table style="width:100%" dir="rtl" >';
                    string += '<tr style= "width:100%" >';
                    string += ' <td style="width:25%;">';
                    var myname = "";
                    myname += view[i - 10].SectionContent;
                    if (IsChecked == homeModel.sectionStatus[j].id) {
                        string += '<input id= "' + homeModel.sectionStatus[j].id + i + '"name="' + view[i - 10].id + '"  type= "checkbox" checked onclick="myChooseSectionEditStatus(this.name,this.id)"/>'
                    }
                    else
                        string += '<input id= "' + homeModel.sectionStatus[j].id + i + '"name="' + view[i - 10].id + '"  type= "checkbox"  onclick="myChooseSectionEditStatus(this.name,this.id)"/>'
                    string += ' </td > '
                    string += '<td style= "width:75%;" > '
                    string += '<label  style="font-family:Tahoma, Geneva, sans-serif;font-weight: 200;font-size:small;color:black;"> ' + homeModel.sectionStatus[j].name + '</label></td>'
                    string += '</tr>';
                    string += '</table>';
                    string += ' </td > ';


                    if (j % 2 != 0) {
                        string += '</tr>';
                    }
                }
                homeModel.default = IsChecked;
                var obj = { sectionId: view[i - 10].id, statusId: homeModel.default };
                homeModel.SectionStatusArr.push(obj)
                string += '</table>';
                string += ' </td > '
                string += '</tr>';
                string += '</table></center><div style="background-color: #e9eaeb;height:5px;"></div>';
                node.innerHTML = string;
                document.getElementById('sectionStatusEditDiv').appendChild(node);
            }
            oneCheckedEdit();
            $("input:checkbox").attr("disabled", true);
            $("#descriptionEdit").attr("disabled", true);
            imageEdit1.hidden = true;
            imageEdit2.hidden = true;

            app.mobileApp.hideLoading();
        });
    });
})(app.controlPoint);

