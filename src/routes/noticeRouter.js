var express = require('express');
var noticeRouter = express.Router();
module.exports = function () {
	noticeRouter.route('/')
		.get(function (req, res) {
			res.send(global.notices);
		})
		.put(function (req, res) {
			var noticeId = parseInt(req.body.id),
				title = req.body.title,
				desc = req.body.desc;
			for (var i = 0; i < global.notices.length; i++) {
				if (global.notices[i].id == noticeId) {
					console.log(req.body);
					global.notices[i].title = req.body.title;
					global.notices[i].desc = req.body.desc;
					break;
				}
			}
			res.send("updated");
		})
		.delete(function (req, res) {
			var noticeId = parseInt(req.body.id);
			for (var i = 0; i < global.notices.length; i++) {
				if (global.notices[i].id == noticeId) {
					global.notices.splice(i, 1);
					break;
				}
			}
			res.send("Deleted");
		})
		.post(function (req, res) {
			var noticeId = notices[global.notices.length - 1].id + 1;
			var notice = {
				id: noticeId,
				title: req.body.title,
				desc: req.body.desc
			}
			notices.push(notice);
			res.send(notice);
		});

	noticeRouter.route('/template')
		.get(function (req, res) {
			res.sendFile(
				path.join(
					__dirname,
					'..\\..\\..\\templates',
					'notices.hbs'));
		});
	return noticeRouter;
};