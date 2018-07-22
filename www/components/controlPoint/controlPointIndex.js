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
        //אובייקט בניין
        jsdoOptionsbuildingsSite = {
            name: 'buildingsSite',
            autoFill: false
        },
        //אובייקט כלי טעון בדיקה
        jsdoOptionsToolsSite = {
            name: 'ToolsSite',
            autoFill: false
        },
        //מטיסים
        jsdoOptionsDroneOperator = {
            name: 'DroneOperator',
            autoFill: false
        },
        //-כלי-מטיסים
        jsdoOptionsdrones = {
            name: 'drones',
            autoFill: false
        },

        //הערות
        jsdoOptionsSectionNote = {
            name: 'SectionNote',
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
            _jsdoOptionsSectionNote: jsdoOptionsSectionNote,
            _jsdoOptionsSectionCheckup: jsdoOptionsSectionCheckup,
            _jsdoOptionsControlPointCheckup: jsdoOptionsControlPointCheckup,
            _jsdoOptionsCheckupObject: jsdoOptionsCheckupObject,
            _jsdoOptionsHazhardCPE: jsdoOptionsHazhardCPE,
            _jsdoOptionsHazhardCPEC: jsdoOptionsHazhardCPEC,
            dataSourceSectionCheckupEdit: dataSourceSectionCheckupEdit,
            _jsdoOptionsbuildingsSite: jsdoOptionsbuildingsSite,
            _jsdoOptionsToolsSite: jsdoOptionsToolsSite,
            _jsdoOptionsdrones: jsdoOptionsdrones,
            _jsdoOptionsDroneOperator: jsdoOptionsDroneOperator,
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

            checkItem: {},
            builtItem: {},
            toolItem: {},
            itemClickTool: function (e) {
                var item = e.dataItem;
                homeModel.set("clickItemTool", item)
                setTimeout(function () {
                    $("#popToolAll").kendoMobileModalView("close");
                    $("#popToolDetailes").kendoMobileModalView("open");
                }, 100);

            },
            EditTool: function (e) {
                var clickItemTool = homeModel.get("clickItemTool");
                var dataSource = homeModel.get("dataSourceTool");
                var jsdo = dataSource.transport.jsdo;
                var jsrow = jsdo.findById(clickItemTool.id);
                var afterUpdateFn;
                jsrow.assign(clickItemTool);
                afterUpdateFn = function (jsdo, record, success, request) {
                    jsdo.unsubscribe('afterUpdate', afterUpdateFn);
                    if (success === true) {
                        $("#popToolDetailes").kendoMobileModalView("close");
                        $("#popEndCheck").kendoMobileModalView("open");
                    }
                    else {
                        alert("שגיאה");
                    }
                };
                jsdo.subscribe('afterUpdate', afterUpdateFn);
                jsdo.saveChanges();

            },
            loadTool: function () {
                var jsdoOptions = homeModel.get('_jsdoOptionsToolsSite'),
                    jsdo = new progress.data.JSDO(jsdoOptions),
                    dataSourceOptions = homeModel.get('_dataSourceOptions'),
                    dataSource;
                dataSourceOptions.transport.jsdo = jsdo;
                dataSource = new kendo.data.DataSource(dataSourceOptions);
                dataSource.filter({
                    logic: "and",
                    filters: [
                        { field: "locationId", operator: "eq", value: app.project.homeModel.get("dataItem").locationId },
                        { field: "R408159722", operator: "eq", value: app.hightGuard.homeModel.get("currentCheck").id }
                    ]
                });
                homeModel.set("dataSourceTool", dataSource);
                $("#popToolAll").kendoMobileModalView("open");

            },
            addTool: function () {
                app.mobileApp.showLoading();
                var jsdoOptions = homeModel.get('_jsdoOptionsToolsSite'),
                    jsdo = new progress.data.JSDO(jsdoOptions),
                    dataSourceOptions = homeModel.get('_dataSourceOptions'),
                    dataSource;
                dataSourceOptions.transport.jsdo = jsdo;
                dataSource = new kendo.data.DataSource(dataSourceOptions);
                homeModel.toolItem.set("locationId", (app.project.homeModel.get("dataItem")).locationId)
                homeModel.toolItem.set("R408159722", (app.hightGuard.homeModel.get("currentCheck")).id);

                function saveModel(data) {

                    dataSource.add(homeModel.get("toolItem"));
                    dataSource.one('change', function (e) {
                        homeModel.set("toolItem", {});
                        $("#popEndCheck").kendoMobileModalView("open");
                        $("#popTool").kendoMobileModalView("close");
                        app.mobileApp.hideLoading();

                    });
                    dataSource.sync();
                };
                saveModel();
            },

            itemClickBuild: function (e) {
                var item = e.dataItem;
                homeModel.set("clickItemBuild", item)
                homeModel.doSelectDetailes();
                setTimeout(function () {
                    $("#popBuildAll").kendoMobileModalView("close");
                    $("#popBuildDetailes").kendoMobileModalView("open");
                }, 100);

            },
            EditBuild: function (e) {
                var e = document.getElementById("executionStepSelectDetailes");
                var executionStep = e.options[e.selectedIndex].value;
                homeModel.clickItemBuild.set("executionStep", executionStep);

                var clickItemBuild = homeModel.get("clickItemBuild");
                var dataSource = homeModel.get("dataSourceBuild");
                var jsdo = dataSource.transport.jsdo;
                var jsrow = jsdo.findById(clickItemBuild.id);
                var afterUpdateFn;
                jsrow.assign(clickItemBuild);
                afterUpdateFn = function (jsdo, record, success, request) {
                    jsdo.unsubscribe('afterUpdate', afterUpdateFn);
                    if (success === true) {
                        $("#popBuildDetailes").kendoMobileModalView("close");
                        $("#popEndCheck").kendoMobileModalView("open");
                    }
                    else {
                        alert("שגיאה");
                    }
                };
                jsdo.subscribe('afterUpdate', afterUpdateFn);
                jsdo.saveChanges();

            },
            loadBuild: function () {
                var jsdoOptions = homeModel.get('_jsdoOptionsbuildingsSite'),
                    jsdo = new progress.data.JSDO(jsdoOptions),
                    dataSourceOptions = homeModel.get('_dataSourceOptions'),
                    dataSource;
                dataSourceOptions.transport.jsdo = jsdo;
                dataSource = new kendo.data.DataSource(dataSourceOptions);
                dataSource.filter({
                    logic: "and",
                    filters: [
                        { field: "locationId", operator: "eq", value: app.project.homeModel.get("dataItem").locationId },
                        { field: "R408159712", operator: "eq", value: app.hightGuard.homeModel.get("currentCheck").id }
                    ]
                });
                homeModel.set("dataSourceBuild", dataSource);
                $("#popBuildAll").kendoMobileModalView("open");

            },
            addBuild: function () {

                app.mobileApp.showLoading();
                var jsdoOptions = homeModel.get('_jsdoOptionsbuildingsSite'),
                    jsdo = new progress.data.JSDO(jsdoOptions),
                    dataSourceOptions = homeModel.get('_dataSourceOptions'),
                    dataSource;
                dataSourceOptions.transport.jsdo = jsdo;
                dataSource = new kendo.data.DataSource(dataSourceOptions);

                homeModel.builtItem.set("locationId", (app.project.homeModel.get("dataItem")).locationId);
                homeModel.builtItem.set("R408159712", (app.hightGuard.homeModel.get("currentCheck")).id);


                var e = document.getElementById("executionStepSelect");
                var executionStep = e.options[e.selectedIndex].value;

                homeModel.builtItem.set("executionStep", executionStep);

                function saveModel(data) {

                    dataSource.add(homeModel.get("builtItem"));
                    dataSource.one('change', function (e) {
                        homeModel.set("builtItem", {});
                        $("#popEndCheck").kendoMobileModalView("open");
                        $("#popBuild").kendoMobileModalView("close");
                        app.mobileApp.hideLoading();

                    });
                    dataSource.sync();
                };
                saveModel();
            },
            doSelect: function () {
                document.getElementById("executionStepSelect").options.length = 0;
                var list = homeModel.get('executionStep');
                var select = document.getElementById("executionStepSelect");
                var option = document.createElement("option");
                option.text = "שלב ביצוע";
                option.value = -1;
                select.add(option);
                for (var i = 0; i < list.length; i++) {
                    var option = document.createElement("option");
                    option.text = list[i].name;
                    option.value = list[i].id;
                    select.add(option);
                }
            },
            doSelectDetailes: function () {
                document.getElementById("executionStepSelectDetailes").options.length = 0;
                var val = homeModel.clickItemBuild.get("executionStep");
                var index = 0;
                var list = homeModel.get('executionStep');
                var select = document.getElementById("executionStepSelectDetailes");
                var option = document.createElement("option");
                option.text = "שלב ביצוע";
                option.value = -1;
                select.add(option);
                for (var i = 0; i < list.length; i++) {
                    var option = document.createElement("option");
                    option.text = list[i].name;
                    option.value = list[i].id;
                    select.add(option);
                    if (list[i].id == val)
                        index = i + 1;
                }
                document.getElementById("executionStepSelectDetailes").selectedIndex = index;

            },

            //בלחיצה על ציון בסעיף
            myChooseSectionStatusN: function (this1, seif, val) {

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
            saveControlPoint: function () {
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
                            homeModel.saveSeif();
                        }
                    });
                    dataSource.sync();
                };
                saveModel();
            },
            //יצירת  סעיפים ומפגעים
            saveSeif: function () {
                var arrObjectes = homeModel.get('arrObjectes');
                var arr = [];
                var arrM = [];
                var arrSeifSaveImage = [];

                for (var i = 0; i < arrObjectes.length; i++) {
                    var flag = false;
                    for (var j = 0; j < arrObjectes[i].seif.length; j++) {
                        if (arrObjectes[i].seif[j].value != "null") {
                            flag = true;
                            var Remarks = "";
                            for (var x = 0; x < homeModel.get("arrSeifComments").length; x++) {
                                if (homeModel.get("arrSeifComments")[x].id == arrObjectes[i].seif[j].id)
                                    Remarks = homeModel.get("arrSeifComments")[x].Comments;
                            }
                            var obj = {
                                "R408159700": arrObjectes[i].id,//מקשרת למפגע שניבחר
                                "R370259173": arrObjectes[i].seif[j].id,//מקשרת לסעיף בנק
                                "IntScore": arrObjectes[i].seif[j].value,//ערך
                                "locationId": (app.project.homeModel.get("dataItem")).locationId,
                                "cb_isActive": true,//פעיל
                                "Remarks": Remarks
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
                        arrM.push(obj)
                        //saveMefga(obj)
                    }
                }
                if (arrM.length == 0) {
                    $("input:checkbox").prop("checked", false);
                    app.mobileApp.hideLoading();
                    app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
                }
                var m = 0;
                var m1 = 0;
                for (m; m < arrM.length; m++) {
                    saveMefga(arrM[m]);
                }
                var s = 0;
                var s1 = 0;
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
                                m1++;

                                for (var k = 0; k < arr.length; k++) {
                                    if (arr[k].R408159700 == current.R408159765) {
                                        arr[k].R408159700 = current.id;
                                        // saveSeif(arr[k])
                                    }
                                }

                                if (m == m1) {
                                    if (arr.length == 0) {
                                        $("input:checkbox").prop("checked", false);
                                        app.mobileApp.hideLoading();
                                        app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
                                    }
                                    for (s; s < arr.length; s++) {
                                        saveSeif(arr[s])
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
                                for (var x = 0; x < homeModel.get("arrSeifImage").length; x++) {
                                    if (homeModel.get("arrSeifImage")[x].id == current.R370259173 && homeModel.get("arrSeifImage")[x].src != "")
                                        arrSeifSaveImage.push({ "id": current.id, "SectionImage1": current.SectionImage1, "image": homeModel.get("arrSeifImage")[x].src })
                                }
                                s1++;
                                if (s1 == s) {

                                    uploadPhotoSeif(arrSeifSaveImage)
                                    $("input:checkbox").prop("checked", false);
                                    app.mobileApp.hideLoading();
                                    app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
                                }
                                // if()
                                //  console.log(current.R408159700)
                                // homeModel.arrObjectes = [];
                            });
                            dataSource.sync();
                        };
                        saveModel();
                    });
                }
                function uploadPhotoSeif(arr) {
                    var jsdoOptions = homeModel.get('_jsdoOptionsSectionCheckup'),
                        jsdo = new progress.data.JSDO(jsdoOptions),
                        dataSourceOptions = homeModel.get('_dataSourceOptions'),
                        dataSource;
                    dataSourceOptions.transport.jsdo = jsdo;
                    dataSource = new kendo.data.DataSource(dataSourceOptions)

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
                    var imageObj;
                    var fileURI;
                    var urlRB;
                    for (var i = 0; i < arr.length; i++) {
                        imageObj = $.parseJSON(arr[i].SectionImage1);
                        fileURI = arr[i].image;
                        urlRB = jsdo.url + imageObj.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
                        options.fileName = "photo.jpeg";
                        ft.upload(
                            fileURI,
                            encodeURI(urlRB),
                            onFileUploadSuccess("photo"),
                            onFileTransferFail,
                            options,
                            true);
                    }


                    function onFileUploadSuccess(fieldName) {
                        //alert("sss")
                    }
                    function onFileTransferFail(error) {
                        alert("Error loading the image");
                    }

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


            //בלחיצה על נקודת בקרה
            itemClick: function (e) {
                app.mobileApp.showLoading();
                homeModel.set("dailyCheckOrLikuy", false);
                var dataSource3 = homeModel.get("dataSourceCP");
                var itemClick = dataSource3.getByUid(e.dataItem.uid);
                homeModel.set('itemClickCp', itemClick)
                //homeModel.editOrNew(itemClick);
                if (itemClick.check == true) {
                    homeModel.editSection(itemClick.CPcheck.id)
                    homeModel.currentControlPointCheckup = itemClick.CPcheck;
                } else {
                    if (app.hightGuard.homeModel.get("currentCheck").cb_isPublish != 1) //מבדק פתוח
                        app.mobileApp.navigate('#components/controlPoint/sections.html');
                }
                app.mobileApp.hideLoading();
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
                                if (app.hightGuard.homeModel.get("currentCheck").cb_isPublish != 1) //מבדק פתוח
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
                                    var url = "";
                                    if (view1[j].SectionImage1URL != "null")
                                        url = view1[j].SectionImage1URL;
                                    var obj = {
                                        "idMefga": view[i].R408159765, "idMefgaID": view[i].id, "idSeif": view1[j].R370259173, "id": view1[j].id, "val": view1[j].IntScore, "image": url, "SectionImage1": view1[j].SectionImage1, "Remarks": view1[j].Remarks
                                    }
                                    arrObjectesSelect.push(obj);
                                }
                            }
                        }
                        homeModel.set("arrObjectesSelect", arrObjectesSelect);

                        app.mobileApp.hideLoading();
                        //app.mobileApp.navigate('#components/controlPoint/sectionsEdit.html');
                        app.mobileApp.navigate('#components/controlPoint/sectionsDetails.html');

                    }
                    homeModel.set("dataSectionCheckup", dataSource1);
                } catch (e) {
                    alert("שגיאה")
                }
            },

            //בלחיצה על כפתור ערוך
            startEdit: function () {
                if (app.hightGuard.homeModel.get("currentCheck").cb_isPublish != 1) {//מבדק סגור
                    editSection1.hidden = true;
                    saveSectionAssign1.hidden = false;
                    $("input:checkbox").attr("disabled", false);
                    $("#descriptionEdit").attr("disabled", false);
                    imageEdit1.hidden = false;
                    imageEdit2.hidden = false;
                    app.controlPoint.set("flagIsEdit", true)
                    inputListCommentsEditDiv.hidden = false;
                    document.getElementById("changeImageSeifD").style.display = "";
                    $('[name=sketch]').css("display", "");
                    $("textarea").attr("disabled", false);

                }
            },
            //שמירת עריכה
            saveEditControlPoint: function () {
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
                                            homeModel.saveEditSeif();
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
                                homeModel.saveEditSeif();
                        }


                    });
                }
                else {
                    homeModel.saveEditSeif();
                }

            },
            saveEditSeif: function () {
                app.mobileApp.showLoading();
                var arrObjectes = homeModel.get('arrObjectes');
                var arrNew = [];//סעיפים חדשים
                var arrIsMefga = [];//סעיפים חדשים שייש להם מפגעים
                var arrEdit = [];//סעיפים קיימים
                var arrM = [];//מפגעים חדשים
                var arrEditImage = [];//תמונות

                var arrObjectesSelect = homeModel.get("arrObjectesSelect")
                for (var i = 0; i < arrObjectes.length; i++) {
                    var flag = false;
                    for (var j = 0; j < arrObjectes[i].seif.length; j++) {
                        if (arrObjectes[i].seif[j].was == false) {//סעיף חדש
                            if (arrObjectes[i].seif[j].value != "null") {//אם קיים ערך
                                if (arrObjectes[i].was == true) {//אם קיים מפגע
                                    var Remarks = "";
                                    for (var x = 0; x < homeModel.get("arrSeifComments").length; x++) {
                                        if (homeModel.get("arrSeifComments")[x].id == arrObjectes[i].seif[j].id)
                                            Remarks = homeModel.get("arrSeifComments")[x].Comments;
                                    }

                                    //מייצרת סעיף ומקשרת למפגע שקיים
                                    var obj = {
                                        "R408159700": arrObjectes[i].mefgaID,//מקשרת למפגע שניבחר
                                        "R370259173": arrObjectes[i].seif[j].id,//מקשרת לסעיף בנק
                                        "IntScore": arrObjectes[i].seif[j].value,//ערך
                                        "locationId": (app.project.homeModel.get("dataItem")).locationId,
                                        "cb_isActive": true,//פעיל
                                        "Remarks": Remarks//הערות
                                    };
                                    arrIsMefga.push(obj);
                                }
                                else {//לא קיים מפגע
                                    //מייצרת מפגע 
                                    //מייצרת סעיף
                                    flag = true;
                                    var Remarks = "";
                                    for (var x = 0; x < homeModel.get("arrSeifComments").length; x++) {
                                        if (homeModel.get("arrSeifComments")[x].id == arrObjectes[i].seif[j].id)
                                            Remarks = homeModel.get("arrSeifComments")[x].Comments;
                                    }

                                    var obj = {
                                        "R408159700": arrObjectes[i].id,//מקשרת למפגע שניבחר
                                        "R370259173": arrObjectes[i].seif[j].id,//מקשרת לסעיף בנק
                                        "IntScore": arrObjectes[i].seif[j].value,//ערך
                                        "locationId": (app.project.homeModel.get("dataItem")).locationId,
                                        "cb_isActive": true,//פעיל
                                        "Remarks": Remarks//הערות
                                    };
                                    arrNew.push(obj);

                                }
                            }
                        }
                        else {//עריכת סעיף
                            var val = "";
                            var imsge = "";
                            var Remarks = "";
                            var Remarks2 = "";
                            //var obj = { "idMefga": view[i].R408159765, "idMefgaID": view[i].id, "idSeif": view1[j].R370259173, "id": view1[j].id, "val": view1[j].IntScore, "image": url, "SectionImage1": view1[j].SectionImage1 }
                            for (var x = 0; x < homeModel.get("arrSeifComments").length; x++) {
                                if (homeModel.get("arrSeifComments")[x].id == arrObjectes[i].seif[j].id)
                                    Remarks = homeModel.get("arrSeifComments")[x].Comments;
                            }
                            for (var k = 0; k < arrObjectesSelect.length; k++) {
                                if (arrObjectes[i].seif[j].seifID == arrObjectesSelect[k].id) {
                                    val = arrObjectesSelect[k].val;
                                    Remarks2 = arrObjectesSelect[k].Remarks;
                                }
                            }

                            if (arrObjectes[i].seif[j].value != val || Remarks2 != Remarks) {//אם השתנה הערך
                                var obj = {
                                    "id": arrObjectes[i].seif[j].seifID,
                                    "IntScore": arrObjectes[i].seif[j].value,//ערך
                                    "R370259173": arrObjectes[i].seif[j].id,//אבא סעיף
                                    "SectionImage1": arrObjectes[i].seif[j].SectionImage1,//אבא סעיף
                                    "Remarks": Remarks//הערות
                                };
                                arrEdit.push(obj);
                            }
                            else {//אם השתנת התמונה ולא הערך
                                for (var x = 0; x < homeModel.get("arrSeifImage").length; x++) {
                                    if (homeModel.get("arrSeifImage")[x].id == arrObjectes[i].seif[j].id && homeModel.get("arrSeifImage")[x].src != "" && homeModel.get("arrSeifImage")[x].src != homeModel.get("arrSeifImage")[x].srcTemp)
                                        arrEditImage.push({ "id": arrObjectes[i].seif[j].seifID, "SectionImage1": arrObjectes[i].seif[j].SectionImage1, "image": homeModel.get("arrSeifImage")[x].src });
                                }
                            }

                        }
                    }
                    if (flag == true) {//מפגעים חדשים
                        var objM = {
                            "R408159685": homeModel.currentControlPointCheckup.id,//מקשרת לנקודת בקרה שנוצרה
                            "R408159765": arrObjectes[i].id,//מקשרת למפגע בנק
                            "locationId": (app.project.homeModel.get("dataItem")).locationId,
                            "cb_isActive": true//פעיל
                        };
                        arrM.push(objM)
                        //saveMefga(objM)
                    }

                }
                var m = 0;
                var m1 = 0;
                var s = 0;
                var s1 = 0;

                //מפגעים חדשים
                for (m; m < arrM.length; m++) {
                    saveMefga(arrM[m]);
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
                                m1++;
                                for (var k = 0; k < arrNew.length; k++) {//סעיפים
                                    if (arrNew[k].R408159700 == current.R408159765) {
                                        arrNew[k].R408159700 = current.id;
                                        //  saveSeif(arrNew[k])
                                    }

                                }
                                if (m1 == m) {//אם סיימתי לעבור על כל המפגעים
                                    for (var s2 = 0; s2 < arrNew.length; s2++) {//מייצרת סעיפים שכרגע נוצר להם מפגע
                                        saveSeif(arrNew[s2])
                                    }
                                }


                            });
                            dataSource.sync();
                        };
                        saveModel();
                    });
                }
                //שמירת סעיף למבדק
                s += arrNew.length;//יצירת סעיף (אחרי יצירת מפגע)
                s += arrIsMefga.length;//יצירת סעיף שייש לו מפגע
                s += arrEdit.length; //עריכת סעיף
                if (s == 0) {
                    uploadPhotoSeifD();
                    //document.getElementById('sectionStatusEditDiv').innerHTML = "";
                    //$("input:checkbox").prop("checked", false);
                    //app.mobileApp.hideLoading();
                    //app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
                }//אם לא קיימים סעיפים חדשים
                for (var i = 0; i < arrIsMefga.length; i++) {//מייצרת סעיפים שייש להם מפגע
                    saveSeif(arrIsMefga[i]);
                }
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
                                s1++;
                                for (var x = 0; x < homeModel.get("arrSeifImage").length; x++) {
                                    if (homeModel.get("arrSeifImage")[x].id == current.R370259173 && homeModel.get("arrSeifImage")[x].src != "" && homeModel.get("arrSeifImage")[x].src != homeModel.get("arrSeifImage")[x].srcTemp)
                                        arrEditImage.push({ "id": current.id, "SectionImage1": current.SectionImage1, "image": homeModel.get("arrSeifImage")[x].src });
                                }
                                //console.log("יצירה")
                                // console.log(current)
                                if (s1 == s) {
                                    uploadPhotoSeifD();
                                }
                            });
                            dataSource.sync();
                        };
                        saveModel();
                    });
                }//מייצרת סעיף חדש
                editSeif();
                function editSeif() {
                    var dataSource = homeModel.get("dataSectionCheckup");
                    for (var i = 0; i < arrEdit.length; i++) {
                        for (var x = 0; x < homeModel.get("arrSeifImage").length; x++) {
                            if (homeModel.get("arrSeifImage")[x].id == arrEdit[i].R370259173 && homeModel.get("arrSeifImage")[x].src != "" && homeModel.get("arrSeifImage")[x].src != homeModel.get("arrSeifImage")[x].srcTemp)
                                arrEditImage.push({ "id": arrEdit[i].id, "SectionImage1": arrEdit[i].SectionImage1, "image": homeModel.get("arrSeifImage")[x].src });
                        }

                        var newVal = {
                            "IntScore": arrEdit[i].IntScore,//ערך
                            "Remarks": arrEdit[i].Remarks
                        }
                        var id = arrEdit[i].id;
                        try {
                            var jsdo = dataSource.transport.jsdo;
                            var jsrow = jsdo.findById(id);
                            var afterUpdateFn;
                            jsrow.assign(newVal);
                            afterUpdateFn = function (jsdo, record, success, request) {
                                jsdo.unsubscribe('afterUpdate', afterUpdateFn);
                                if (success === true) {
                                    //console.log("הצלחה")
                                    s1++;
                                    if (s1 == s) {
                                        uploadPhotoSeifD();
                                    }
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
                    }

                }//עורכת סעיף
                function uploadPhotoSeifD() {
                    //console.log(arrEditImage);
                    var jsdoOptions = homeModel.get('_jsdoOptionsSectionCheckup'),
                        jsdo = new progress.data.JSDO(jsdoOptions),
                        dataSourceOptions = homeModel.get('_dataSourceOptions'),
                        dataSource;
                    dataSourceOptions.transport.jsdo = jsdo;
                    dataSource = new kendo.data.DataSource(dataSourceOptions)

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
                    var imageObj;
                    var fileURI;
                    var urlRB;
                    for (var i = 0; i < arrEditImage.length; i++) {
                        imageObj = $.parseJSON(arrEditImage[i].SectionImage1);
                        fileURI = arrEditImage[i].image;
                        urlRB = jsdo.url + imageObj.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
                        options.fileName = "photo.jpeg";
                        ft.upload(
                            fileURI,
                            encodeURI(urlRB),
                            onFileUploadSuccess("photo"),
                            onFileTransferFail,
                            options,
                            true);
                    }
                    function onFileUploadSuccess(fieldName) {
                        //alert("sss")
                    }
                    function onFileTransferFail(error) {
                        alert("Error loading the image");
                    }
                    document.getElementById('sectionStatusEditDiv').innerHTML = "";
                    $("input:checkbox").prop("checked", false);
                    app.mobileApp.hideLoading();
                    app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
                }

                //document.getElementById('sectionStatusEditDiv').innerHTML = "";
                //$("input:checkbox").prop("checked", false);
                //app.mobileApp.hideLoading();
                //app.mobileApp.navigate('#components/controlPoint/controlPointView.html');
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
                  $('#popEndCheck').data('kendoMobileModalView').scroller.reset()
                //if (app.hightGuard.homeModel.get("currentCheck").cb_isPublish == 1) {//מבדק סגור

                //}
            },
            closePopEndCheck: function () {
                $("#popEndCheck").kendoMobileModalView("close");
            },
            //סיום מבדק
            endCheck: function () {
          
                var flag=false;
                var obj=homeModel.get("checkItem");
                console.log(obj.builtUpArea);
                if(!obj.builtUpArea||obj.builtUpArea=="null"||obj.builtUpArea==""){
                   $('#mustField1').css("border-color", "red");
                   flag=true;
                }
                else
                  $('#mustField1').css("border-color", "rgba(128, 128, 128, 0.5)");
                

                if(document.getElementById("singnCheck1").style.color!="red"){
                   $('#mustField2').css("border-color", "red");
                   flag=true;
                }
                else
                   $('#mustField2').css("border-color", "rgba(128, 128, 128, 0.5)");

                //מטיסי רחפן
                var multiselect = $("#inputFly").data("kendoMultiSelect");
                var inputFly = multiselect.value();
                if (inputFly != null) {
                    inputFly = inputFly.toString()
                    if (inputFly==""){
                       $('#mustField3').css("border-color", "red");
                       flag=true;
                    }
                    else{
                      $('#mustField3').css("border-color", "rgba(128, 128, 128, 0.5)");
                    }
                }
                else{
                    $('#mustField3').css("border-color", "red");
                    flag=true;
                }

                if(flag==false){
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

                dataSource.fetch(function () {
                    var view = dataSource.view();
                    console.log(view);
                    //var obj = {
                    //    "DroneURL": document.getElementById("DroneURL").value,//רחפן
                    //    "TourParticipants": document.getElementById("TourParticipants").value,//משתתפים בסיור
                    //    "AdditionalComments": document.getElementById("AdditionalComments").value,//הערות נוספות
                    //    "Latitude": pos.lat,
                    //    "Longitude": pos.lng

                    //}

                    if (document.getElementById("publicBuildings").checked == false) {
                        homeModel.checkItem.set("publicBuildingsDetails", "");
                    }

                    homeModel.checkItem.set("publicBuildings", document.getElementById("publicBuildings").checked);//קיימים מבנים ציבוריים
                    homeModel.checkItem.set("cb_Share", document.getElementById("publishToContact").checked);//הפצה לאנשי קשר לפי מחוז
                    homeModel.checkItem.set("DroneCalibration", document.getElementById("DroneCalibration").checked);//בוצע כיול לרחפן
                    homeModel.checkItem.set("cb_isPublish", true);//סיום מבדק
                    //מטיסי רחפן
                    var multiselect = $("#inputFly").data("kendoMultiSelect");
                    var inputFly = multiselect.value();
                    if (inputFly != null) {
                        inputFly = inputFly.toString()
                        if (homeModel.get("dataFly") != inputFly)
                            homeModel.checkItem.set("R414108735", inputFly);//מטיסי רחפן
                    }
                    //רחפנים
                    var multiselect = $("#inputToolFly").data("kendoMultiSelect");
                    var inputToolFly = multiselect.value();
                    if (inputToolFly != null) {
                        inputToolFly = inputToolFly.toString()
                        if (homeModel.get("dataToolFly") != inputToolFly)
                            homeModel.checkItem.set("R414166903", inputToolFly);//רחפנים
                    }



                    var obj = homeModel.get("checkItem")
                    try {
                        var jsdo = dataSource.transport.jsdo;
                        var jsrow = jsdo.findById(view[0].id);
                        var afterUpdateFn;
                        jsrow.assign(obj);
                        afterUpdateFn = function (jsdo, record, success, request) {
                            jsdo.unsubscribe('afterUpdate', afterUpdateFn);
                            if (success === true) {
                                //var image = document.getElementById('imageSignCheck');
                                //document.getElementById('singnCheck1').style.color = "red";

                                var siteSignageURL1 = homeModel.get("siteSignageURL1");
                                var FillingStructuresURL1 = homeModel.get("FillingStructuresURL1");
                                var signatureURL1 = homeModel.get("signatureURL1");

                                var siteSignage1 = document.getElementById("pictureSiteSignage").src;
                                var FillingStructures1 = document.getElementById("pictureFillingStructures").src;
                                var signature1 = document.getElementById("imageSignCheck").src;

                                var siteSignageClr = document.getElementById("siteSignage").style.color;
                                var FillingStructuresClr = document.getElementById("FillingStructures").style.color;
                                var signatureClr = document.getElementById("singnCheck1").style.color;

                                var flagSiteSignage = false;
                                var flagFillingStructures = false;
                                var flagSignature = false;

                                if (siteSignageClr == "green" && siteSignageURL1 != siteSignage1)
                                    flagSiteSignage = true;

                                if (FillingStructuresClr == "green" && FillingStructuresURL1 != FillingStructures1)
                                    flagFillingStructures = true;

                                if (signatureClr == "red" && signatureURL1 != signature1)
                                    flagSignature = true;

                                if (flagSiteSignage == true || flagFillingStructures == true || flagSignature == true)
                                    uploadPictureToServer(flagSiteSignage, flagFillingStructures, flagSignature, view[0]);
                                else {
                                    app.mobileApp.hideLoading();
                                    app.mobileApp.navigate('#components/hightGuard/view.html');
                                }
                                //if (document.getElementById("siteSignage").style.color == "green" || document.getElementById("FillingStructures").style.color == "green" || document.getElementById('singnCheck1').style.color == "red") {
                                //    uploadPictureToServer(view[0]);
                                //}


                            }
                            else {
                                alert("שגיאה");
                            }
                        };
                        jsdo.subscribe('afterUpdate', afterUpdateFn);
                        jsdo.saveChanges();


                        function uploadPictureToServer(flagSiteSignage, flagFillingStructures, flagSignature, cur) {
                            var mone1 = 0;
                            var mone2 = 0;
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
                            var imageObj1, imageObj2, imageObj3;
                            var fileURI1, fileURI2, fileURI3;
                            var urlRB1, urlRB2, urlRB3;

                            if (flagSiteSignage == true) {
                                mone1++;
                                imageObj1 = $.parseJSON(cur.siteSignage);
                                fileURI1 = document.getElementById('pictureSiteSignage').src;
                                urlRB1 = jsdo.url + imageObj1.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
                                options.fileName = "photo1.jpeg";
                                ft.upload(
                                    fileURI1,
                                    encodeURI(urlRB1),
                                    onFileUploadSuccess("photo1"),
                                    onFileTransferFail,
                                    options,
                                    true);
                            }
                            if (flagFillingStructures == true) {
                                mone1++;
                                imageObj2 = $.parseJSON(cur.FillingStructures);
                                fileURI2 = document.getElementById('pictureFillingStructures').src;
                                urlRB2 = jsdo.url + imageObj2.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
                                options.fileName = "photo2.jpeg";
                                ft.upload(
                                    fileURI2,
                                    encodeURI(urlRB2),
                                    onFileUploadSuccess("photo2"),
                                    onFileTransferFail,
                                    options,
                                    true);
                            }
                            if (flagSignature == true) {
                                mone1++;
                                imageObj3 = $.parseJSON(cur.signature);
                                fileURI3 = document.getElementById('imageSignCheck').src;
                                urlRB3 = jsdo.url + imageObj3.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
                                options.fileName = "photo3.jpeg";
                                ft.upload(
                                    fileURI3,
                                    encodeURI(urlRB3),
                                    onFileUploadSuccess("photo3"),
                                    onFileTransferFail,
                                    options,
                                    true);
                            }

                            function onFileUploadSuccess(fieldName) {
                                mone2++;
                                if (mone1 == mone2) {
                                    setTimeout(function () {
                                        app.mobileApp.hideLoading();
                                        app.mobileApp.navigate('#components/hightGuard/view.html');
                                    }, 100);
                                }
                            }
                            function onFileTransferFail(error) {
                                alert("Error loading the image");
                            }

                        }

                    } catch (e) {
                        alert("התגלתה בעיה בטעינת הנתונים, אנא נסה שוב  מאוחר יותר")
                    }
                });
                }
                
            },
            saveCheck: function () {
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

                dataSource.fetch(function () {
                    var view = dataSource.view();
                    console.log(view);
                    //var obj = {
                    //    "DroneURL": document.getElementById("DroneURL").value,//רחפן
                    //    "TourParticipants": document.getElementById("TourParticipants").value,//משתתפים בסיור
                    //    "AdditionalComments": document.getElementById("AdditionalComments").value,//הערות נוספות
                    //    "Latitude": pos.lat,
                    //    "Longitude": pos.lng

                    //}

                    if (document.getElementById("publicBuildings").checked == false) {
                        homeModel.checkItem.set("publicBuildingsDetails", "");
                    }

                    homeModel.checkItem.set("publicBuildings", document.getElementById("publicBuildings").checked);//קיימים מבנים ציבוריים
                    //   homeModel.checkItem.set("cb_Share", document.getElementById("publishToContact").checked);//הפצה לאנשי קשר לפי מחוז
                    homeModel.checkItem.set("DroneCalibration", document.getElementById("DroneCalibration").checked);//בוצע כיול לרחפן

                    //מטיסי רחפן
                    var multiselect = $("#inputFly").data("kendoMultiSelect");
                    var inputFly = multiselect.value();
                    if (inputFly != null) {
                        inputFly = inputFly.toString()
                        if (homeModel.get("dataFly") != inputFly)
                            homeModel.checkItem.set("R414108735", inputFly);//מטיסי רחפן
                    }
                    //רחפנים
                    var multiselect = $("#inputToolFly").data("kendoMultiSelect");
                    var inputToolFly = multiselect.value();
                    if (inputToolFly != null) {
                        inputToolFly = inputToolFly.toString()
                        if (homeModel.get("dataToolFly") != inputToolFly)
                            homeModel.checkItem.set("R414166903", inputToolFly);//רחפנים
                    }

                    var obj = homeModel.get("checkItem")
                    try {
                        var jsdo = dataSource.transport.jsdo;
                        var jsrow = jsdo.findById(view[0].id);
                        var afterUpdateFn;
                        jsrow.assign(obj);
                        afterUpdateFn = function (jsdo, record, success, request) {
                            jsdo.unsubscribe('afterUpdate', afterUpdateFn);
                            if (success === true) {
                                //var image = document.getElementById('imageSignCheck');
                                //document.getElementById('singnCheck1').style.color = "red";
                                var siteSignageURL1 = homeModel.get("siteSignageURL1");
                                var FillingStructuresURL1 = homeModel.get("FillingStructuresURL1");
                                var signatureURL1 = homeModel.get("signatureURL1");

                                var siteSignage1 = document.getElementById("pictureSiteSignage").src;
                                var FillingStructures1 = document.getElementById("pictureFillingStructures").src;
                                var signature1 = document.getElementById("imageSignCheck").src;

                                var siteSignageClr = document.getElementById("siteSignage").style.color;
                                var FillingStructuresClr = document.getElementById("FillingStructures").style.color;
                                var signatureClr = document.getElementById("singnCheck1").style.color;

                                var flagSiteSignage = false;
                                var flagFillingStructures = false;
                                var flagSignature = false;

                                if (siteSignageClr == "green" && siteSignageURL1 != siteSignage1)
                                    flagSiteSignage = true;

                                if (FillingStructuresClr == "green" && FillingStructuresURL1 != FillingStructures1)
                                    flagFillingStructures = true;

                                if (signatureClr == "red" && signatureURL1 != signature1)
                                    flagSignature = true;

                                if (flagSiteSignage == true || flagFillingStructures == true || flagSignature == true)
                                    uploadPictureToServerS(flagSiteSignage, flagFillingStructures, flagSignature, view[0]);
                                else {
                                    app.mobileApp.hideLoading();
                                    app.mobileApp.navigate('#components/hightGuard/view.html');
                                }
                                //if (document.getElementById("siteSignage").style.color == "green" || document.getElementById("FillingStructures").style.color == "green" || document.getElementById('singnCheck1').style.color == "red") {
                                //    uploadPictureToServer(view[0]);
                                //}


                            }
                            else {
                                alert("שגיאה");
                            }
                        };
                        jsdo.subscribe('afterUpdate', afterUpdateFn);
                        jsdo.saveChanges();


                        function uploadPictureToServerS(flagSiteSignage, flagFillingStructures, flagSignature, cur) {
                            var mone1 = 0;
                            var mone2 = 0;
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
                            var imageObj1, imageObj2, imageObj3;
                            var fileURI1, fileURI2, fileURI3;
                            var urlRB1, urlRB2, urlRB3;
                            if (flagSiteSignage == true) {
                                mone1++;
                                imageObj1 = $.parseJSON(cur.siteSignage);
                                fileURI1 = document.getElementById('pictureSiteSignage').src;
                                urlRB1 = jsdo.url + imageObj1.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
                                options.fileName = "photo1.jpeg";
                                ft.upload(
                                    fileURI1,
                                    encodeURI(urlRB1),
                                    onFileUploadSuccess("photo1"),
                                    onFileTransferFail,
                                    options,
                                    true);
                            }
                            if (flagFillingStructures == true) {
                                mone1++;
                                imageObj2 = $.parseJSON(cur.FillingStructures);
                                fileURI2 = document.getElementById('pictureFillingStructures').src;
                                urlRB2 = jsdo.url + imageObj2.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
                                options.fileName = "photo2.jpeg";
                                ft.upload(
                                    fileURI2,
                                    encodeURI(urlRB2),
                                    onFileUploadSuccess("photo2"),
                                    onFileTransferFail,
                                    options,
                                    true);
                            }
                            if (flagSignature == true) {
                                mone1++;
                                imageObj3 = $.parseJSON(cur.signature);
                                fileURI3 = document.getElementById('imageSignCheck').src;
                                urlRB3 = jsdo.url + imageObj3.src + "?objName=" + app.controlPoint.homeModel._jsdoOptions.name;
                                options.fileName = "photo3.jpeg";
                                ft.upload(
                                    fileURI3,
                                    encodeURI(urlRB3),
                                    onFileUploadSuccess("photo3"),
                                    onFileTransferFail,
                                    options,
                                    true);
                            }

                            function onFileUploadSuccess(fieldName) {
                                mone2++;
                                if (mone1 == mone2) {
                                    setTimeout(function () {
                                        app.mobileApp.hideLoading();
                                        app.mobileApp.navigate('#components/hightGuard/view.html');
                                    }, 100);

                                }

                                //alert("sss");
                            }
                            function onFileTransferFail(error) {
                                alert("Error loading the image");
                            }

                        }

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

            //הערות 
            openPopAdditionalComments: function (id) {
                //arrSeifComments.push({ "id": viewSeif[i - 10].id, "name": viewSeif[i - 10].SectionContent, "Comments": "", "Comments2": "" })
                var arr = homeModel.get("arrSeifComments");
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].id == id) {
                        AdditionalCommentsSub.innerHTML = "הערות " + arr[i].name;
                        homeModel.set("lastIdIndex", i);
                        document.getElementById("AdditionalCommentsTxt").value = arr[i].Comments;
                        //רשימה
                        var getAll_R414357253 = "https://www.rollbase.com/rest/jsdo/getRelationships?output=json&id=" + arr[i].id + "&startRow=&rowsPerPage=&relName=R414357253&fieldList=id,NoteContent"
                        $.get(getAll_R414357253, function (data, status) {
                            var listComments = [];
                            $.each(data.genericData, function (key, value) {
                                listComments.push(value);
                            });
                            var multiselect = $("#inputListComments").data("kendoMultiSelect");
                            var dataSource = new kendo.data.DataSource({
                                data: listComments,
                                sort: { field: "NoteContent", dir: "asc" }
                            });
                            dataSource.sort({ field: "NoteContent", dir: "asc" });
                            multiselect.setDataSource(dataSource);
                            multiselect.value([]);
                            $("#popAdditionalComments").kendoMobileModalView("open");
                        });
                       
                        //multiselect.setDataSource(dataSource);
                      

                    }

                }

             
            },
            closePopAdditionalComments: function () {
                var i = homeModel.get("lastIdIndex");
                var arr = homeModel.get("arrSeifComments");
                if (document.getElementById("AdditionalCommentsTxt").value != "" && document.getElementById("AdditionalCommentsTxt").value != "null")
                    document.getElementById("comments" + arr[i].id).style.color = "red";
                else
                    document.getElementById("comments" + arr[i].id).style.color = "#7B7878";

             
                var txt = document.getElementById("AdditionalCommentsTxt").value;
               
                var list = $("#inputListComments").data("kendoMultiSelect").dataItems();
                if (list.length > 0) {
                    document.getElementById("comments" + arr[i].id).style.color = "red";
                }
                for (var j = 0; j < list.length; j++) {
                    if (txt != "")
                        txt += " , "
                    txt += list[j].NoteContent;
                }
                arr[i].Comments = txt;
                homeModel.set("arrSeifComments", arr)
                $("#popAdditionalComments").kendoMobileModalView("close");
            },

            openPopAdditionalCommentsD: function (id) {
                //arrSeifComments.push({ "id": viewSeif[i - 10].id, "name": viewSeif[i - 10].SectionContent, "Comments": "", "Comments2": "" })
                var arr = homeModel.get("arrSeifComments");
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].id == id) {
                        AdditionalCommentsSubD.innerHTML = "הערות " + arr[i].name;
                        homeModel.set("lastIdIndex", i);
                        document.getElementById("AdditionalCommentsTxtD").value = arr[i].Comments;
                        //רשימה
                        if (app.controlPoint.get("flagIsEdit") == true) {
                            var getAll_R414357253 = "https://www.rollbase.com/rest/jsdo/getRelationships?output=json&id=" + arr[i].id + "&startRow=&rowsPerPage=&relName=R414357253&fieldList=id,NoteContent"
                            $.get(getAll_R414357253, function (data, status) {
                                var listComments = [];
                                $.each(data.genericData, function (key, value) {
                                    listComments.push(value);
                                });
                                var multiselect = $("#inputListCommentsEdit").data("kendoMultiSelect");
                                var dataSource = new kendo.data.DataSource({
                                    data: listComments,
                                    sort: { field: "NoteContent", dir: "asc" }
                                });
                                dataSource.sort({ field: "NoteContent", dir: "asc" });
                                multiselect.setDataSource(dataSource);
                                multiselect.value([]);
                                $("#popAdditionalCommentsD").kendoMobileModalView("open");

                            });
                        }
                        else {
                            
                            $("#popAdditionalCommentsD").kendoMobileModalView("open");
                        }
                            

                    }

                }


            },
            closePopAdditionalCommentsD: function () {
                if (app.controlPoint.get("flagIsEdit") == true) {
                    var i = homeModel.get("lastIdIndex");
                    var arr = homeModel.get("arrSeifComments");
                    if (document.getElementById("AdditionalCommentsTxtD").value != "" && document.getElementById("AdditionalCommentsTxtD").value != "null")
                        document.getElementById("commentsD" + arr[i].id).style.color = "red";
                    else
                        document.getElementById("commentsD" + arr[i].id).style.color = "#7B7878";

                    var txt = document.getElementById("AdditionalCommentsTxtD").value;
                    var list = $("#inputListCommentsEdit").data("kendoMultiSelect").dataItems();
                    if (list.length > 0) {
                        document.getElementById("commentsD" + arr[i].id).style.color = "red";
                    }
                    for (var j = 0; j < list.length; j++) {
                        if (txt != "")
                            txt += " , "
                        txt += list[j].NoteContent;
                    }
                    arr[i].Comments = txt;

                    homeModel.set("arrSeifCommentsD", arr)
                }
                $("#popAdditionalCommentsD").kendoMobileModalView("close");
            },



            itemClickSectionNote: function (div) {
                var arr = homeModel.get("arrDescription");
                var x = div.innerText;
                var flag = false;
                var index = 0;
                var clr = document.getElementById(div.id).style.backgroundColor;
                if (clr == "rgb(166, 175, 179)") {//בוחר
                    document.getElementById(div.id).style.backgroundColor = "rgb(17,74,96)";
                    arr.push(x)
                }
                else {//לא בוחר
                    document.getElementById(div.id).style.backgroundColor = "rgb(166, 175, 179)";
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] == x) {
                            flag = true;
                        }
                    }
                    if (flag == true)
                        arr[index] = "";
                }
                homeModel.set("arrDescription", arr);
                textFromList.innerHTML = "";
                for (var i = 0; i < arr.length; i++)
                    if (arr[i] != "")
                        textFromList.innerHTML += arr[i] + "<br>"

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


            //תמונות סגירת מבדק
            ifOpenPictureFromF: function () {
                var check1 = app.controlPoint.homeModel.get("cameraIdF");
                if (document.getElementById(check1).style.color == "green") {
                    if (check1 == "siteSignage")
                        $("#popImageSiteSignage").kendoMobileModalView("open");
                    else
                        $("#popImageFillingStructures").kendoMobileModalView("open");
                    $("#picturedropList1Pop").kendoMobileModalView("close");
                }
                else {
                    if (app.hightGuard.homeModel.get("currentCheck").cb_isPublish != 1) {//מבדק סגור
                        $("#picturedropList1Pop").kendoMobileModalView("open");

                    }

                }
            },
            takePhotoF: function (e) {
                var check1 = app.controlPoint.homeModel.get("cameraIdF");
                if (cordova.platformId == "ios") {
                    navigator.camera.getPicture(onSuccessUploadPhotoF, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.DATA_URL,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
                else {
                    navigator.camera.getPicture(onSuccessUploadPhotoF, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.FILE_URI,
                            EncodingType: Camera.EncodingType.PNG,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
            },
            getPhotoLibraryF: function (e) {
                var check1 = app.controlPoint.homeModel.get("cameraIdF");
                if (cordova.platformId == "ios") {
                    navigator.camera.getPicture(onSuccessUploadPhotoF, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.DATA_URL,
                            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
                else {
                    navigator.camera.getPicture(onSuccessUploadPhotoF, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
            },
            //תמונות סעיפים
            takePhotoS: function (e) {
                if (cordova.platformId == "ios") {
                    navigator.camera.getPicture(onSuccessUploadPhotoS, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.DATA_URL,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
                else {
                    navigator.camera.getPicture(onSuccessUploadPhotoS, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.FILE_URI,
                            EncodingType: Camera.EncodingType.PNG,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
            },
            getPhotoLibraryS: function (e) {
                if (cordova.platformId == "ios") {
                    navigator.camera.getPicture(onSuccessUploadPhotoS, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.DATA_URL,
                            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
                else {
                    navigator.camera.getPicture(onSuccessUploadPhotoS, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
            },
            takePhotoSD: function (e) {
                if (cordova.platformId == "ios") {
                    navigator.camera.getPicture(onSuccessUploadPhotoSD, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.DATA_URL,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
                else {
                    navigator.camera.getPicture(onSuccessUploadPhotoSD, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.FILE_URI,
                            EncodingType: Camera.EncodingType.PNG,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
            },
            getPhotoLibrarySD: function (e) {
                if (cordova.platformId == "ios") {
                    navigator.camera.getPicture(onSuccessUploadPhotoSD, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.DATA_URL,
                            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
                else {
                    navigator.camera.getPicture(onSuccessUploadPhotoSD, function (message) {
                        alert("Failed to get a picture. Please select one.");
                    }, {
                            quality: 30,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                            targetWidth: 1600,
                            targetHeight: 1600,
                            correctOrientation: true,
                        });
                }
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

    //תמונות סיום מבדק
    function onSuccessUploadPhotoF(imageData) {
        $("#picturedropList1Pop").kendoMobileModalView("close");
        var cameraId = app.controlPoint.homeModel.get("cameraIdF");
        var image;
        if (cameraId == "siteSignage") {
            image = document.getElementById('pictureSiteSignage');
            if (cordova.platformId == "ios") {
                image.src = "data:image/jpeg;base64," + imageData;
            } else {
                image.src = imageData;
            }
            document.getElementById('gibuyImage1').src = document.getElementById('pictureSiteSignage').src;
            app.controlPoint.homeModel.set("cameraIdSrcCP", document.getElementById("gibuyImage1").src);
            app.controlPoint.homeModel.set("cameraIdSrcCPgibuy", document.getElementById("gibuyImage1").src);
            app.controlPoint.homeModel.set("cameraIdCPImage", "pictureSiteSignage");
        }
        if (cameraId == "FillingStructures") {
            image = document.getElementById('pictureFillingStructures');
            if (cordova.platformId == "ios") {
                image.src = "data:image/jpeg;base64," + imageData;
            } else {
                image.src = imageData;
            }
            document.getElementById('gibuyImage2').src = document.getElementById('pictureFillingStructures').src;
            app.controlPoint.homeModel.set("cameraIdSrcCP", document.getElementById("gibuyImage2").src);
            app.controlPoint.homeModel.set("cameraIdSrcCPgibuy", document.getElementById("gibuyImage2").src);
            app.controlPoint.homeModel.set("cameraIdCPImage", "pictureFillingStructures");
        }
        document.getElementById(cameraId).style.color = "green";
        getSketchCP();
    }
    //תמונות סעיפים
    function onSuccessUploadPhotoS(imageData) {
        $("#picturedropListSeif").kendoMobileModalView("close");
        var cameraId = app.controlPoint.homeModel.get("cameraIdSeif");
        var image = document.getElementById('pictureSeif');
        if (cordova.platformId == "ios") {
            image.src = "data:image/jpeg;base64," + imageData;
            app.controlPoint.homeModel.set("cameraIdSeifSrc", document.getElementById("pictureSeif").src);
            app.controlPoint.homeModel.set("cameraIdSeifSrcGibuy", document.getElementById("pictureSeif").src);

        } else {
            image.src = imageData;
            app.controlPoint.homeModel.set("cameraIdSeifSrc", image.src);
            app.controlPoint.homeModel.set("cameraIdSeifSrcGibuy", image.src);

        }

        var realId = "";
        for (var i = 5; i < cameraId.length; i++) {
            realId += cameraId[i];
        }
        var arr = homeModel.get("arrSeifImage");
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].id == realId) {
                arr[i].src = document.getElementById("pictureSeif").src;
                arr[i].src2 = document.getElementById("pictureSeif").src;
            }

        }

        homeModel.set("arrSeifImage", arr);
        // console.log(homeModel.get("arrSeifImage"))
        document.getElementById(cameraId).style.color = "red";
        app.controlPoint.homeModel.set("cameraIdSeifSrc", document.getElementById("pictureSeif").src);
        getSketchSeif();


    }
    function onSuccessUploadPhotoSD(imageData) {
        $("#picturedropListSeifD").kendoMobileModalView("close");
        var cameraId = app.controlPoint.homeModel.get("cameraIdSeif");
        var image = document.getElementById('pictureSeifD');
        if (cordova.platformId == "ios") {
            image.src = "data:image/jpeg;base64," + imageData;
            app.controlPoint.homeModel.set("cameraIdSeifSrc", document.getElementById("pictureSeifD").src);
            app.controlPoint.homeModel.set("cameraIdSeifSrcGibuy", document.getElementById("pictureSeifD").src);
        } else {
            image.src = imageData;
            app.controlPoint.homeModel.set("cameraIdSeifSrc", image.src);
            app.controlPoint.homeModel.set("cameraIdSeifSrcGibuy", image.src);
        }

        var realId = "";
        for (var i = 5; i < cameraId.length; i++) {
            realId += cameraId[i];
        }
        var arr = homeModel.get("arrSeifImage");
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].id == realId) {
                arr[i].src = document.getElementById("pictureSeifD").src;
                arr[i].src2 = document.getElementById("pictureSeifD").src;
            }
        }

        homeModel.set("arrSeifImage", arr);
        //  console.log(homeModel.get("arrSeifImage"))
        document.getElementById(cameraId).style.color = "red";
        app.controlPoint.homeModel.set("cameraIdSeifSrc", document.getElementById("pictureSeifD").src);
        getSketchSeif();
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
                homeModel.saveSeif();
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
                homeModel.saveEditSeif();
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

    //till camera

    parent.set('homeModel', homeModel);
    //כניסה ראשונית
    parent.set('onShowInit', function (e) {
        //  try {

        app.mobileApp.showLoading();

        dataProvider.loadCatalogs().then(function _catalogsLoaded() {
            var jsdoOptions = homeModel.get('_jsdoOptions'),
                jsdo = new progress.data.JSDO(jsdoOptions),
                dataSourceOptions = homeModel.get('_dataSourceOptions'),
                dataSource;
            dataSourceOptions.transport.jsdo = jsdo;
            dataSource = new kendo.data.DataSource(dataSourceOptions)
            homeModel.set("fetch", false)
            homeModel.set('dataSource', dataSource);
            if (homeModel.get("fetch") == false) {
                dataSource.fetch(function () { homeModel.set("fetch", true); });

            }

            app.mobileApp.hideLoading();

        });


        dataProvider.loadCatalogs().then(function _catalogsLoaded() {
            var jsdoOptions = homeModel.get('_jsdoOptionsbuildingsSite'),
                jsdo = new progress.data.JSDO(jsdoOptions),
                dataSourceOptions = homeModel.get('_dataSourceOptions'),
                dataSource;
            dataSourceOptions.transport.jsdo = jsdo;
            dataSource = new kendo.data.DataSource(dataSourceOptions)
            homeModel.set('executionStep', jsdo.getPicklist_executionStep().response.picklistData);
        });

        var checkInputs = function (elements) {
            elements.each(function () {
                var element = $(this);
                var input = element.children("input");
                input.prop("checked", element.hasClass("k-state-selected"));
            });
        };

        //רחפנים
        var jsdoOptions = homeModel.get('_jsdoOptionsdrones'),
            jsdo = new progress.data.JSDO(jsdoOptions),
            dataSourceOptions = homeModel.get('_dataSourceOptions'),
            dataSourceToolFly;
        dataSourceOptions.transport.jsdo = jsdo;
        dataSourceToolFly = new kendo.data.DataSource(dataSourceOptions)
        dataSourceToolFly.sort({ field: 'createdAt', dir: 'desc' });
        homeModel.set('dataSourceToolFly', dataSourceToolFly);
        $("#inputToolFly").kendoMultiSelect({
            tagTemplate: kendo.template($("#tagTemplateToolFly").html()),
            tagMode: "single",
            itemTemplate: '<table style=""><tr><td style="width:98%;padding:0.5em;">' +
            '<label style="float: right;text-align: right;font-size:small;font-family: Tahoma, Geneva, sans-serif;">מספר:#:data.SerialNum# דגם: #:data.DroneModel#</label>' +
            '</td></tr></table>',

            autoClose: false,
            dataTextField: "SerialNum",
            dataValueField: "id",
            dataSource: homeModel.dataSourceToolFly,
            dataBound: function () {
                var items = this.ul.find("li");
                setTimeout(function () {
                    checkInputs(items);
                });
            },
            change: function () {
                var items = this.ul.find("li");
                checkInputs(items);
            },
        });
        var multiselect = $("#inputToolFly").data("kendoMultiSelect");
        multiselect.input.attr("readonly", true)
            .on("keydown", function (e) {
                if (e.keyCode === 8) {
                    e.preventDefault();
                }
            });

        //מטיסים
        var jsdoOptions = homeModel.get('_jsdoOptionsDroneOperator'),
            jsdo = new progress.data.JSDO(jsdoOptions),
            dataSourceOptions = homeModel.get('_dataSourceOptions'),
            dataSourceFly;
        dataSourceOptions.transport.jsdo = jsdo;
        dataSourceFly = new kendo.data.DataSource(dataSourceOptions)
        dataSourceFly.sort({ field: 'createdAt', dir: 'desc' });
        homeModel.set('dataSourceFly', dataSourceFly)

        $("#inputFly").kendoMultiSelect({
            tagTemplate: kendo.template($("#tagTemplateFly").html()),
            tagMode: "single",
            itemTemplate: '<table style=""><tr><td style="width:98%;padding:0.5em;">' +
            '<label style="float: right;text-align: right;font-size:small;font-family: Tahoma, Geneva, sans-serif;">שם:#:data.OperatorName# תז: #:data.OperatorId#</label>' +
            '</td></tr></table>',
            autoClose: false,
            dataTextField: "OperatorName",
            dataValueField: "id",
            dataSource: homeModel.dataSourceFly,
            dataBound: function () {
                var items = this.ul.find("li");
                setTimeout(function () {
                    checkInputs(items);
                });
            },
            change: function () {
                var items = this.ul.find("li");
                checkInputs(items);
            },

        });
        var multiselect = $("#inputFly").data("kendoMultiSelect");
        multiselect.input.attr("readonly", true)
            .on("keydown", function (e) {
                if (e.keyCode === 8) {
                    e.preventDefault();
                }
            });

        //} catch (e) {
        //    alert("שגיאה")
        //}
    });
    //בכל כניסה
    parent.set('onShow', function (e) {
        //  try {

        var scroller = e.view.scroller;
        scroller.reset();
        app.mobileApp.showLoading();
        //דוח
        //document.getElementById("CheckupReport_URL").setAttribute("href", (app.hightGuard.homeModel.get("currentCheck")).CheckupReport_URL);
        homeModel.set("URL_report", (app.hightGuard.homeModel.get("currentCheck")).CheckupReport_URL)
        document.getElementById("CheckupScore").innerHTML = (app.hightGuard.homeModel.get("currentCheck")).CheckupScore;
        NameReviwerAndcreatedAt.innerHTML = (app.hightGuard.homeModel.get("currentCheck")).NameReviwer + " " + kendo.toString((app.hightGuard.homeModel.get("currentCheck")).createdAt, "dd/MM/yyyy HH:mm")
        document.getElementById('pictureSiteSignage').src = "";
        document.getElementById('gibuyImage1').src = "";

        document.getElementById('pictureFillingStructures').src = "";
        document.getElementById('gibuyImage2').src = "";

        document.getElementById("siteSignage").style.color = "transparent";
        document.getElementById("FillingStructures").style.color = "transparent";

        var image = document.getElementById('imageSignCheck');
        image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArIAAAEsCAYAAAA//VAuAAAACXBIWXMAAAsSAAALEgHS3X78AAAF0klEQVR4Xu3WMQ0AMAzAsPIn3ULYu0j2HQCZBQCAoHkFAADwIyMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIOkAMrh6a5dIy8oAAAAASUVORK5CYII=";
        document.getElementById('singnCheck1').style.color = "#7B7878";

        var itemModel = app.hightGuard.homeModel.get("currentCheck");

        homeModel.set("FillingStructuresURL1", "");
        homeModel.set("siteSignageURL1", "");
        document.getElementById("pictureFillingStructures").src = "";
        document.getElementById("pictureSiteSignage").src = "";

        $('#mustField1').css("border-color", "rgba(128, 128, 128, 0.5)");//שדות חובה
        $('#mustField2').css("border-color", "rgba(128, 128, 128, 0.5)");
        $('#mustField3').css("border-color", "rgba(128, 128, 128, 0.5)");
        
        //רחפנים
        var jsdoOptions = homeModel.get('_jsdoOptionsdrones'),
            jsdo = new progress.data.JSDO(jsdoOptions),
            dataSourceOptions = homeModel.get('_dataSourceOptions'),
            dataSourceToolFly;
        dataSourceOptions.transport.jsdo = jsdo;
        dataSourceToolFly = new kendo.data.DataSource(dataSourceOptions)
        dataSourceToolFly.sort({ field: 'createdAt', dir: 'desc' });
        homeModel.set('dataSourceToolFly', dataSourceToolFly)
        var multiselectToolFly = $("#inputToolFly").data("kendoMultiSelect");
        multiselectToolFly.setDataSource(dataSourceToolFly);
        multiselectToolFly.value([]);
        homeModel.set("dataToolFly", "");



        //מטיסים
        var jsdoOptions = homeModel.get('_jsdoOptionsDroneOperator'),
            jsdo = new progress.data.JSDO(jsdoOptions),
            dataSourceOptions = homeModel.get('_dataSourceOptions'),
            dataSourceFly;
        dataSourceOptions.transport.jsdo = jsdo;
        dataSourceFly = new kendo.data.DataSource(dataSourceOptions)
        dataSourceFly.sort({ field: 'createdAt', dir: 'desc' });
        homeModel.set('dataSourceFly', dataSourceFly)
        var multiselectFly = $("#inputFly").data("kendoMultiSelect");
        multiselectFly.setDataSource(dataSourceFly);
        multiselectFly.value([]);
        homeModel.set("dataFly", "");

        divToolFly.hidden = false;
        lableToolFly.hidden = true;

        divFly.hidden = false;
        lableFly.hidden = true;


        if (app.hightGuard.homeModel.get("itemIs") == true) {//מבדק קיים
            homeModel.set("checkItem", itemModel);
            // multiselectToolFly.enable(true);

            //רחפנים
            var rToolFly = itemModel.R414166903;
            lableToolFly.innerHTML = "";
            if (rToolFly != "null" && rToolFly != -1) {
                var getAll_R414166903 = "https://www.rollbase.com/rest/jsdo/getRelationships?output=json&id=" + homeModel.checkItem.id + "&startRow=&rowsPerPage=&relName=R414166903&fieldList=id,name,SerialNum,DroneModel"
                $.get(getAll_R414166903, function (data, status) {
                    var dataToolFly = [];
                    $.each(data.genericData, function (key, value) {
                        dataToolFly[key] = value.id;
                        lableToolFly.innerHTML += "מספר: " + value.SerialNum + "  " + "דגם: " + value.DroneModel + "<br>";
                    });
                    multiselectToolFly.value(dataToolFly);
                    multiselectToolFly.trigger("change");
                    homeModel.set("dataToolFly", dataToolFly.toString());

                });
            }

            //מטיסים
            var rFly = itemModel.R414108735;
            lableFly.innerHTML = "";
            if (rFly != "null" && rFly != -1) {
                var getAll_R414108735 = "https://www.rollbase.com/rest/jsdo/getRelationships?output=json&id=" + homeModel.checkItem.id + "&startRow=&rowsPerPage=&relName=R414108735&fieldList=id,name,OperatorName,OperatorId"
                $.get(getAll_R414108735, function (data, status) {
                    var dataFly = [];
                    $.each(data.genericData, function (key, value) {
                        dataFly[key] = value.id;
                        lableFly.innerHTML += "שם: " + value.OperatorName + "  " + "תז: " + value.OperatorId + "<br>";
                    });
                    multiselectFly.value(dataFly);
                    multiselectFly.trigger("change");
                    homeModel.set("dataFly", dataFly.toString());
                });
            }


            if (itemModel.publicBuildings == 1) {//פרוט בהתאם לצק בוקס
                document.getElementById("publicBuildingsT2").style.display = "";
                document.getElementById("publicBuildings").checked = true;
            }
            else {
                document.getElementById("publicBuildings").checked = false;
                document.getElementById("publicBuildingsT2").style.display = "none";
            }
            if (itemModel.cb_Share == 1) {//הפצה לאנשי קשר
                document.getElementById("publishToContact").checked = true;
            }
            else {
                document.getElementById("publishToContact").checked = false;
            }

            if (itemModel.DroneCalibration == 1) {//בוצע כיול לרחפן
                document.getElementById("DroneCalibration").checked = true;
            }
            else {
                document.getElementById("DroneCalibration").checked = false;
            }
            //תמונות
            if (itemModel.FillingStructuresURL != "null") {
                document.getElementById("pictureFillingStructures").src = itemModel.FillingStructuresURL;
                document.getElementById("FillingStructures").style.color = "green";
                homeModel.set("FillingStructuresURL1", itemModel.FillingStructuresURL)
            }
            else {
                document.getElementById("pictureFillingStructures").src = "";
                homeModel.set("FillingStructuresURL1", "")
            }

            if (itemModel.siteSignageURL != "null") {
                document.getElementById("pictureSiteSignage").src = itemModel.siteSignageURL;
                document.getElementById("siteSignage").style.color = "green";
                homeModel.set("siteSignageURL1", itemModel.siteSignageURL)

            }
            else {
                document.getElementById("pictureSiteSignage").src = "";
                homeModel.set("siteSignageURL1", "")
            }
            //חתימה
            if (itemModel.signatureURL != "null") {
                document.getElementById("imageSignCheck").src = itemModel.signatureURL;
                document.getElementById("singnCheck1").style.color = "red";
                homeModel.set("signatureURL1", itemModel.signatureURL)
            }
            else {
                document.getElementById("imageSignCheck").src = "";
                homeModel.set("signatureURL1", "")
            }

            if (itemModel.DroneURL == "null")
                homeModel.checkItem.set("DroneURL", "");
            if (itemModel.AdditionalComments == "null")
                homeModel.checkItem.set("AdditionalComments", "");
            if (itemModel.structureNum == "null")
                homeModel.checkItem.set("structureNum", "");
            if (itemModel.publicBuildingsDetails == "null")
                homeModel.checkItem.set("publicBuildingsDetails", "");
            //מבדק סגור
            if (itemModel.cb_isPublish == 1) {
                divToolFly.hidden = true;
                lableToolFly.hidden = false;
                divFly.hidden = true;
                lableFly.hidden = false;
                $("#popEndCheck :input").attr("disabled", true);
                $('[name=sketch]').css("display", "none");//אי יכולת קשקוש על תמונה
                //    CheckupReportDiv.hidden = false;//דוח וציון
                document.getElementById("CheckupReportDivGrade").style.display = "inline-block";//ציון

                openCheck.hidden = true;//footer 
                closeCheck.hidden = false;//footer 

                popEndCheckOpen.hidden = true;//footer popup
                popEndCheckClose.hidden = false;//footer popup
                $('[name=adduildAndTool]').css('display', 'none');
                // document.getElementById("adduildAndTool").style.display = "none";//adduildAndTool
                document.getElementById("changeImageF1").style.display = "none"; //החלף תמונה
                document.getElementById("changeImageF2").style.display = "none"; //החלף תמונה
                document.getElementById("changeSignCheck1").style.display = "none"; //החלף חתימה




            }
            else {//מבדק פתוח
                $("#popEndCheck :input").attr("disabled", false);
                $('[name=sketch]').css("display", "");//אי יכולת קשקוש על תמונה
                // CheckupReportDiv.hidden = true;//דוח וציון
                document.getElementById("CheckupReportDivGrade").style.display = "none";//ציון

                openCheck.hidden = false;//footer 
                closeCheck.hidden = true;//footer 

                popEndCheckOpen.hidden = false;//footer popup
                popEndCheckClose.hidden = true;//footer popup

                $('[name=adduildAndTool]').css('display', '');
                //   document.getElementById("adduildAndTool").style.display = "";//adduildAndTool

                document.getElementById("changeImageF1").style.display = ""; //החלף תמונה
                document.getElementById("changeImageF2").style.display = ""; //החלף תמונה
                document.getElementById("changeSignCheck1").style.display = ""; //החלף חתימה
            }

        }
        else {//מבדק חדש
            $("#popEndCheck :input").attr("disabled", false);
            $('[name=sketch]').css("display", "");//אי יכולת קשקוש על תמונה
            // CheckupReportDiv.hidden = true;//דוח וציון
            document.getElementById("CheckupReportDivGrade").style.display = "none";//ציון

            openCheck.hidden = false;//footer 
            closeCheck.hidden = true;//footer 

            popEndCheckOpen.hidden = false;//footer popup
            popEndCheckClose.hidden = true;//footer popup

            $('[name=adduildAndTool]').css('display', '');
            // document.getElementById("adduildAndTool").style.display = "";//adduildAndTool

            document.getElementById("changeImageF1").style.display = ""; //החלף תמונה
            document.getElementById("changeImageF2").style.display = ""; //החלף תמונה
            document.getElementById("changeSignCheck1").style.display = ""; //החלף חתימה
            var obj = {
                "DroneURL": "",
                "AdditionalComments": "",
                "TourParticipants": itemModel.TourParticipants,
                "publicBuildings": false,
                "structureNum": "",
                "publicBuildingsDetails": "",
            }
            homeModel.set("checkItem", obj)
            document.getElementById("publicBuildings").checked = false;
            document.getElementById("publishToContact").checked = false;
            document.getElementById("DroneCalibration").checked = false;

            //document.getElementById("publicBuildingsT1").style.display = "none";
            document.getElementById("publicBuildingsT2").style.display = "none";
            document.getElementById("siteSignage").style.color = "transparent";
            document.getElementById("FillingStructures").style.color = "transparent";
            homeModel.set("toolItem", {});
            homeModel.set("builtItem", {});
            document.getElementById("imageSignCheckTR").style.display = "";
        }


        //חיווי
        //נקודות בקרה
        var fetch2 = false;
        var dataSource = homeModel.get('dataSource');
        if (homeModel.get("fetch") == false) {
            dataSource.fetch(function () {
                homeModel.set("fetch", true);
                if (fetch2 == true)
                    showControlPoint();
            });

        }
        //נקודות בקרה לפי אתר
        var jsdoOptions = homeModel.get('_jsdoOptionsControlPointCheckup'),
            jsdo = new progress.data.JSDO(jsdoOptions),
            dataSourceOptions = homeModel.get('_dataSourceOptions'),
            dataSource2;
        dataSourceOptions.transport.jsdo = jsdo;
        dataSource2 = new kendo.data.DataSource(dataSourceOptions)
        var checkId = (app.hightGuard.homeModel.get("currentCheck")).id;
        dataSource2.filter({
            logic: "and",
            filters: [
                { field: "R370258935", operator: "eq", value: checkId },
            ]
        })
        var view;
        dataSource2.fetch(function () {
            view = dataSource2.view();
            fetch2 = true;
            if (homeModel.get("fetch") == true)
                showControlPoint();
        });
        function showControlPoint() {
            var cp = homeModel.get('dataSource').view();
            var cpc = view;
            var arr = [];
            var flag = false;
            var cpcObj = {};
            for (var i = 0; i < cp.length; i++) {
                flag = false;
                cpcObj = {}
                for (var j = 0; j < cpc.length; j++) {
                    if (cpc[j].R370259027 == cp[i].id) {
                        flag = true;
                        cpcObj = cpc[j]
                    }
                }
                if (flag == false)
                    var obj = { "id": cp[i].id, "name": cp[i].name, "ControlPointIcon_URL": cp[i].ControlPointIcon_URL, "uid": cp[i].uid, "check": false, "CPcheck": cpcObj }
                else
                    var obj = { "id": cp[i].id, "name": cp[i].name, "ControlPointIcon_URL": cp[i].ControlPointIcon_URL, "uid": cp[i].uid, "check": true, "CPcheck": cpcObj }

                arr.push(obj)

            }
            var dataSourceCP = new kendo.data.DataSource({
                data: arr,
            });
            //console.log(dataSourceCP)
            homeModel.set("dataSourceCP", dataSourceCP);
            app.mobileApp.hideLoading();
        }

        //console.log(homeModel.get("checkItem"))

        //} catch (e) {
        //    alert("שגיאה")
        //}
    });
    parent.set('onShowSectionInit', function (e) {


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
        //הערות
        //dataProvider.loadCatalogs().then(function _catalogsLoaded() {
        //    var jsdoOptions = homeModel.get('_jsdoOptionsSectionNote'),
        //        jsdo = new progress.data.JSDO(jsdoOptions),
        //        dataSourceOptions = homeModel.get('_dataSourceOptions'),
        //        dataSource;
        //    dataSourceOptions.transport.jsdo = jsdo;
        //    dataSource = new kendo.data.DataSource(dataSourceOptions)
        var dataSourceSectionNote = new kendo.data.DataSource({
            data: [],
        });
        homeModel.set('dataSourceSectionNote', dataSource);
            var checkInputs = function (elements) {
                elements.each(function () {
                    var element = $(this);
                    var input = element.children("input");
                    input.prop("checked", element.hasClass("k-state-selected"));
                });
            };
            
            $("#inputListComments").kendoMultiSelect({
                tagTemplate: kendo.template($("#tagTemplateListComments").html()),
                tagMode: "single",
                itemTemplate: '<table style=""><tr><td style="width:98%;padding:0.7em;">' +
                '<label style="float: right;text-align: right;font-size:small;font-family: Tahoma, Geneva, sans-serif;">:#:NoteContent#</label>' +
                '</td></tr></table>',

                autoClose: false,
                dataTextField: "NoteContent",
                dataValueField: "id",
                dataSource: homeModel.dataSourceSectionNote,
                dataBound: function () {
                    var items = this.ul.find("li");
                    setTimeout(function () {
                        checkInputs(items);
                    });
                },
                change: function () {
                    var items = this.ul.find("li");
                    checkInputs(items);
                },
            });
            var multiselect = $("#inputListComments").data("kendoMultiSelect");
            multiselect.input.attr("readonly", true)
                .on("keydown", function (e) {
                    if (e.keyCode === 8) {
                        e.preventDefault();
                    }
                });
            //dataSource.fetch(function () {
            //    var view = dataSource.view();

            //    for (var i = 0; i < view.length; i++) {
            //        var node = document.createElement('div');
            //        var string = "";
            //        string += '<div class="DescriptionGeneri" id="' + view[i].id+'">';
            //        string += '<label style="color: white;font-family:Tahoma, Geneva, sans-serif;font-weight: 400;font-size:medium;width:100%">';
            //        string += view[i].NoteContent;
            //        string += '</label></div>'
            //        node.innerHTML = string;
            //        document.getElementById('DescriptionGeneri').appendChild(node);
            //    }
         
              
            //});


        //});

    });
    parent.set('onShowSectionEditInit', function (e) {


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
        //הערות
        //dataProvider.loadCatalogs().then(function _catalogsLoaded() {
        //    var jsdoOptions = homeModel.get('_jsdoOptionsSectionNote'),
        //        jsdo = new progress.data.JSDO(jsdoOptions),
        //        dataSourceOptions = homeModel.get('_dataSourceOptions'),
        //        dataSource;
        //    dataSourceOptions.transport.jsdo = jsdo;
        //    dataSource = new kendo.data.DataSource(dataSourceOptions)
            var checkInputs = function (elements) {
                elements.each(function () {
                    var element = $(this);
                    var input = element.children("input");
                    input.prop("checked", element.hasClass("k-state-selected"));
                });
            };
        var dataSourceSectionNote = new kendo.data.DataSource({
            data: [],
            });
        homeModel.set('dataSourceSectionNote', dataSource);

            $("#inputListCommentsEdit").kendoMultiSelect({
                tagTemplate: kendo.template($("#tagTemplateListCommentsEdit").html()),
                tagMode: "single",
                itemTemplate: '<table style=""><tr><td style="width:98%;padding:0.7em;">' +
                '<label style="float: right;text-align: right;font-size:small;font-family: Tahoma, Geneva, sans-serif;">:#:NoteContent#</label>' +
                '</td></tr></table>',

                autoClose: false,
                dataTextField: "NoteContent",
                dataValueField: "id",
                dataSource: homeModel.dataSourceSectionNote,
                dataBound: function () {
                    var items = this.ul.find("li");
                    setTimeout(function () {
                        checkInputs(items);
                    });
                },
                change: function () {
                    var items = this.ul.find("li");
                    checkInputs(items);
                },
            });
            var multiselect = $("#inputListCommentsEdit").data("kendoMultiSelect");
            multiselect.input.attr("readonly", true)
                .on("keydown", function (e) {
                    if (e.keyCode === 8) {
                        e.preventDefault();
                    }
                });
            //dataSource.fetch(function () {
            //    var view = dataSource.view();

            //    for (var i = 0; i < view.length; i++) {
            //        var node = document.createElement('div');
            //        var string = "";
            //        string += '<div class="DescriptionGeneri" id="' + view[i].id+'">';
            //        string += '<label style="color: white;font-family:Tahoma, Geneva, sans-serif;font-weight: 400;font-size:medium;width:100%">';
            //        string += view[i].NoteContent;
            //        string += '</label></div>'
            //        node.innerHTML = string;
            //        document.getElementById('DescriptionGeneri').appendChild(node);
            //    }


            //});


     //   });

    });
    parent.set('onShowSection', function (e) {
        //try {
        //projectNameTestSection.innerHTML = (app.project.homeModel.get("dataItem")).LocationName;
        controlPointLabel.innerHTML = (app.controlPoint.homeModel.get("itemClickCp")).name;
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
                var arrObjectes = [];
                var arrSeifImage = [];
                var arrSeifComments = [];
                flag = true;
                for (var j = 0; j < viewMefga.length; j++) {

                    var node1 = document.createElement('div');
                    var string1 = "";
                    string1 += '<div style="background-color: #e9eaeb;height:8px;"></div>'
                    string1 += "<div style='width: 100 %;height: 36 %;box - shadow:0 4px 2px - 2px #c7c1c1; '>";
                    string1 += "<label  style='max-width: 80%;background-color:#1A607C;font-family: Tahoma, Geneva, sans-serif; color:white; font-size: small;font-weight: 200;text-align:right;padding-left: 6px;padding-top: 2px;padding-right: 12px;padding-bottom: 3px;float: right;'>" + viewMefga[j].HazhardName
                    string1 += "</label></div>"
                    node1.innerHTML = string1;
                    document.getElementById('sectionStatusDiv').appendChild(node1);
                    var arrSeif = [];
                    var index = 0;
                    for (var i = 10; i < viewSeif.length + 10; i++) {
                        if (viewSeif[i - 10].R408388358 == viewMefga[j].id) {
                            index++
                            var obj = { "id": viewSeif[i - 10].id, "value": "null", "image": "" }
                            arrSeif.push(obj);
                            var node = document.createElement('div');
                            var string = "";
                            if (index > 1)
                                string += '<div style="background-color: #fff;height:8px;border-top:1px dashed #e9eaeb"></div>'
                            string += '<center style="background-color:#ffffff"><table style="width:97%;background-color:#ffffff;margin-bottom:7px;" dir="rtl" >';
                            string += '<tr style= "width:100%" >';
                            string += '<td  style= "" >';
                            string += '<label id="' + viewSeif[i - 10].id + '" style="font-family:Tahoma, Geneva, sans-serif;font-weight: bold;font-size:small;color:black;"> ' + viewSeif[i - 10].SectionContent + '</label>';
                            string += '</td>';
                            string += '</tr>';
                            //string += '<tr style= "width:100%" >';
                            //string += '<td  style= "" >';
                            //string += ' <div style="background-color: #fff;height:5px;"></div>';
                            //string += '</td>';
                            //string += '</tr>';

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
                                var nameCode = -1;
                                for (var o = 0; o < homeModel.get('IntScore').length; o++) {
                                    if (arr[k] == homeModel.get('IntScore')[o].id) {
                                        nameTxt = homeModel.get('IntScore')[o].name;
                                        nameCode = homeModel.get('IntScore')[o].code;

                                    }
                                }
                                string += '<input  type= "checkbox" name="' + viewSeif[i - 10].id + '"  onclick="myChooseSectionStatusN(this,this.name,' + nameCode + ')"/>'
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
                            string += '<tr style= "width:100%" >';
                            string += '<td >';
                            string += '<label  style="font-family:Tahoma, Geneva, sans-serif;font-weight: 200;font-size:small;color:black;"> הוסף תמונה</label>';
                            string += '</td>';
                            string += '<td  style= "" >';
                            string += '<div><i class="fas fa-camera" style="margin-right: 80%;color:#7B7878;font-size:medium;" onclick="takeIdImageS(this.id)" id="image' + viewSeif[i - 10].id + '"></i></div>';
                            string += '</td>';
                            string += '</tr>';

                            string += '<tr style= "width:100%" >';
                            string += '<td >';
                            string += '<div style="background-color: #fff;height:8px;"></div>';
                            string += '</td>';
                            string += '<td  style= "" >';
                            string += '<div style="background-color: #fff;height:8px;"></div>';
                            string += '</td>';
                            string += '</tr>';

                            string += '<tr style= "width:100%" >';
                            string += '<td >';
                            string += '<label  style="font-family:Tahoma, Geneva, sans-serif;font-weight: 200;font-size:small;color:black;"> הערות נוספות</label>';
                            string += '</td>';
                            string += '<td  style= "" >';
                            string += '<div><i class="fas fa-pencil-alt" style="margin-right: 80%;color:#7B7878;font-size:medium;" onclick="openPopAdditionalComments(' + viewSeif[i - 10].id + ')" id="comments' + viewSeif[i - 10].id + '"></i></div>';
                            string += '</td>';
                            string += '</tr>';
                            arrSeifImage.push({ "id": viewSeif[i - 10].id, "src": "", "src2": "" })
                            arrSeifComments.push({ "id": viewSeif[i - 10].id, "name": viewSeif[i - 10].SectionContent, "Comments": "", "Comments2": "" })
                            //var obj = { sectionId: viewSeif[i - 10].id };
                            //homeModel.SectionStatusArr.push(obj)
                            string += '</table>';
                            string += ' </td > '
                            string += '</tr>';
                            string += '</table></center>';
                            node.innerHTML = string;
                            document.getElementById('sectionStatusDiv').appendChild(node);
                        }

                    }
                    var obj = { "id": viewMefga[j].id, "seif": arrSeif }
                    arrObjectes.push(obj)

                }
                homeModel.set("arrSeifImage", arrSeifImage);
                homeModel.set("arrSeifComments", arrSeifComments);
                homeModel.set("arrObjectes", arrObjectes)
                $("input:checkbox").attr("disabled", false);
                $("textarea").attr("disabled", false);
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
      //  homeModel.set("arrDescription",[])

     

        //} catch (e) {
        //    alert("שגיאה")
        //}
    });
    parent.set('onShowSectionEdit', function (e) {
        //try {
        //projectNameTestSectionEdit.innerHTML = (app.project.homeModel.get("dataItem")).LocationName;
        controlPointLabelEdit.innerHTML = (app.controlPoint.homeModel.get("itemClickCp")).name;
        var scroller = e.view.scroller;
        scroller.reset();

        app.mobileApp.showLoading();

        editSection1.hidden = false;
        saveSectionAssign1.hidden = true;
        document.getElementById("changeImageSeifD").style.display = "none";
        app.controlPoint.set("flagIsEdit", false);
        inputListCommentsEditDiv.hidden = true;
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
                var arrSeifImage = [];
                var arrSeifComments = [];
                flag = true;
                var arrObjectesSelect = homeModel.get("arrObjectesSelect")
                for (var j = 0; j < viewMefga.length; j++) {

                    var node1 = document.createElement('div');
                    var string1 = "";
                    string1 += '<div style="background-color: #e9eaeb;height:8px;"></div>';
                    string1 += "<div style='width: 100 %;height: 36 %;box - shadow:0 4px 2px - 2px #c7c1c1; '>";
                    string1 += "<label  style='max-width: 80%;background-color:#1A607C;font-family: Tahoma, Geneva, sans-serif; color:white; font-size: small;font-weight: 200;text-align:right;padding-left: 6px;padding-top: 2px;padding-right: 12px;padding-bottom: 3px;float: right;'>" + viewMefga[j].HazhardName
                    string1 += "</label></div>"
                    node1.innerHTML = string1;
                    document.getElementById('sectionStatusEditDiv').appendChild(node1);
                    var arrSeif = [];
                    var objM = { "id": viewMefga[j].id, "seif": arrSeif, "was": false, "mefgaID": "" }
                    for (var f = 0; f < arrObjectesSelect.length; f++) {
                        if (arrObjectesSelect[f].idMefga == viewMefga[j].id) {
                            objM.was = true;
                            objM.mefgaID = arrObjectesSelect[f].idMefgaID;
                        }
                    }
                    var index = 0;
                    for (var i = 10; i < viewSeif.length + 10; i++) {
                        if (viewSeif[i - 10].R408388358 == viewMefga[j].id) {
                            index++;
                            var obj = { "id": viewSeif[i - 10].id, "value": "null", "was": false, "seifID": "", "SectionImage1": "" }
                            //arrSeif.push(obj);
                            var node = document.createElement('div');
                            var string = "";
                            if (index > 1)
                                string += '<div style="background-color: #fff;height:8px;border-top:1px dashed #e9eaeb"></div>'
                            string += '<center style="background-color:#ffffff"><table style="width:97%;background-color:#ffffff;margin-bottom:7px;" dir="rtl" >';
                            string += '<tr style= "width:100%" >';
                            string += '<td  style= "" >';
                            string += '<label id="' + viewSeif[i - 10].id + '" style="font-family:Tahoma, Geneva, sans-serif;font-weight: bold;font-size:small;color:black;"> ' + viewSeif[i - 10].SectionContent + '</label>';
                            string += '</td>';
                            string += '</tr>';
                            //string += '<td  style= "" >';
                            //string += ' <div style="background-color: #fff;height:5px;"></div>';
                            //string += '</td>';
                            //string += '</tr>';

                            string += '<tr style= "width:100%" >';
                            string += '<td  style= "width:100%" >';
                            string += '<table style="width:100%" dir="rtl" >';
                            //console.log(viewSeif[0])
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
                                var nameCode = -1;
                                for (var o = 0; o < homeModel.get('IntScore').length; o++) {
                                    if (arr[k] == homeModel.get('IntScore')[o].id) {
                                        nameTxt = homeModel.get('IntScore')[o].name;
                                        nameCode = homeModel.get('IntScore')[o].code;

                                    }
                                }
                                var txtCheckbox = "";
                                // var obj = { "idMefga": view[i].R408159765, "idSeif": view1[j].R370259173, "id": view1[j].id, "val": view1[j].IntScore }
                                var urlImag = "";
                                var Remarks = "";
                                for (var f = 0; f < arrObjectesSelect.length; f++) {
                                    if (arrObjectesSelect[f].idMefga == viewMefga[j].id && arrObjectesSelect[f].idSeif == viewSeif[i - 10].id && nameCode == arrObjectesSelect[f].val) {

                                        txtCheckbox = '<input  type= "checkbox" checked name="' + viewSeif[i - 10].id + '"  onclick="myChooseSectionStatusND(this,this.name,' + nameCode + ')"/>'
                                        obj.value = arrObjectesSelect[f].val;
                                        obj.was = true;
                                        obj.seifID = arrObjectesSelect[f].id;
                                        obj.SectionImage1 = arrObjectesSelect[f].SectionImage1;
                                        //     obj.Remarks = arrObjectesSelect[f].Remarks;
                                    }
                                    //image
                                    if (arrObjectesSelect[f].idMefga == viewMefga[j].id && arrObjectesSelect[f].idSeif == viewSeif[i - 10].id) {
                                        urlImag = arrObjectesSelect[f].image;
                                        console.log(urlImag)
                                        Remarks = arrObjectesSelect[f].Remarks;
                                    }

                                }

                                if (txtCheckbox == "")
                                    txtCheckbox = '<input  type= "checkbox" name="' + viewSeif[i - 10].id + '"  onclick="myChooseSectionStatusND(this,this.name,' + nameCode + ')"/>'

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
                            string += '<tr style= "width:100%" >';
                            string += '<td >';
                            string += '<label  style="font-family:Tahoma, Geneva, sans-serif;font-weight: 200;font-size:small;color:black;"> הוסף תמונה</label>';
                            string += '</td>';

                            string += '<td  style= "" >';
                            if (urlImag != "")
                                string += '<div><i class="fas fa-camera" style="margin-right: 80%;color:red;font-size:medium;" onclick="takeIdImageSD(this.id)" id="image' + viewSeif[i - 10].id + '"></i></div>';
                            else
                                string += '<div><i class="fas fa-camera" style="margin-right: 80%;color:#7B7878;font-size:medium;" onclick="takeIdImageSD(this.id)" id="image' + viewSeif[i - 10].id + '"></i></div>';
                            string += '</td>';
                            string += '</tr>';
                            arrSeifImage.push({ "id": viewSeif[i - 10].id, "src": urlImag, "srcTemp": urlImag, "src2": urlImag })

                            string += '<tr style= "width:100%" >';
                            string += '<td >';
                            string += '<div style="background-color: #fff;height:8px;"></div>';
                            string += '</td>';
                            string += '<td  style= "" >';
                            string += '<div style="background-color: #fff;height:8px;"></div>';
                            string += '</td>';
                            string += '</tr>';

                            string += '<tr style= "width:100%" >';
                            string += '<td >';
                            string += '<label  style="font-family:Tahoma, Geneva, sans-serif;font-weight: 200;font-size:small;color:black;"> הערות נוספות</label>';
                            string += '</td>';
                            string += '<td  style= "" >';
                            if (Remarks != "null" && Remarks != "")
                                string += '<div><i class="fas fa-pencil-alt" style="margin-right: 80%;color:red;font-size:medium;" onclick="openPopAdditionalCommentsD(' + viewSeif[i - 10].id + ')" id="commentsD' + viewSeif[i - 10].id + '"></i></div>';
                            else {
                                string += '<div><i class="fas fa-pencil-alt" style="margin-right: 80%;color:#7B7878;font-size:medium;" onclick="openPopAdditionalCommentsD(' + viewSeif[i - 10].id + ')" id="commentsD' + viewSeif[i - 10].id + '"></i></div>';
                                Remarks = "";
                            }
                            arrSeifComments.push({ "id": viewSeif[i - 10].id, "name": viewSeif[i - 10].SectionContent, "Comments": Remarks, "Comments2": Remarks })
                            //obj.Remarks = viewSeif[i - 10].Remarks;
                            //obj.RemarksT = viewSeif[i - 10].Remarks;
                            //string += '<div><i class="fas fa-pencil-alt" style="margin-right: 80%;color:#7B7878;font-size:medium;" onclick="openPopAdditionalComments(' + viewSeif[i - 10].id + ')" id="commentsD' + viewSeif[i - 10].id + '"></i></div>';
                            string += '</td>';
                            string += '</tr>';

                            //var obj = { sectionId: viewSeif[i - 10].id };
                            //homeModel.SectionStatusArr.push(obj)
                            string += '</table>';
                            string += ' </td > '
                            string += '</tr>';
                            string += '</table></center>';
                            node.innerHTML = string;
                            document.getElementById('sectionStatusEditDiv').appendChild(node);

                            arrSeif.push(obj);
                        }

                    }

                    //var objM = { "id": viewMefga[j].id, "seif": arrSeif,"was":false }
                    objM.seif = arrSeif
                    arrObjectes.push(objM)

                }
                homeModel.set("arrSeifComments", arrSeifComments)
                homeModel.set("arrSeifImage", arrSeifImage)
                homeModel.set("arrObjectes", arrObjectes)
                oneCheckedEdit();
                $("input:checkbox").attr("disabled", true);
                $("#descriptionEdit").attr("disabled", true);
                imageEdit1.hidden = true;
                imageEdit2.hidden = true;
                $("textarea").attr("disabled", true);
                app.mobileApp.hideLoading();
            
            }
            function getList(IntScore) {
                var res = [];
                if (IntScore != "null" && IntScore != -1)

                    res = IntScore.split(",");
                return res;

            }
        });

        $('[name=sketch]').css("display", "none");

        if (app.hightGuard.homeModel.get("currentCheck").cb_isPublish == 1) { //מבדק סגור

            editSection1.hidden = true;
        }
        else {
            editSection1.hidden = false;
        }

    });

})(app.controlPoint);
function getSketchSeif() {
    var image = app.controlPoint.homeModel.get("cameraIdSeifSrc");
    var image2 = app.controlPoint.homeModel.get("cameraIdSeifSrc");
    if (cordova.platformId == "ios") {
        navigator.sketch.getSketch(onSuccessSeif, onFailSeif, {
            destinationType: navigator.sketch.DestinationType.DATA_URL,
            encodingType: navigator.sketch.EncodingType.JPEG,
            inputType: navigator.sketch.InputType.DATA_URL,
            inputData: image.src
        });
    }
    else {
        image = image.toString();

        navigator.sketch.getSketch(onSuccessSeif, onFailSeif, {
            destinationType: navigator.sketch.DestinationType.DATA_URL,
            encodingType: navigator.sketch.EncodingType.PNG,
            inputType: navigator.sketch.InputType.FILE_URI,
            inputData: image
        });
    }
}
function onSuccessSeif(imageData) {
    if (imageData == null) { return; }
    var image = app.controlPoint.homeModel.get("cameraIdSeifSrc");

    if (imageData.indexOf("data:image") >= 0) {
        image = imageData;
    } else {
        image = "data:image/png;base64," + imageData;
    }
    app.controlPoint.homeModel.set("cameraIdSeifSrc", image);
    if (app.controlPoint.homeModel.get("cameraIdSeifSrc") == "data:image/png;base64,") {
        app.controlPoint.homeModel.set("cameraIdSeifSrc", app.controlPoint.homeModel.get("cameraIdSeifSrcGibuy"));
    }
    else {
        app.controlPoint.homeModel.set("cameraIdSeifSrcGibuy", app.controlPoint.homeModel.get("cameraIdSeifSrc"));
    }
    var cameraId = app.controlPoint.homeModel.get("cameraIdSeif");
    var realId = "";
    for (var i = 5; i < cameraId.length; i++) {
        realId += cameraId[i];
    }
    var arr = app.controlPoint.homeModel.get("arrSeifImage");
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == realId)
            arr[i].src = app.controlPoint.homeModel.get("cameraIdSeifSrc");
    }
    app.controlPoint.homeModel.set("arrSeifImage", arr);
}
function onFailSeif(message) {
    alert("לא ניתן לסמן על תמונה זו")
    console.log('plugin message: ' + message);
}

function getSketchCP() {
    var image = app.controlPoint.homeModel.get("cameraIdSrcCP");
    if (cordova.platformId == "ios") {
        navigator.sketch.getSketch(onSuccessCP, onFailCP, {
            destinationType: navigator.sketch.DestinationType.DATA_URL,
            encodingType: navigator.sketch.EncodingType.JPEG,
            inputType: navigator.sketch.InputType.DATA_URL,
            inputData: image.src
        });
    }
    else {
        image = image.toString();
        navigator.sketch.getSketch(onSuccessCP, onFailCP, {
            destinationType: navigator.sketch.DestinationType.DATA_URL,
            encodingType: navigator.sketch.EncodingType.PNG,
            inputType: navigator.sketch.InputType.FILE_URI,
            inputData: image
        });
    }
}
function onSuccessCP(imageData) {
    if (imageData == null) { return; }
    var image = app.controlPoint.homeModel.get("cameraIdSrcCP");

    if (imageData.indexOf("data:image") >= 0) {
        image = imageData;
    }
    else {
        image = "data:image/png;base64," + imageData;
    }
    app.controlPoint.homeModel.set("cameraIdSrcCP", image);
    if (app.controlPoint.homeModel.get("cameraIdSrcCP") == "data:image/png;base64,") {
        app.controlPoint.homeModel.set("cameraIdSrcCP", app.controlPoint.homeModel.get("cameraIdSrcCPgibuy"));
    }
    else {
        app.controlPoint.homeModel.set("cameraIdSrcCPgibuy", app.controlPoint.homeModel.get("cameraIdSrcCP"));
    }

    document.getElementById(app.controlPoint.homeModel.get("cameraIdCPImage")).src = image;

}
function onFailCP(message) {
    alert("לא ניתן לסמן על תמונה זו")
    console.log('plugin message: ' + message);
}

function getSketchSignature() {
    var image = document.getElementById('imageSignCheck');
    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArIAAAEsCAYAAAA//VAuAAAACXBIWXMAAAsSAAALEgHS3X78AAAF0klEQVR4Xu3WMQ0AMAzAsPIn3ULYu0j2HQCZBQCAoHkFAADwIyMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIMnIAgCQZGQBAEgysgAAJBlZAACSjCwAAElGFgCAJCMLAECSkQUAIOkAMrh6a5dIy8oAAAAASUVORK5CYII=";

    navigator.sketch.getSketch(onSuccessSignature, onFailSignature, {
        destinationType: navigator.sketch.DestinationType.DATA_URL,
        encodingType: navigator.sketch.EncodingType.PNG,
        inputType: navigator.sketch.InputType.DATA_URL,
        inputData: image.src
    });
}
function onSuccessSignature(imageData) {
    if (imageData == null) { return; }
    var image = document.getElementById('imageSignCheck');
    if (imageData.indexOf("data:image") >= 0) {
        image.src = imageData;
    } else {
        image.src = "data:image/png;base64," + imageData;
    }
    document.getElementById('singnCheck1').style.color = "red";


}
function onFailSignature(message) {
    document.getElementById('singnCheck1').style.color = "#7B7878";
    console.log('plugin message: ' + message);
}
