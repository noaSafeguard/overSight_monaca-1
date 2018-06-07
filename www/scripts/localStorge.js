document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    navigator.splashscreen.hide();
    localStorageApp = new localStorageApp();
    localStorageApp.run();
}

function localStorageApp() {
}

localStorageApp.prototype = {


    message: null,
    getRemoveVariableNameInput: null,

    run: function () {
        var that = this;
        message = document.getElementById("message");
        getRemoveVariableNameInput = document.getElementById("getRemoveVariableNameInput");
        document.getElementById("insertVariable").addEventListener("click", function () {
            that._insertVariable.apply(that, arguments);
            document.getElementById("insertVariable").style.display = "none";
            document.getElementById("searchVariable").style.display = "block";
        });
        document.getElementById("searchVariable").addEventListener("click", function () {
            that._getVariable.apply(that, arguments);
        });
        //document.getElementById("clearLocalStorage").addEventListener("click", function () {
        //    that._clearLocalStorage.apply(that, arguments);
        //});
        //document.getElementById("removeVariable").addEventListener("click", function () {
        //    that._removeVariable.apply(that, arguments);
        //});
    },


    _insertVariable: function () {
        localStorage.clear();
        var variableNameInput = document.getElementById("email"),
		valueInput = document.getElementById("password");
        localStorage.setItem(variableNameInput.value, valueInput.value);
        variableNameInput.value = "";
        valueInput.value = "";
    },

    _getVariable: function () {
        var i = 0;
        var itemKey = localStorage.key(i);
        var values = localStorage.getItem(itemKey);
        var email = $('#email');
        email.val(itemKey)
        var pass = $('#password');
        pass.val(values)
    },

    _removeVariable: function () {
        if (localStorage.getItem(getRemoveVariableNameInput.value) != undefined) {
            localStorage.removeItem(getRemoveVariableNameInput.value);
            message.textContent = "Record deleted!";
        }
        else {
            message.textContent = "No such record found.";
        }
    },

    _clearLocalStorage: function () {
        localStorage.clear();
        message.textContent = "Storage is cleared!";
    }
}