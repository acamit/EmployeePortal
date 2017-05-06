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
            url: '/login-template',
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
        window.userObj.IsAdmin = data.IsAdmin;
        if (data.IsAuthenticated) {
            // $liLogin = $("#liLogin"),
            //     $liUser = $('#liUser');
            // $liLogin.addClass('hidden');
            // $liUser.removeClass('hidden');
            window.location = '';
        } else {
            parentClosure.$errorBox.removeClass('hidden');
            parentClosure.$errorBox.append('Invalid username/password combination');
        }
    }

    //init definition
    function init() {

    }

    function prepareHTML() {
        prepareHTML.htmlInjector(prepareHTML.templateFunction({}), pageSetup);
    }

    //init call

    //return 

    return {
        init: init,
        handleHash: handleHash
    }
})();