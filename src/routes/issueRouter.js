var express = require('express'),
	issueRouter = express.Router(),
	mssql = require('mssql');

module.exports = function () {
	issueRouter.route('/')
		.get(function (req, res) {
			var request = new mssql.Request();
			var queryString = '';
			if (req.userSession.user.IsAdmin == true) {
				//queryString = 'SELECT ISS.Description, ISS.[IssueId],ISS.[Title],EMP.FirstName + \' \' +EMP.LastName AS \'PostedByName\',ISS.PostedBy,[Priority],[IsActive], [ISH].[AssignedTo],[ISH].[Status] FROM [dbo].[Issues] AS ISS JOIN [dbo].[IssueHistories] AS ISH ON ISH.[IssueId]=[ISS].[IssueId] LEFT JOIN DBO.Employees AS EMP ON EMP.EmployeeId = ISS.PostedBy';


				queryString = "SELECT DISTINCT ISD.IssueId,ISHD.IssueHistoryId,  Description,Title,ISHD.Status, Priority, PostedBy, PostedByName, ModifiedBy, ModifiedByName, ModifiedOn, AssignedTo, AssignedToName FROM (SELECT I.IssueId, I.Title, I.IsActive,Description ,I.PostedBy, I.Priority, (EMP.FirstName + ' ' +EMP.LastName) AS 'PostedByName' FROM Issues I	JOIN Employees EMP		ON I.PostedBy = EMP.EmployeeId	WHERE I.IsActive = 1) AS ISD LEFT JOIN  (	SELECT ISH.IssueHistoryId,ISH.IssueId,ISH.Status, ISH.ModifiedOn, ISH.ModifiedBy,(EM.FirstName + ' ' +EM.LastName) AS 'ModifiedByName' FROM IssueHistories ISH	JOIN Employees EM		ON ISH.ModifiedBy = EM.EmployeeId) AS ISHD ON ISD.IssueId = ISHD.IssueId LEFT JOIN (SELECT ISH.IssueHistoryId,ISH.IssueId, ISH.AssignedTo,(EM.FirstName + ' ' +EM.LastName) AS 'AssignedToName' 	FROM IssueHistories ISH	JOIN Employees EM		ON ISH.AssignedTo = EM.EmployeeId) AS ISHAS ON ISHAS.IssueId = ISD.IssueId WHERE ISD.IsActive =1 AND ISHD.IssueHistoryId = (SELECT MAX(IssueHistoryId) FROM IssueHistories WHERE IssueId = ISD.IssueId) OR ISHD.IssueId IS NULL ";

			} else {
				queryString = 'SELECT ISS.[IssueId],ISS.Description, ISS.[Title],[Priority],[ISH].[AssignedTo],[ISH].[Status] FROM [dbo].[Issues] AS ISS  LEFT JOIN [dbo].[IssueHistories] AS ISH	ON ISH.[IssueId]=[ISS].[IssueId] where ISS.PostedBy = ' + req.userSession.user.EmployeeId;
			}
			request.query(queryString, function (err, recordset) {
				if (err) {
					console.log('Here is the err \n ' + err);
				} else {
					var issues = JSON.parse(JSON.stringify(recordset.recordset));
					issues = issues.map(function (issue) {
						var pr = "normal";
						if (issue.Priority == 2) {
							pr = "urgent";
						} else if (issue.Priority == 3) {
							pr = "immediate";
						}
						var st = "open";
						if (issue.status == 2) {
							st = "closed";
						} else if (issue.status == 3) {
							st = "resolved";
						}
						var obj = {
							id: issue.IssueId,
							Title: issue.Title,
							Priority: pr,
							PriorityId: issue.Priority,
							PostedBy: issue.PostedBy,
							PostedByName: issue.PostedByName,
							AssignedTo: issue.AssignedTo,
							Status: st,
							StatusId: issue.Status,
							Description: issue.Description,
							AssignedToName: issue.AssignedToName || 'N.A',
							ModifiedByName: issue.ModifiedByName || 'N.A'

						};
						return obj;
					});
					var rv = {};
					rv.issues = issues;
					rv.IsAdmin = req.userSession.user.IsAdmin;
					res.send(JSON.stringify(rv));
				}
			});
		})
		.put(function (req, res) {
			var noticeId = parseInt(req.body.id),
				title = req.body.title,
				desc = req.body.desc,
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

			ps.prepare('UPDATE dbo.Notices SET Description=@desc, Title= @title, StartDate=@sDate,ExpirationDate=@eDate  WHERE NoticeId=@id', function (err) {
				console.log(err);
				ps.execute({
					title: title,
					desc: desc,
					id: noticeId,
					sDate: startDate,
					eDate: endDate
				}, function (err, data) {
					if (err) {
						console.log(err);
					} else {
						res.send("Updated");
					}
				});
			});
		})
		.delete(function (req, res) {
			var responseObj = {
				success: false
			}
			var noticeId = parseInt(req.body.id);

			var ps = new mssql.PreparedStatement();
			ps.input('id', mssql.Int);

			ps.prepare('DELETE FROM dbo.[IssueHistories] WHERE IssueId = @id', function (err) {
				if (err) {
					console.log(err);
				} else {
					ps.execute({
						id: noticeId
					}, function (err, data) {
						ps.unprepare(function (err) {
							console.log('Unprepare error');
						});
						if (err) {
							console.log(err);
							res.send(responseObj);
						} else {
							var psd = new mssql.PreparedStatement();
							psd.input('id', mssql.Int);

							psd.prepare('DELETE FROM dbo.Issues WHERE IssueId = @id', function (err) {
								if (err) {
									console.log(err);
								} else {
									psd.execute({
										id: noticeId
									}, function (err, data) {
										psd.unprepare(function (err) {
											console.log(err);
										});
										if (err) {
											console.log(err);
										} else {
											responseObj.success = true;
										}
										res.send(responseObj);
									});
								}
							});

						}
					});
				}
			});


		})
		.post(function (req, res) {
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

			ps.prepare('INSERT INTO dbo.Notices(Description, Title, StartDate, ExpirationDate, IsActive, PostedBy) VALUES(@desc, @title, @sDate, @eDate, 1 ,1)', function (err) {
				if (err) {
					console.log(err);
				} else {
					ps.execute({
						title: noticetitle,
						desc: noticeDesc,
						sDate: startDate,
						eDate: endDate
					}, function (err, data) {
						if (err) {
							console.log(err);
							res.send('err');
						} else {
							console.log("executed data " + JSON.stringify(data));
							res.send("Inserted");
						}
					});
				}
			});
		});

	issueRouter.route('/history/:id')
		.get(function (req, res) {
			var issueId = req.params.id;
			var responseObj = {
				invalidId: true,
				data: null
			};
			if (issueId) {
				var ps = new mssql.PreparedStatement();
				ps.input('id', mssql.Int);
				ps.prepare('SELECT [IssueHistoryId],[Comments],[ModifiedBy],[ModifiedOn],[AssignedTo],[Status] FROM [dbo].[IssueHistories] WHERE [IssueId]=@id', function (err, recordset) {
					console.log(err);
					ps.execute({
						id: issueId
					}, function (err, data) {
						if (err) {
							console.log(err);
						} else {
							responseObj.invalidId = false;
							responseObj.data = data.recordset;
						}
						res.send(responseObj);
					});
				});

			}

		});
	return issueRouter;
};