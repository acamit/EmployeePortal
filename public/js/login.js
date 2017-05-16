window.login = (function () {
    //var declare
    var parentClosure;

    //var init
    parentClosure = {};

    //functions
    function handleHash(htmlInjector) {

        if (htmlInjector) {
            prepareHTML.htmlInjector = htmlInjector;
        }
        $.ajax({
            url: '/login/template',
            method: 'GET',
            dataType: 'text',
            success: getTemplateSH,
            error: function () {
                console.log(arguments);
            }
        });
    }

    function getTemplateSH(data) {
        var templateFunction = Handlebars.compile(data);
        prepareHTML.templateFunction = templateFunction;
        prepareHTML();
    }

    function prepareHTML() {
        if (prepareHTML.templateFunction) {
            var html = prepareHTML.templateFunction({});

            if (prepareHTML.htmlInjector) {
                prepareHTML.htmlInjector(html, pageSetup);
            }
        }
    }

    function pageSetup() {
        parentClosure.$divLoginTemplate = $('#divLoginTemplate');
        parentClosure.$divLogin = $('#divLoginTemplate #divLogin');
        parentClosure.$txtUserId = $('#divLoginTemplate #txtUserId');
        parentClosure.$txtPassword = $('#divLoginTemplate #txtPassword');
        parentClosure.$btnLogin = $('#divLoginTemplate #btnLogin');
        parentClosure.$errorBox = $('#divLoginTemplate #errorBox');
        parentClosure.$btnLogin.on('click', login);
    }

    function login() {
        var userid, password;
        parentClosure.$errorBox.addClass('hidden');
        userid = parentClosure.$txtUserId.val();
        password = parentClosure.$txtPassword.val();

        console.log(userid);
        console.log(password);
      /*  if (!(userid && password)) {
            showError("Please fill in both user id and password");
            return;
        }
        if (!validEmail(userid)) {
            showError("please enter a valid email id");
            return;
        }
*/
        $.ajax({
            url: '/login',
            method: 'POST',
            dataType: 'JSON',
            success: loginSH,
            data: {
                userId: userid,
                password: password
            },
            error: function () {
                console.log(arguments);
            }
        });
    }

    function loginSH(data) {
        console.log(data);
         window.userObj.IsAdmin = data.IsAdmin;
        // console.log("login data" + window.userObj.IsAdmin);
        if (data.IsAuthenticated) {
            window.sessionStorage.usr = JSON.stringify(data);
            window.location = '';
        } else {
            showError(data.error);
        }
    }

    //init definition
    function init() {

    }

    function prepareHTML() {
        prepareHTML.htmlInjector(prepareHTML.templateFunction({}), pageSetup);
    }

    function showError(msg) {
        $('#errorMsg').removeClass('hidden').html("Error :" + msg.toString());
    }

    function validEmail(text) {
        var input = document.createElement('input');
        input.type = 'email';
        input.value = text;
        if (input.checkValidity()) {
            return true;
        }
        return false;
    }
    //init call

    //return 

    return {
        init: init,
        handleHash: handleHash
    }
})();