window.logout = (function () {

    //var declaration
    var parentClosure;

    //var init
    parentClosure = {};

    //functions
    function handleHash(htmlInjector) {
window.sessionStorage.clear();
        $.ajax({
            url: '/logout',
            method: 'POST',
            success: getDataSH,
            error: function(){
                console.log(arguments);
                showError("Some erro occured");
            }
        });
    }

    function getDataSH(data) {
        if (data.success == true) {
window.location='';
        } else {
            showError(data.error)
        }
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