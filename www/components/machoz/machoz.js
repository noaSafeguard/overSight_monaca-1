
'use strict';

app.machoz = kendo.observable({
    onShow: function () { },
    afterShow: function () { }
});

(function (parent) {
    var dataProvider = app.data.progressDataProvider,
        fetchFilteredData = function (paramFilter, searchFilter) {
            var model = parent.get('homeModel'),
                dataSource;

            if (model) {
                dataSource = model.get('dataSource');
            } else {
                parent.set('homeModel_delayedFetch', paramFilter || null);
                return;
            }

            if (paramFilter) {
                model.set('paramFilter', paramFilter);
            } else {
                model.set('paramFilter', undefined);
            }

            if (paramFilter && searchFilter) {
                dataSource.filter({
                    logic: 'and',
                    filters: [paramFilter, searchFilter]
                });
            } else if (paramFilter || searchFilter) {
                dataSource.filter(paramFilter || searchFilter);
            } else {
                dataSource.filter({});
            }
        },

        jsdoOptions = {
            name: 'OurUserLocation',
            autoFill: false
        },

        dataSourceOptions = {
            type: 'jsdo',
            transport: {},
            error: function (e) {
                app.mobileApp.pane.loader.hide();
                if (e.xhr) {
                    var errorText = "";
                    try {
                        errorText = JSON.stringify(e.xhr);
                    } catch (jsonErr) {
                        errorText = e.xhr.responseText || e.xhr.statusText || 'An error has occurred!';
                    }
                    alert(errorText);
                } else if (e.errorThrown) {
                    alert(e.errorThrown);
                }
            },
            schema: {
                model: {
                    fields: {
                        'LocationName': {
                            field: 'LocationName',
                            defaultValue: ''
                        },
                    }
                }
            },
            serverFiltering: true,
            serverSorting: true,
            sort: {
                field: 'locationId',
                dir: 'asc'
            },
        },
        homeModel = kendo.observable({
            _dataSourceOptions: dataSourceOptions,
            _jsdoOptions: jsdoOptions,
            dataItem: {},
            isActiveShow: "isHome",
            //searchChange: function (e) {
            //    var searchVal = e.target.value,
            //        searchFilter;

            //    if (searchVal) {
            //        searchFilter = {
            //            field: 'LoginName',
            //            operator: 'contains',
            //            value: searchVal
            //        };
            //    }
            //    fetchFilteredData(projectModel.get('paramFilter'), searchFilter);
            //},
            fixHierarchicalData: function (data) {
                var result = {},
                    layout = {};

                $.extend(true, result, data);

                (function removeNulls(obj) {
                    var i, name,
                        names = Object.getOwnPropertyNames(obj);

                    for (i = 0; i < names.length; i++) {
                        name = names[i];

                        if (obj[name] === null) {
                            delete obj[name];
                        } else if ($.type(obj[name]) === 'object') {
                            removeNulls(obj[name]);
                        }
                    }
                })(result);

                (function fix(source, layout) {
                    var i, j, name, srcObj, ltObj, type,
                        names = Object.getOwnPropertyNames(layout);

                    if ($.type(source) !== 'object') {
                        return;
                    }

                    for (i = 0; i < names.length; i++) {
                        name = names[i];
                        srcObj = source[name];
                        ltObj = layout[name];
                        type = $.type(srcObj);

                        if (type === 'undefined' || type === 'null') {
                            source[name] = ltObj;
                        } else {
                            if (srcObj.length > 0) {
                                for (j = 0; j < srcObj.length; j++) {
                                    fix(srcObj[j], ltObj[0]);
                                }
                            } else {
                                fix(srcObj, ltObj);
                            }
                        }
                    }
                })(result, layout);

                return result;
            },
            logoutClick: function () {
                app.mobileApp.navigate('#components/authenticationView/view.html?logout=true');
            },
            itemClick: function (e) {
                var dataItem = e.dataItem || homeModel.originalItem;
                homeModel.set('dataItem', dataItem)
           
                setTimeout(function () {
                    app.mobileApp.navigate('#components/project/view.html');
                }, 300);

            },
            detailsShow: function (e) {
                var uid = e.view.params.uid,
                    dataSource = homeModel.get('dataSource'),
                    itemModel = dataSource.getByUid(uid);

                homeModel.setCurrentItemByUid(uid);

            },
            setCurrentItemByUid: function (uid) {
                var item = uid,
                    dataSource = homeModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);

                if (!itemModel.LocationName) {
                    itemModel.LocationName = String.fromCharCode(160);
                }


                homeModel.set('originalItem', itemModel);
                homeModel.set('currentItem',
                    homeModel.fixHierarchicalData(itemModel));

                return itemModel;
            },
            linkBind: function (linkString) {
                var linkChunks = linkString.split('|');
                if (linkChunks[0].length === 0) {
                    return this.get('currentItem.' + linkChunks[1]);
                }
                return linkChunks[0] + this.get('currentItem.' + linkChunks[1]);
            },
            currentItem: {}
        });

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('homeModel', homeModel);
            var param = parent.get('homeModel_delayedFetch');
            if (typeof param !== 'undefined') {
                parent.set('homeModel_delayedFetch', undefined);
                fetchFilteredData(param);
            }
        });
    } else {
        parent.set('homeModel', homeModel);
    }

    parent.set('onShow', function (e) {
        app.mobileApp.showLoading();
        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null,
            isListmenu = false,
            backbutton = e.view.element && e.view.element.find('header [data-role="navbar"] .backButtonWrapper'),
            dataSourceOptions = homeModel.get('_dataSourceOptions'),
            dataSource;

        if (param || isListmenu) {
            backbutton.show();
            backbutton.css('visibility', 'visible');
        } else {
            if (e.view.element.find('header [data-role="navbar"] [data-role="button"]').length) {
                backbutton.hide();
            } else {
                backbutton.css('visibility', 'hidden');
            }
        }

        dataProvider.loadCatalogs().then(function _catalogsLoaded() {
            var jsdoOptions = homeModel.get('_jsdoOptions'),
                jsdo = new progress.data.JSDO(jsdoOptions);

            dataSourceOptions.transport.jsdo = jsdo;
            dataSource = new kendo.data.DataSource(dataSourceOptions);
            homeModel.set('dataSource', dataSource);
            var login = localStorage.getItem("email");
            //dataSource.filter({ field: "LoginName", operator: "eq", value: login });
            dataSource.filter({
                logic: "and",
                filters: [
                    { field: "LoginName", operator: "eq", value: login },
                    { field: "ParentID", operator: "eq", value: -1 }
                ]
            });
            //dataSource.fetch(function () {
            //    console.log(dataSource.view());
            //});


            //var searchVal = login,
            //    searchFilter;

            //if (searchVal) {
            //    searchFilter = {
            //        field: "LoginName",
            //        operator: "eq",
            //        searchVal
            //    };
            //}

            //fetchFilteredData(projectModel.get('paramFilter'), searchFilter);
            homeModel.set('dataSource', dataSource);
            app.mobileApp.hideLoading();
        });
    });

})(app.machoz);

