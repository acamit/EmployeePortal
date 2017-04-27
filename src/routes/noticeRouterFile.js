var express = require('express');
var fs = require('fs');
var noticeRouter = express.Router();
module.exports = function() {
	noticeRouter.route('/')
				.get(function(req, res){

					fs.readFile('./data/notices.json', function(err, data){
						console.log(err);
						res.send(data);
					});
				})
				.put(function(req, res){
					var noticeId = parseInt(req.body.id),
						title = req.body.title,
						desc= req.body.desc;

						fs.readFile('./data/notices.json', function(err, notices){
						notices = JSON.parse(notices);
						for(var i=0;i<notices.length;i++){
							if(notices[i].id == noticeId){
								notices[i].title = title;
								notices[i].desc = desc;
								break;
							}
						}
						fs.writeFile('./data/notices.json', JSON.stringify(notices), function(err){
							console.log('written');
							res.send("Edit success");
						});
					});
				})
				.delete(function(req, res){
					var noticeId = parseInt(req.body.id);
					fs.readFile('./data/notices.json', function(err, notices){
						//console.log(err);
						notices = JSON.parse(notices);
						for(var i=0;i<notices.length;i++){
							if(notices[i].id == noticeId){
								notices.splice(i,1);
								break;
							}
						}

						fs.writeFile('./data/notices.json', JSON.stringify(notices), function(err){
							//console.log(err);
							res.send("Deleted");
						});
					});
					
				})
				.post(function(req, res){

					fs.readFile('./data/notices.json', function(err, notices){
						notices = JSON.parse(notices);
						console.log(notices);
						var noticeId = notices[notices.length-1].id + 1;
						var notice = {
							id:noticeId,
							title:req.body.title,
							desc:req.body.desc
						}
						notices.push(notice);
						fs.writeFile('./data/notices.json',JSON.stringify(notices), function(err){
							res.send(notice);
						});
					});
					
				});
	return noticeRouter;
};