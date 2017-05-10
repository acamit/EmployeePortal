window.employees = (function () {
    //var declare
    var parentClosure;

    //var init
    parentClosure = {};
    //function declaration
    function handleHash(htmlInjector) {
        if (htmlInjector) {
            prepareHTML.htmlInjector = htmlInjector;
        }
        $.ajax({
            url: '/employees',
            method: 'GET',
            success: getDataSH,
            error: getDataErr
        });

        //  if (prepareHTML.templateFunction) {
        $.ajax({
            url: '/employees/template',
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
        if (data.IsAuthenticated === false) {
            var html = 'Please <a href="#login">Login</a> to access employees';
            prepareHTML.htmlInjector(html, null);
        } else if (data.IsAuthorized === false) {
            var html = 'Please <a href="#logout">Logout</a> and Login with proper role to access employees';
            prepareHTML.htmlInjector(html, pageSetup);
        } else {
            //console.log(data);
            prepareHTML.data = JSON.parse(data);
            prepareHTML();
        }
    }

    function getDataErr(err) {
        console.log("err  " + JSON.stringify(err));
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

    function addEmployee() {
        parentClosure.$EditCreateModal.modal('show');
    }

    function editEmployeeDetails() {
        var $this = $(this);
        var empid = $this.closest('[data-info-empId]').attr('data-info-empId'),
            firstName = $this.closest('tr').find('td[data-info-firstName]').attr('data-info-firstName'),
            lastName = $this.closest('tr').find('td[data-info-lastName]').attr('data-info-lastName'),
            email = $this.closest('tr').find('td[data-info-email]').attr('data-info-email'),
            beginDate = $this.closest('tr').find('td[data-info-doj]').attr('data-info-doj'),
            deptId = $this.closest('tr').find('td[data-info-deptId]').attr('data-info-deptId');
        isAdmin = $this.closest('tr').find('td[data-info-isAdmin]').attr('data-info-isAdmin');
        terminationDate = $this.closest('tr').find('td[data-info-endDate]').attr('data-info-endDate');


        parentClosure.$modalPassword.hide();
        parentClosure.$modalPassword.siblings().hide();
        parentClosure.$EditCreateModal.attr('data-info-empId', empid);
        parentClosure.$modalFirstName.val(firstName);
        parentClosure.$modalLastName.val(lastName);
        parentClosure.$modalEmail.val(email);

        beginDate = new Date(beginDate);
        var month = parseInt(beginDate.getMonth()) + 1;
        if (month < 10) {
            month = '0' + month;
        }
        var year = beginDate.getFullYear();
        var date = beginDate.getDate();
        if (date < 10) {
            date = '0' + date;
        }

        parentClosure.$modalBeginDate.val('' + year + '-' + month + '-' + date);
        parentClosure.$modalEndDate.prop('disabled', false);
        if (terminationDate) {
            terminationDate = new Date(terminationDate);
            var month = parseInt(terminationDate.getMonth()) + 1;
            if (month < 10) {
                month = '0' + month;
            }
            var year = terminationDate.getFullYear();
            var date = terminationDate.getDate();
            if (date < 10) {
                date = '0' + date;
            }
            parentClosure.$modalEndDate.val('' + year + '-' + month + '-' + date);
        } else {
            parentClosure.$modalEndDate.val('');
        }
        parentClosure.$modalDepartment.val(deptId).change();
        if (isAdmin == "true") {
            parentClosure.$modalIsAdmin.prop('checked', true);
        } else {
            parentClosure.$modalIsAdmin.prop('checked', false);
        }
        parentClosure.$EditCreateModal.modal('show');
    }

    function saveEmployeeDetails() {
        var empid = parentClosure.$EditCreateModal.attr('data-info-empId'),
            firstName = parentClosure.$modalFirstName.val(),
            lastName = parentClosure.$modalLastName.val(),
            email = parentClosure.$modalEmail.val(),
            doj = parentClosure.$modalBeginDate.val(),
            terminationdate = parentClosure.$modalEndDate.val(),
            deptId = parentClosure.$modalDepartment.val(),
            isAdmin = parentClosure.$modalIsAdmin.prop('checked'),
            password = parentClosure.$modalPassword.val();

        var method = 'PUT',
            url = '/employees';
        if (empid == -1) {
            method = 'POST',
                url = '/employees/add'
        }

        $.ajax({
            url: url,
            method: method,
            data: {
                empid: empid,
                firstName: firstName,
                lastName: lastName,
                email: email,
                doj: doj,
                terminationdate: terminationdate,
                deptId: deptId,
                isAdmin: isAdmin,
                password: password,
            },
            success: saveEmployeeDetailsSH,
            error: function () {
                console.log(arguments);
                showError("Error saving");
            }
        });
        parentClosure.$EditCreateModal.modal('hide');
    }

    function saveEmployeeDetailsSH(data) {
        data = JSON.parse(data);
        if (data.success == true)
            alert("Employee Added");
        else {
            alert("Employee not Added");

        }
    }

    function searchEmployees() {
        var searchFirstName = parentClosure.$searchFirstName.val();
        var searchLastName = parentClosure.$searchLastName.val();
        var searchEmail = parentClosure.$searchEmail.val();
        var searchEndDate = parentClosure.$searchEndDate.val();
        var searchBeginDate = parentClosure.$searchBeginDate.val();
        var searchDepartment = parentClosure.$searchDepartment.val();

        $.ajax({
            url: '/employees',
            method: 'POST',
            data: {
                searchFirstName: searchFirstName,
                searchLastName: searchLastName,
                searchEmail: searchEmail,
                searchEndDate: searchEndDate,
                searchBeginDate: searchBeginDate,
                searchDepartment: searchDepartment
            },
            success: searchEmployeesSH,
            error: function () {
                showError("Not able to search");
                console.log('error searching' + arguments);
            }
        });
    }

    function searchEmployeesSH(data) {
        data = JSON.parse(data);
        var len = data.length;
        var IsAdmin = JSON.parse(window.sessionStorage.usr)['user']['IsAdmin'];
        if (!len) {

            var $tr = $('<tr />');
            var $td = $('<td />');
            var colspan = 5;
            if (IsAdmin) {
                colspan = 6;
            }
            $td.attr('colspan', colspan);
            $td.html("No matching records found");
            $tr.append($td);
            parentClosure.$resultsTable.find('thead').hide();
            parentClosure.$resultsTable.find('tbody').children().remove();
            parentClosure.$resultsTable.find('tbody').append($tr);
            //parentClosure.$resultsTable.append($tr);
            return;
        }
        parentClosure.$resultsTable.find('tbody').children().remove();
        parentClosure.$resultsTable.find('thead').show();

        for (var i = 0; i < len; i++) {
            var $tr = $('<tr />');
            $tr.attr('data-info-empId', data[i].empId);
            var $td1 = $('<td />');
            var $td2 = $('<td />');
            var $td3 = $('<td />');
            var $td4 = $('<td />');
            var $td5 = $('<td />');
            var $td6 = $('<td />');
            var $td7 = $('<td />');
            $td1.attr("data-info-firstName", data[i].firstName).html(data[i].firstName);
            $td2.attr("data-info-lastName", data[i].lastName).html(data[i].lastName);
            $td3.attr("data-info-email", data[i].email).html(data[i].email);
            $td4.attr("data-info-doj", data[i].doj).html(data[i].doj);
            $td5.attr("data-info-deptId", data[i].deptId).html(data[i].deptName);
            $td6.attr("data-info-endDate", data[i].endDate).attr('class', 'hidden');
            $td7.attr("data-info-isAdmin", data[i].isAdmin).attr('class', 'hidden');
            $tr.append($td1);
            $tr.append($td2);
            $tr.append($td3);
            $tr.append($td4);
            $tr.append($td5);
            if (IsAdmin) {
                var $td8 = $('<td />');
                $td8.html('<span action=edit>Edit</span>');
                $tr.append($td8);
            }
            $tr.append($td6);
            $tr.append($td7);

            parentClosure.$resultsTable.append($tr);
        }
    }



    function pageSetup() {
        //Search Elements
        parentClosure.$searchEmployeeTemplate = $("#searchEmployeeTemplate");
        parentClosure.$searchFirstName = $("#searchEmployeeTemplate #searchByDiv #searchFirstName");
        parentClosure.$searchLastName = $("#searchEmployeeTemplate #searchByDiv #searchLastName");
        parentClosure.$searchEmail = $("#searchEmployeeTemplate #searchByDiv #searchEmail");
        parentClosure.$searchEndDate = $("#searchEmployeeTemplate #searchByDiv #searchEndDate");
        parentClosure.$searchBeginDate = $("#searchEmployeeTemplate #searchByDiv #searchBeginDate");
        parentClosure.$searchDepartment = $("#searchEmployeeTemplate #searchByDiv #searchDepartment");
        parentClosure.$searchBtn = $("#searchEmployeeTemplate #searchByDiv #searchBtn");
        //result elements
        parentClosure.$resultsTable = $("#searchEmployeeTemplate #resultsDiv #resultsTable");
        //add button
        parentClosure.$addEmpBtn = $("#searchEmployeeTemplate #addEmpBtn");
        //modal elements
        parentClosure.$EditCreateModal = $("#searchEmployeeTemplate #EditCreateModal");
        parentClosure.$modalFirstName = $("#searchEmployeeTemplate #EditCreateModal #modalFirstName");
        parentClosure.$modalLastName = $("#searchEmployeeTemplate #EditCreateModal #modalLastName");
        parentClosure.$modalEmail = $("#searchEmployeeTemplate #EditCreateModal #modalEmail");
        parentClosure.$modalBeginDate = $("#searchEmployeeTemplate #EditCreateModal #modalBeginDate");
        parentClosure.$modalEndDate = $("#searchEmployeeTemplate #EditCreateModal #modalEndDate");
        parentClosure.$modalDepartment = $("#searchEmployeeTemplate #EditCreateModal #modalDepartment");
        parentClosure.$modalPassword = $("#searchEmployeeTemplate #EditCreateModal #modalPassword");
        parentClosure.$modalIsAdmin = $("#searchEmployeeTemplate #EditCreateModal #modalIsAdmin");
        parentClosure.$modalSaveBtn = $("#searchEmployeeTemplate #EditCreateModal #modalSaveBtn");

        //events
        (parentClosure.$addEmpBtn).on('click', addEmployee);
        parentClosure.$searchBtn.on('click', searchEmployees);
        parentClosure.$modalSaveBtn.on('click', saveEmployeeDetails);
        parentClosure.$resultsTable.on('click', 'span[action=edit]', editEmployeeDetails);

    }

    function showError(msg) {
        $('#errorMsg').removeClass('hidden').html("Error :" + msg);
    }
    //init definition
    function init() {

    }

    //init call

    //return val
    return {
        init: init,
        handleHash: handleHash
    }
})();