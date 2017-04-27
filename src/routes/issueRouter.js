var express = require('express');
var issueRouter = express.Router();
module.exports = function (argument) {
	
	issueRouter.route('/')
				.get(function(req, res){
						res.send('got');
					})
				.post(function(req, res){
						res.send('posted');
					})
				.put(function(req, res){
						res.send('put');
					})
				.delete(function(req, res){
						res.send('delete');
					});
	return issueRouter;
};

