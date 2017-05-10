window.issues = (function () {
    //var

    var parentClosure;
    // var initialization
    parentClosure = {};
    //function definition
    function handleHash(htmlInjector) {
        if (htmlInjector) {
            prepareHTML.htmlInjector = htmlInjector;
        }
        $.ajax({
            url: '/issues',
            method: 'GET',
            success: getDataSH,
            error: getDataErr
        });

        //  if (prepareHTML.templateFunction) {
        $.ajax({
            url: '/issues-template',
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
            var html = 'Please <a href="#login">Login</a> to access issues';
            prepareHTML.htmlInjector(html, null);
        } else if (data.IsAuthorized === false) {
            var html = 'Please <a href="#logout">Logout</a> and Login with proper role to access issues';
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

    function createIssue() {
        parentClosure.$modaltxtIssueTitle.val('');
        parentClosure.$modaltxtDescription.val('');
        parentClosure.$modalDropdownPriority.val('');

        parentClosure.$issueEditModal.attr('data-info-id', -1);
        parentClosure.$issueEditModal.modal('show');

    }

    function editIssue() {
        var IsAdmin = JSON.parse(window.sessionStorage.usr)['user']['IsAdmin'];
        $this = $(this);
        if (IsAdmin) {
            editIssueDetailsAdmin($this);
        } else {
            editIssueDetailsNonAdmin($this);
        }

    }

    function editIssueDetailsNonAdmin($this) {
        var issueId = $this.closest('[data-info-id]').data('info-id'),
            issueTitle = $this.closest('tr').find('td[data-info-title]').attr('data-info-title'),
            issuePriority = $this.closest('tr').find('td[data-info-priority]').attr('data-info-priority'),
            desc = $this.closest('tr').find('td[data-info-desc]').attr('data-info-desc');
        parentClosure.$issueEditModal.attr('data-info-id', issueId);
        parentClosure.$modaltxtIssueTitle.val(issueTitle);
        parentClosure.$modaltxtDescription.val(desc);
        parentClosure.$modalDropdownPriority.val(issuePriority).change();
        parentClosure.$issueEditModal.modal('show');
    }

    function editIssueDetailsAdmin($this) {

        $.ajax({
            url: '/users/admins/',
            method: 'GET',
            data: {},
            success: function (data) {
                editIssueDetailsAdminSH(data, $this);
            },
            error: function (err) {
                console.log(err);
            }
        });
    }

    function editIssueDetailsAdminSH(data, $this) {
        data = JSON.parse(data);
        parentClosure.$modalAssignedTo.children().remove().end();
        for (var i = 0; i < data.adminUsers.length; i++) {
            $opt = $('<option />');
            $opt.attr('value', data.adminUsers[i].empId);
            $opt.html(data.adminUsers[i].firstName + ' ' + data.adminUsers[i].lastName);
            parentClosure.$modalAssignedTo.append($opt);
        }
        var issueId = $this.closest('[data-info-id]').attr('data-info-id'),
            assignedTo = $this.closest('tr').find('td[data-info-assignedTo]').attr('data-info-assignedTo'),
            status = $this.closest('tr').find('td[data-info-status]').attr('data-info-status');
        parentClosure.$issueEditModal.attr('data-info-id', issueId);
        parentClosure.$modalAssignedTo.val(assignedTo).change();
        parentClosure.$modalstatus.val(status).change();
        parentClosure.$issueEditModal.modal('show');
    }

    function saveIssueDetails() {
        var IsAdmin = JSON.parse(window.sessionStorage.usr)['user']['IsAdmin'];
        if (IsAdmin) {
            saveIssueDetailsAdmin();
        } else {
            saveIssueDetailsNonAdmin();
        }
    }

    function saveIssueDetailsNonAdmin() {

        var issueId = parentClosure.$issueEditModal.attr('data-info-id'),
            title = parentClosure.$modaltxtIssueTitle.val(),
            desc = parentClosure.$modaltxtDescription.val(),
            priority = parentClosure.$modalDropdownPriority.val();
        issueId = parseInt(issueId, 10);
        var method = 'PUT';
        if (issueId == -1) {
            method = 'POST'
        }
        $.ajax({
            url: '/issues',
            method: method,
            data: {
                id: issueId,
                title: title,
                desc: desc,
                priority: priority
            },
            success: function (data) {
                saveIssueDetailsNonAdminSH(data, issueId);
            },
            error: function () {
                var html = " ";
                if (issueId == -1) {
                    html += "Couldnot raise the issue";
                } else {
                    html += "Couldnot edit the issue";
                }
                console.log(arguments);
                showError(html);
            }
        });
    }

    function saveIssueDetailsNonAdminSH(data, issueId) {
        if (data.success) {
            if (issueId == -1) {
                createNewIssueNonAdmin(data, issueId);
            } else {
                editExistingIssueNonAdmin(data, issueId);
            }
        } else {
            $('#errorMsg').removeClass('hidden').html("Error saving issue");
        }
        parentClosure.$issueEditModal.modal('hide');
    }

    function createNewIssueNonAdmin(data, issueId) {
        var tr = $('<tr />'),
            titleTd = $('<td />'),
            priorityTd = $('<td />'),
            statusTd = $('<td />'),
            assignedToTd = $('<td />'),
            descTd = $('<td />'),
            actionsTd = $('<td />');

        titleTd.attr('data-info-title', data.data.title).html(data.data.title);
        priorityTd.attr('data-info-priority', data.data.priority).html(data.data.priorityName);
        assignedToTd.attr('data-info-assignedTo', data.data.assignedTo).html(data.data.assignedToName);
        statusTd.attr('data-info-status', data.data.status).html(data.data.statusName);
        descTd.attr('data-info-desc', data.data.desc).addClass('hidden');
        actionsTd.html(' <span class="glyphicon glyphicon-pencil" data-action="edit" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" data-action="delete" aria-hidden="true"></span><span class="" data-action="details">Details</span>');
        tr.append(titleTd);
        tr.append(priorityTd);
        if (window.userObj.IsAdmin) {
            var postedByTd = $('<td />');
            postedByTd.attr('data-info-postedBy', data.data.postedBy).html(data.data.postedByName);
            tr.append(postedByTd);
        }
        tr.append(assignedToTd);
        tr.append(statusTd);
        tr.append(actionsTd);
        tr.append(descTd);
        tr.attr('data-info-id', data.data.id);
        var tbody = parentClosure.$tableIssues.find('tbody').append(tr);
    }

    function editExistingIssueNonAdmin(data, issueId) {
        var issueRow = parentClosure.$tableIssues.find('[data-info-id]');
        issueRow.find('[data-info-title]').attr('data-info-title', data.data.title).html(data.data.title);
        issueRow.find('[data-info-priority]').attr('data-info-priority', data.data.priority).html(data.data.priorityName);
        if (window.userObj.IsAdmin) {
            issueRow.find('[data-info-postedBy]').attr('data-info-postedBy', data.data.postedBy).html(data.data.postedByName);
        }
        // issueRow.find('[data-info-status]').attr('data-info-status', data.data.status).html(data.data.statusName);
        // issueRow.find('[data-info-assignedTo]').attr('data-info-assignedTo', data.data.assignedTo).html(data.data.assignedToName);
        issueRow.find('[data-info-desc]').attr('data-info-desc', data.data.desc).html(data.data.desc);
    }

    function saveIssueDetailsAdmin() {

        var issueId = parentClosure.$issueEditModal.attr('data-info-id'),
            comments = parentClosure.$modalTxtComments.val(),
            assignedTo = parentClosure.$modalAssignedTo.val(),
            status = parentClosure.$modalstatus.val();
        var method = 'PUT';
        $.ajax({
            url: '/issues',
            method: method,
            data: {
                id: issueId,
                comments: comments,
                assignedTo: assignedTo,
                status: status
            },
            success: function (data) {
                saveIssueDetailsAdminSH(data);
            },
            error: function () {
                var html = "Couldnot edit the issue";
                console.log(arguments);
                $('#errorMsg').removeClass('hidden').html("Error :" + html);

            }
        });
        parentClosure.$issueEditModal.modal('hide');
    }

    function saveIssueDetailsAdminSH(data) {
        if (data.success == true) {
            parentClosure.$issueEditModal.on('hidden.bs.modal', function () {
                handleHash();
            });

        } else {
            var html = "Couldnot edit the issue";
            console.log(arguments);
            $('#errorMsg').removeClass('hidden').html("Error :" + html);
        }
    }

    function deleteIssue() {
        var $this = $(this);
        var issueId = $(this).closest('tr').attr('data-info-id');
        $.ajax({
            url: '/issues',
            method: 'DELETE',
            data: {
                id: issueId
            },
            success: function (data) {
                deleteSH(data, $this);
            },
            error: function () {
                console.log("Delete error" + arguments);
            }
        });

    }

    function deleteSH(data, $this) {
        if (data.success == true) {
            var tr = $this.closest('tr').remove();
        } else {
            $('#errorMsg').removeClass('hidden').html("Could not delete the record");
        }
    }

    function showIssueDetails() {
        var $this = $(this);
        var issueId = $this.closest('[data-info-id]').data('info-id');
        $.ajax({
            url: '/issues/history/' + issueId,
            method: 'GET',
            success: function (data) {
                getIssueHistorySH(data, $this);
            },
            error: function () {
                console.log(arguments);
            }
        });
    }

    function getIssueHistorySH(data, $this) {
        if (data.invalidId == true) {
            alert("Please pass a valid id");
            return;
        }
        var issueId = $this.closest('[data-info-id]').data('info-id'),
            issueTitle = $this.closest('tr').find('td[data-info-title]').attr('data-info-title'),
            issuePriority = $this.closest('tr').find('td[data-info-priority]').attr('data-info-priorityName'),
            postedByName = $this.closest('tr').find('td[data-info-postedByName]').attr('data-info-postedByName'),
            assignedTo = $this.closest('tr').find('td[data-info-assignedTo]').attr('data-info-assignedTo'),
            status = $this.closest('tr').find('td[data-info-status]').attr('data-info-statusName'),
            desc = $this.closest('tr').find('td[data-info-desc]').attr('data-info-desc');

        parentClosure.$issueDetailsModal.attr('data-info-id', issueId);
        parentClosure.$modalDivIssueTitle.html(issueTitle);
        parentClosure.$modalDivDescription.html(desc);
        parentClosure.$modalDivPostedBy.html(postedByName);
        parentClosure.$modalDivPriority.html(issuePriority);
        parentClosure.$modalIssueHistoryTable.find('tbody').empty();
        // console.log(data);
        if (data.data.length == 0) {
            var $tr = $('<tr />'),
                $td1 = $('<td />');
            $td1.attr('colspan', 5);
            $td1.html("No history found");
            $tr.append($td1);
            parentClosure.$modalIssueHistoryTable.find('tbody').append($tr);

        } else {
            for (var i = 0; i < data.data.length; i++) {
                var $tr = $('<tr />'),
                    $td1 = $('<td />'),
                    $td2 = $('<td />'),
                    $td3 = $('<td />'),
                    $td4 = $('<td />'),
                    $td5 = $('<td />');
                var da = new Date(data.data[i].ModifiedOn);
                /*     console.log((data.data[i].ModifiedOn).toLocaleString());
                     console.log(typeof data.data[i].ModifiedOn);
                     console.log((data.data[i].ModifiedOn).constructor);
                  
                     console.log(da.toLocaleString());
                     console.log(typeof da);
                     console.log(da.constructor);
                     */
                $td1.html(data.data[i].Comments);
                $td2.html(data.data[i].ModifiedByName);
                $td3.html(da.toLocaleString());
                $td4.html(data.data[i].AssignedToName);
                $td5.html(data.data[i].StatusName);

                $tr.append($td1);
                $tr.append($td2);
                $tr.append($td3);
                $tr.append($td4);
                $tr.append($td5);
                parentClosure.$modalIssueHistoryTable.find('tbody').append($tr);
            };
        }
        $('#issueDetailsModal').modal('show');
    }

    function pageSetup() {
        parentClosure.$divIssuesTemplate = $('#divIssuesTemplate');

        parentClosure.$btnCreate = $('#divIssuesTemplate #btnCreate');
        parentClosure.$tableIssues = $('#divIssuesTemplate #tableIssues');

        parentClosure.$issueDetailsModal = $('#divIssuesTemplate #issueDetailsModal');
        parentClosure.$modalDivIssueTitle = $('#divIssuesTemplate #divIssueTitle');
        parentClosure.$modalDivDescription = $('#divIssuesTemplate #divDescription');
        parentClosure.$modalDivPostedBy = $('#divIssuesTemplate #postedBy');
        parentClosure.$modalDivPriority = $('#divIssuesTemplate #issueDetailsModal #priority');
        parentClosure.$modalIssueHistoryTable = $('#divIssuesTemplate #IssueHistoryTable');

        parentClosure.$issueEditModal = $('#divIssuesTemplate #issueEditModal');
        parentClosure.$modaltxtIssueTitle = $('#divIssuesTemplate #issueEditModal #txtIssueTitle');
        parentClosure.$modaltxtDescription = $('#divIssuesTemplate #issueEditModal #txtDescription');
        parentClosure.$modalDropdownPriority = $('#divIssuesTemplate #issueEditModal #priority');

        parentClosure.$modalTxtComments = $('#divIssuesTemplate #issueEditModal #adminForm #txtComments');
        parentClosure.$modalAssignedTo = $('#divIssuesTemplate #issueEditModal #adminForm #assignedTo');
        parentClosure.$modalstatus = $('#divIssuesTemplate #issueEditModal #adminForm #status');
        parentClosure.$saveBtn = $('#divIssuesTemplate #issueEditModal #saveBtn');
        //events
        parentClosure.$tableIssues.on('click', 'span[data-action=edit]', editIssue);
        parentClosure.$tableIssues.on('click', 'span[data-action=delete]', deleteIssue);
        parentClosure.$tableIssues.on('click', 'span[data-action=details]', showIssueDetails);
        parentClosure.$btnCreate.on('click', createIssue);
        parentClosure.$saveBtn.on('click', saveIssueDetails);

    }

    function showError(msg) {
        $('#errorMsg').removeClass('hidden').html("Error :" + msg);
    }
    //init definition

    function init() {

    }

    //init call

    //return

    return {
        init: init,
        handleHash: handleHash
    }
})();