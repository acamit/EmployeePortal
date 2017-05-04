var express = require('express');
var path = require('path');
var issuesTemplateRouter = express.Router();
module.exports = function () {
	issuesTemplateRouter.route('/')
		.get(function (req, res) {
			res.sendFile(
				path.join(
					__dirname,
					'..\\..\\..\\templates',
					'issues.hbs'));
		});
	return issuesTemplateRouter;
};