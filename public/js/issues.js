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

    function editIssue() {
        alert("Editted");
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
            success: function(data){
                deleteSH(data, $this);
            },
            error: function () {
                console.log("Delete error" + arguments);
            }
        });

    }

    function deleteSH(data, $this){
        if(data.success==true){
            var tr = $this.closest('tr').remove();
           // parentClosure.$modalIssueHistoryTable.find('tbody').remove(tr);
        }else{
            $('#errorMsg').removeClass('hidden').html("Could not delete the record");
        }
    }

    function showIssueDetails() {
        var $this = $(this);
        var info = {};
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
        parentClosure.$modalDivPriority = $('#divIssuesTemplate #priority');
        parentClosure.$modalIssueHistoryTable = $('#divIssuesTemplate #IssueHistoryTable');

        //events
        parentClosure.$tableIssues.on('click', 'span[data-action=edit]', editIssue);
        parentClosure.$tableIssues.on('click', 'span[data-action=delete]', deleteIssue);
        parentClosure.$tableIssues.on('click', 'span[data-action=details]', showIssueDetails);

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