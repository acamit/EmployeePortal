window.profile = (function () {

    //var declaration
    var parentClosure;

    //var init
    parentClosure = {};

    //functions
    function handleHash(htmlInjector) {
        if (htmlInjector) {
            prepareHTML.htmlInjector = htmlInjector;
        }
        $.ajax({
            url: '/profile',
            method: 'GET',
            success: getDataSH,
            error: getDataErr
        });

        //  if (prepareHTML.templateFunction) {
        $.ajax({
            url: '/profile/template',
            method: 'GET',
            dataType: 'text',
            success: getTemplateSH,
            error: function (err) {
                console.log(err);
            }
        });
        // }
    }

    function getDataSH(data) {
        console.log(data);
        if (data.IsAuthenticated === false) {
            var html = 'Please <a href="#login">Login</a> to access profile';
            prepareHTML.htmlInjector(html, null);
        } else if (data.IsAuthorized === false) {
            var html = 'Please <a href="#logout">Logout</a> and Login with proper role to access profile';
            prepareHTML.htmlInjector(html, pageSetup);
        } else {
            //console.log(data);
            prepareHTML.data = JSON.parse(data);
            prepareHTML();
        }
    }

    function getDataErr(err) {
        err = JSON.stringify(err);
        console.log("err  " + err);
    }

    function getTemplateSH(templateText) {
        prepareHTML.templateFunction = Handlebars.compile(templateText);
        prepareHTML();
    }

    function prepareHTML() {
        if (prepareHTML.data && prepareHTML.templateFunction) {
            var html = prepareHTML.templateFunction(prepareHTML.data);
            prepareHTML.htmlInjector(html, pageSetup);
        }
    }

    function editProfile() {
        $('.toggledElement').toggleClass('hidden');
    }

    function saveProfileDetails() {
        var profileFirstName = parentClosure.$profileFirstName.val(),
            profileLastName = parentClosure.$profileLastName.val(),
            profileDepartmentSelect = parentClosure.$profileDepartmentSelect.val(),
            profileOldPassword = parentClosure.$profileOldPassword.val(),
            profileNewPassword = parentClosure.$profileNewPassword.val(),
            profileConfirmPassword = parentClosure.$profileConfirmPassword.val();

        if (profileOldPassword) {
            if (profileNewPassword != profileConfirmPassword) {
                showError("New password should be same as old password");
            }
        }
        $.ajax({
            url: '/profile',
            method: 'PUT',
            data: {
                profileFirstName: profileFirstName,
                profileLastName: profileLastName,
                profileDepartmentSelect: profileDepartmentSelect,
                profileOldPassword: profileOldPassword,
                profileNewPassword: profileNewPassword,
                profileConfirmPassword: profileConfirmPassword,
            },
            success: saveProfileDetailsSH,
            err: function () {
                showError("Error saving profile. Please try again later");
            }
        });

    }

    function saveProfileDetailsSH(data) {
        data = JSON.parse(data);
        if (data.success) {
            alert("Profile details updated");
            handleHash();
        } else {
            if (data.error) {
                showError(data.error.message);
            }
        }

    }

    function pageSetup() {
        parentClosure.$editBtn = $('#profileTemplate #editBtn');
        parentClosure.$saveBtn = $('#profileTemplate #saveBtn');

        parentClosure.$profileFirstName = $('#profileTemplate #profileFirstName');
        parentClosure.$profileLastName = $('#profileTemplate #profileLastName');
        parentClosure.$profileDepartmentSelect = $('#profileTemplate #profileDepartmentSelect');
        parentClosure.$profileOldPassword = $('#profileTemplate #profileOldPassword');
        parentClosure.$profileNewPassword = $('#profileTemplate #profileNewPassword');
        parentClosure.$profileConfirmPassword = $('#profileTemplate #profileConfirmPassword');
        //events

        parentClosure.$editBtn.on('click', editProfile);
        parentClosure.$saveBtn.on('click', saveProfileDetails);
    }

    function showError(msg) {
        $('#errorMsg').removeClass('hidden').html("Error :" + msg);
    }
    //init declaration
    function init() {

    }
    //init call


    //return
    return {
        init: init,
        handleHash: handleHash
    }
})();