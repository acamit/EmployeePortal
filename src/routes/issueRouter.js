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
				queryString = 'SELECT ISS.[IssueId],ISS.Description,ISS.[Title],[Priority],[ISH].[AssignedTo],[ISH].[Status] FROM [dbo].[Issues] AS ISS  LEFT JOIN [dbo].[IssueHistories] AS ISH	ON ISH.[IssueId]=[ISS].[IssueId] where ISS.PostedBy = ' + req.userSession.user.EmployeeId;
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
			var issueId = parseInt(req.body.id),
				title = req.body.title,
				desc = req.body.desc,
				priority = req.body.priority;
			var responseObj = {
				success: false,
				data: null
			}
			var ps = new mssql.PreparedStatement();
			var queryString = '';
			ps.input('title', mssql.VarChar);
			ps.input('desc', mssql.VarChar);
			ps.input('priority', mssql.Int);
			ps.input('issueId', mssql.Int);
			if (req.userSession.user.IsAdmin == true) {
				queryString = "";
			} else {
				queryString = "UPDATE [dbo].[Issues] SET [Title] =@title,[Description] = @desc , [Priority] = @priority WHERE IssueId = @issueId";
			}
			ps.prepare(queryString, function (err) {
				if (err) {
					console.log("update error 1" + err);
				} else {
					ps.execute({
						title: title,
						desc: desc,
						priority: priority,
						issueId: issueId
					}, function (err, data) {
						if (err) {
							console.log(err);
						} else {
							responseObj.success = true;
							responseObj.data = req.body;
							responseObj.data.priorityName = IssuePriorityValue(priority);
							res.send(responseObj);
						}
					});
				}
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
				priority = req.body.priority,
				postedBy = req.userSession.user['EmployeeId'];

			var ps = new mssql.PreparedStatement();
			ps.input('title', mssql.VarChar(100));
			ps.input('desc', mssql.VarChar(500));
			ps.input('postedBy', mssql.VarChar(20));
			ps.input('priority', mssql.VarChar(20));

			ps.prepare('INSERT INTO [dbo].[Issues]([Title],[Description],[PostedBy],[Priority],[IsActive])VALUES (@title, @desc, @postedBy, @priority, 1);SELECT @@IDENTITY as id', function (err) {
				var responseObj = {
					data: null,
					success: false
				};
				if (err) {
					console.log(err);
				} else {
					ps.execute({
						title: noticetitle,
						desc: noticeDesc,
						postedBy: postedBy,
						priority: priority
					}, function (err, data) {
						console.log(data);
						console.log(data.recordset[0]['id']);

						if (err) {
							console.log(err);
						} else {
							responseObj.success = true;
							responseObj.data = {
								id:data.recordset[0]['id'],
								title: noticetitle,
								desc: noticeDesc,
								priority: priority,
								priorityName: IssuePriorityValue(priority),
								status: 1,
								statusName: 'open',
								assignedTo: -1,
								assignedToName: "N.A"
							};

						}
						res.send(responseObj);
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
					if (err) {
						console.log("Issue history error 1" + err);
					}
					ps.execute({
						id: issueId
					}, function (err, data) {
						if (err) {
							console.log("Issue history error 2" + err);
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


	function IssuePriorityValue(priority) {
		var priorityNum = parseInt(priority, 10);
		var prValue = ""
		if (priorityNum == 1) {
			prValue = "Normal";
		} else if (priorityNum == 2) {
			prValue = "Urgent";
		} else if (priorityNum == 3) {
			prValue = "Immediate";
		}
		return prValue;
	}
	return issueRouter;
};