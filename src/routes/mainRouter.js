module.exports = (function () {
	var noticeRouter = require('./noticeRouter')();
	var noticeRouterFile = require('./noticeRouterFile')();
	var noticeRouterSql = require('./noticeRouterSql')();
	var issueRouter = require('./issueRouter')();
	var initRouter = require('./initRouter')();
	var loginRouter = require('./loginRouter')();
	var userRouter = require('./userRouter')();
	var employeeRouter = require('./employeeRouter')();
	var profileRouter = require('./profileRouter')();
	var deptRouter = require('./departmentsRouter')();
	var logoutRouter = require('./logoutRouter')();
	
	
	//init
	function init(appConfig){
		appConfig.app.use('/notices', noticeRouter);
		appConfig.app.use('/notices-file', noticeRouterFile);
		appConfig.app.use('/notices-sql', noticeRouterSql);
		appConfig.app.use('/issues', issueRouter);
		appConfig.app.use('/init', initRouter);
		appConfig.app.use('/login', loginRouter);
		appConfig.app.use('/users', userRouter);
		appConfig.app.use('/employees', employeeRouter);
		appConfig.app.use('/profile', profileRouter);
		appConfig.app.use('/department', deptRouter);
		appConfig.app.use('/logout', logoutRouter);
	}
	return {
		init:init
	}

})();
