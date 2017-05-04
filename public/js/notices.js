/*$(document).ready(function () {
	"use strict";

	var $tableNotices = $('#tableNotices'),
		template = $('#trTemp1').html(),
		placeholder = {
			title: '{title}',
			desc: '{desc}',
			startDate: '{startDate}',
			endDate: '{endDate}'
		},
		$createBtn = $('#createBtn'),
		$modal = $('#EditNoticeModal'),
		$noticeTitle = $modal.find('#noticeTitle'),
		$noticeDesc = $modal.find('#EditNoticeModalDesc'),
		$saveBtn = $modal.find('[action=save]'),
		$startDateContainer = $modal.find('#EditNoticeModalStartDate'),
		$endDateContainer = $modal.find('#EditNoticeModalEndDate');

	function getNoticeData() {
		$.ajax({
			url: '/notices-sql',
			method: 'GET',
			success: getNoticeDataSH
		});
	}

	function getNoticeDataSH(notices) {
		$tableNotices.find('tr:gt(0)').remove();
		notices = JSON.parse(notices);
		for (var i = 0; i < notices.length; i++) {
			var $tr = $('<tr />').attr('notice-id', notices[i].id);
			var $trhtml = template.replace(placeholder.title, notices[i].title)
				.replace(placeholder.desc, notices[i].desc)
				.replace(placeholder.startDate, notices[i].startDate)
				.replace(placeholder.endDate, notices[i].endDate);
			$tr.html($trhtml);
			$tableNotices.append($tr);
			/*var $div = $('<div />');
			var $h2 = $('<h2 />');
			var $p = $('<p />');
			var $edit = $('<span />');
			var $delete = $('<span />');
			$div.attr('notice-id', notices[i].id);
			$h2.html(notices[i].title);
			$p.html(notices[i].desc);
			$edit.html('edit').attr('action', 'edit');
			$delete.html('delete').attr('action', 'delete');
			$div.append($h2);
			$div.append($p);
			$div.append($edit);
			$div.append($delete);
			$divNotices.append($div);
		}
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

	function deleteSH() {
		getNoticeData();
	}

	function editNotice() {
		var $thisEdit = $(this);
		var noticeId = $thisEdit.closest('[notice-id]').attr('notice-id'),
			titleContent = $thisEdit.closest('[notice-id]').find('[data-info=title]').html(),
			descContent = $thisEdit.closest('[notice-id]').find('[data-info=desc]').html(),
			startDate = $thisEdit.closest('[notice-id]').find('[data-info=startDate]').html(),
			endDate = $thisEdit.closest('[notice-id]').find('[data-info=endDate]').html();

		$modal.attr('notice-id', noticeId);
		$noticeTitle.val(titleContent.trim());
		$noticeDesc.val(descContent.trim());
		$startDateContainer.val(startDate);
		$endDateContainer.val(endDate);
		// $modal.find('[action=save]').on('click' , function(){
		// 	editNoticeRequest(noticeId, noticeTitle, noticeDesc, $modal);
		// });
		$modal.modal('show');
	}

	function saveNotice() {
		var noticeId = $modal.attr('notice-id'),
			method = 'PUT';
		if (parseInt(noticeId, 10) == -1) {
			method = 'POST';
		}
		$.ajax({
			url: '/notices-sql',
			method: method,
			data: {
				id: noticeId,
				title: $noticeTitle.val().trim(),
				desc: $noticeDesc.val().trim(),
				startDate: $startDateContainer.val(),
				endDate: $endDateContainer.val()
			},
			success: editSH
		});
	}

	function createNotice() {
		$modal.attr('notice-id', -1);
		$noticeTitle.val('');
		$noticeDesc.val('');
		$modal.modal('show');
	}

	function editSH() {
		alert("editted");
		//modal.find('[action=save]').off('click');
		$modal.modal('hide');
		getNoticeData();
	}

	function init() {
		getNoticeData();
		$('#tableNotices').on('click', 'a[action=delete]', deleteNotice);
		$('#tableNotices').on('click', 'a[action=edit]', editNotice);
		$saveBtn.bind('click', saveNotice);
		$createBtn.bind('click', createNotice);
	}

	init();

});
*/

window.notices = (function () {
	//var declaration
	var parentClosure;

	//var initialization

	parentClosure = {};

	//functions

	function handleHash(htmlInjector) {
		if(htmlInjector){
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
				url: '/notices-template',
				method: 'GET',
				success: getTemplateSH,
				error: function () {
					console.log(arguments);
				}
			});
		}
	}

	function getDataSH(notices) {
		prepareHTML.data = notices;
		prepareHTML();
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
		
		handleHash();
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
		parentClosure.$divNotices.find('div[notice-id]=' + data.id + ']').remove();
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