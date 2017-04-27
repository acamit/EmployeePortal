module.exports = (function () {
	var noticeRouter = require('./noticeRouter')();
	var noticeRouterFile = require('./noticeRouterFile')();
	var noticeRouterSql = require('./noticeRouterSql')();
	var issueRouter = require('./issueRouter')();

	//init

	function init(appConfig){
		appConfig.app.use('/notices', noticeRouter);
		appConfig.app.use('/notices-file', noticeRouterFile);
		appConfig.app.use('/notices-sql', noticeRouterSql);
		appConfig.app.use('/issues', issueRouter);
	}

	return {
		init:init
	}



})();
