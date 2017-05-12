window.notices = (function () {
	//var declaration
	var parentClosure;

	//var initialization

	parentClosure = {};

	//functions

	function handleHash(htmlInjector) {
		if (htmlInjector) {
			prepareHTML.htmlInjector = htmlInjector;
		}
		$.ajax({
			url: '/notices-sql',
			method: 'GET',
			dataType: 'json',
			success: getDataSH,
			error: function () {
				console.log(arguments);
			}
		});

		if (!prepareHTML.templateFunction) {
			$.ajax({
				url: '/notices-sql/template',
				method: 'GET',
				success: getTemplateSH,
				error: function () {
					console.log(arguments);
				}
			});
		}
	}

	function getDataSH(data) {
		if (data.IsAuthenticated === false) {
			var html = 'Please <a href="#login">Login</a> to access notices';
			prepareHTML.htmlInjector(html, null);
		} else if (data.IsAuthorized === false) {
			var html = 'Please <a href="#logout">Logout</a> and Login with proper role to access notices';
			prepareHTML.htmlInjector(html, pageSetup);
		} else {
			//console.log(data);
			prepareHTML.data = data;
			prepareHTML();
		}
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

	function clearModal() {
		parentClosure.$modal.attr('notice-id', -1);
		parentClosure.$noticeTitle.val('');
		parentClosure.$noticeDesc.val('');
		parentClosure.$startDate.val('');
		parentClosure.$endDate.val('');
		parentClosure.$noticeDesc.val('');
	}

	function createNotice() {
		clearModal();
		parentClosure.$modal.modal('show');
	}

	function editNotice() {
		var $thisEdit = $(this);
		var noticeId = $thisEdit.closest('[notice-id]').attr('notice-id'),
			titleContent = $thisEdit.closest('[notice-id]').find('[data-info=title]').attr('data-info-val'),
			descContent = $thisEdit.closest('[notice-id]').find('[data-info=desc]').attr('data-info-val'),
			startDate = $thisEdit.closest('[notice-id]').find('[data-info=startDate]').attr('data-info-val'),
			endDate = $thisEdit.closest('[notice-id]').find('[data-info=endDate]').attr('data-info-val');

		parentClosure.$modal.attr('notice-id', noticeId);
		parentClosure.$noticeTitle.val(titleContent.trim());
		parentClosure.$noticeDesc.val(descContent.trim());

		parentClosure.$startDate.val(startDate);
		parentClosure.$endDate.val(endDate);
		parentClosure.$modal.modal('show');
	}

	function saveNotice() {
		var noticeId = parentClosure.$modal.attr('notice-id'),
			method = 'PUT';
		if (parseInt(noticeId, 10) == -1) {
			method = 'POST';
		}
		$.ajax({
			url: '/notices-sql',
			method: method,
			data: {
				id: noticeId,
				title: parentClosure.$noticeTitle.val().trim(),
				desc: parentClosure.$noticeDesc.val().trim(),
				startDate: parentClosure.$startDate.val(),
				endDate: parentClosure.$endDate.val()
			},
			success: saveNoticeSH
		});

		parentClosure.$modal.modal('hide');
	}

	function saveNoticeSH() {
		parentClosure.$modal.on('hidden.bs.modal', function () {
			handleHash();
		});
	}

	function deleteNotice() {
		var noticeId = $(this).closest('[notice-id]').attr('notice-id');
		$.ajax({
			url: '/notices-sql',
			method: 'DELETE',
			data: {
				id: noticeId
			},
			success: deleteSH
		});
	}

	function deleteSH(data) {
		parentClosure.$divNotices.find('div[notice-id=' + data.id + ']').remove();
	}

	function pageSetup() {
		parentClosure.$divNotices = $('#divNoticesTemplate #divNotices'),
			parentClosure.$modal = $('#divNoticesTemplate #noticeModal'),
			parentClosure.$modalTitle = $('#divNoticesTemplate #noticeModal #modalTitle'),
			parentClosure.$noticeTitle = $('#divNoticesTemplate #txtNoticeTitle'),
			parentClosure.$noticeDesc = $('#divNoticesTemplate #txtDescription'),
			parentClosure.$startDate = $('#divNoticesTemplate #startDate'),
			parentClosure.$endDate = $('#divNoticesTemplate #endDate'),
			parentClosure.$saveBtn = $('#divNoticesTemplate #btnSave'),
			parentClosure.$createBtn = $('#divNoticesTemplate #btnCreate');
		//events init
		parentClosure.$divNotices.on('click',
			'a[action=delete]', deleteNotice);
		parentClosure.$divNotices.on('click',
			'a[action=edit]', editNotice);
		parentClosure.$saveBtn.bind('click', saveNotice);
		parentClosure.$createBtn.bind('click', createNotice);

	}

	function init() {}

	//return
	return {
		init: init,
		handleHash: handleHash
	};
})();