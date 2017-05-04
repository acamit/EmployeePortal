//Requires
var express = require('express');
var bp = require('body-parser');
var fs = require('fs');
var mainRouter = require('./src/routes/mainRouter');
var mssql = require('mssql');
var cp = require('cookie-parser');
var session = require('./middleware/session');
var authorisation = require('./middleware/authorisation');
var authentication = require('./middleware/authentication');


var app = express();

//Global variables
global.notices = [{
	id: 1,
	title: 'notice 1',
	desc: 'I am first notice'
}, {
	id: 2,
	title: 'notice 2',
	desc: 'I am second notice'
}, {
	id: 3,
	title: 'notice 3',
	desc: 'I am third notice'
}];

//middleware
app.use(bp.urlencoded({
	extended: true
}));
app.use(bp.json());
app.use(cp());
app.use(express.static('public'));
app.use(session);
app.use(authentication([
	'issues'
]));
/*
app.use(authorisation(
		[
			{
				url: 'notices',
				roles: ['dev', 'hr']
			}, {
				url: 'issues',
				roles: ['hr', 'tester']
			}
		]
	));*/


//Routes
/*app.use('/notices', noticeRouter);
app.use('/notices-file', noticeRouterFile);
app.use('/notices-sql', noticeRouterSql);
app.use('/issues', issueRouter);*/
mainRouter.init({
	app: app
});

//Database connection
var config = {
	server: 'AMIT3146017',
	user: 'acamit84',
	password: 'acamit84',
	database: 'EmployeePortal'
};
mssql.connect(config)
	.then(function () {
		console.log("I am connected");
	})
	.catch(function (err) {
		console.log("I could not connect");
	});


//Start Application

var port = process.env.PORT || 5000;

app.listen(3000, function () {
	console.log('App listening on 3000');
});