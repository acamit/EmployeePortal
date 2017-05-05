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
        $this = $(this);
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

    function saveIssueDetails() {

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
                saveIssueDetailsSH(data, issueId);
            },
            error: function () {
                var html = " ";
                if (issueId == -1) {
                    html += "Couldnot raise the issue";
                } else {
                    html += "Couldnot edit the issue";
                }
                console.log(arguments);
                $('#errorMsg').removeClass('hidden').html("Error :" + html);

            }
        });
    }

    function saveIssueDetailsSH(data, issueId) {
        if (data.success) {
            if (issueId == -1) {
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
            } else {
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
        } else {
            $('#errorMsg').removeClass('hidden').html("Error saving issue");
        }
        parentClosure.$issueEditModal.modal('hide');
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
            issuePriority = $this.closest('tr').find('td[data-info-priority]').attr('data-info-priority'),
            postedByName = $this.closest('tr').find('td[data-info-postedByName]').attr('data-info-postedByName'),
            assignedTo = $this.closest('tr').find('td[data-info-assignedTo]').attr('data-info-assignedTo'),
            status = $this.closest('tr').find('td[data-info-status]').attr('data-info-status'),
            desc = $this.closest('tr').find('td[data-info-desc]').attr('data-info-desc');

        parentClosure.$issueDetailsModal.attr('data-info-id', issueId);
        parentClosure.$modalDivIssueTitle.html(issueTitle);
        parentClosure.$modalDivDescription.html(desc);
        parentClosure.$modalDivPostedBy.html(postedByName);
        parentClosure.$modalDivPriority.html(issuePriority);
        parentClosure.$modalIssueHistoryTable.find('tbody').empty();
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

                $td1.html(data.data[i].Comments);
                $td2.html(data.data[i].ModifiedBy);
                $td3.html(data.data[i].ModifiedOn);
                $td4.html(data.data[i].AssignedTo);
                $td5.html(data.data[i].Status);

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

        parentClosure.$saveBtn = $('#divIssuesTemplate #issueEditModal #saveBtn');
        //events
        parentClosure.$tableIssues.on('click', 'span[data-action=edit]', editIssue);
        parentClosure.$tableIssues.on('click', 'span[data-action=delete]', deleteIssue);
        parentClosure.$tableIssues.on('click', 'span[data-action=details]', showIssueDetails);
        parentClosure.$btnCreate.on('click', createIssue);
        parentClosure.$saveBtn.on('click', saveIssueDetails);

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