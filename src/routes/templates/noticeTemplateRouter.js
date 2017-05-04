var express = require('express');
var path = require('path');
var noticeTemplateRouter = express.Router();
module.exports = function () {
	noticeTemplateRouter.route('/')
		.get(function (req, res) {
			res.sendFile(
				path.join(
					__dirname,
					'..\\..\\..\\templates',
					'notices.hbs'));
		});
	return noticeTemplateRouter;
};