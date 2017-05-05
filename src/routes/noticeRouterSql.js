var express = require('express'),
	noticeRouter = express.Router(),
	mssql = require('mssql');
	
module.exports = function() {
	noticeRouter.route('/')
				.get(function(req, res){
					var request = new mssql.Request();
					request.query('select * from dbo.Notices', function(err, recordset){
						if(err){
							console.log('Here is the err \n ' + err);
						}else{
							var notices = JSON.parse(JSON.stringify(recordset.recordset));
							notices = notices.map(function(notice){
								var obj = {
									id:notice.NoticeId,
									title:notice.Title,
									desc:notice.Description,
									startDate:notice.StartDate,
									endDate:notice.ExpirationDate
								};
								return obj;
							});
							//console.log(notices);
							res.send(JSON.stringify(notices));
						}
					});
				})
				.put(function(req, res){
					var noticeId = parseInt(req.body.id),
						title = req.body.title,
						desc= req.body.desc,
						startDate = req.body.startDate,
						endDate = req.body.endDate;
						
					startDate = startDate.replace(/-/g, '/');
					endDate = endDate.replace(/-/g, '/');
					var ps = new mssql.PreparedStatement();
					ps.input('title', mssql.VarChar(100));
					ps.input('desc', mssql.VarChar(500));
					ps.input('id', mssql.Int);
					ps.input('sDate', mssql.VarChar(20));
					ps.input('eDate', mssql.VarChar(20));

					ps.prepare('UPDATE dbo.Notices SET Description=@desc, Title= @title, StartDate=@sDate,ExpirationDate=@eDate  WHERE NoticeId=@id', function(err){
						console.log(err);
						ps.execute({title:title, desc:desc,id:noticeId, sDate:startDate, eDate:endDate}, function(err, data){
							if(err){
								console.log(err);
							}else{
								res.send("Updated");
							}
						});
					});
				})
				.delete(function(req, res){
					var noticeId = parseInt(req.body.id);
					
				var ps = new mssql.PreparedStatement();
					ps.input('id', mssql.Int);

					ps.prepare('DELETE FROM dbo.Notices WHERE noticeId = @id', function(err){
						if(err){
							console.log(err);
						}else{
							ps.execute({id:noticeId}, function(err, data){
								if(err){
									console.log(err);
								}else{
									res.send("Deleted");
								}
							});
						}
					});
				
					
				})
				.post(function(req, res){
					var noticetitle = req.body.title,
						noticeDesc = req.body.desc,
						startDate = req.body.startDate,
						endDate = req.body.endDate;
						
					var ps = new mssql.PreparedStatement();
						ps.input('title', mssql.VarChar(100));
						ps.input('desc', mssql.VarChar(500));
						ps.input('sDate', mssql.VarChar(20));
						ps.input('eDate', mssql.VarChar(20));

						startDate = startDate.replace(/-/g, '/');
						endDate = endDate.replace(/-/g, '/');
						
						ps.prepare('INSERT INTO dbo.Notices(Description, Title, StartDate, ExpirationDate, IsActive, PostedBy) VALUES(@desc, @title, @sDate, @eDate, 1 ,1)', function(err){
							if(err){
								console.log(err);
							}else{
								ps.execute({title:noticetitle, desc:noticeDesc, sDate:startDate, eDate:endDate}, function(err, data){
									if(err){
										console.log(err);
										res.send('err');
									}else{
										console.log("executed data "+JSON.stringify(data));
										res.send("Inserted");
									}
								});
							}
						});
				});
	return noticeRouter;
};