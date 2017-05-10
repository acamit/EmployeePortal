var express = require('express'),
	issueRouter = express.Router(),
	mssql = require('mssql');

module.exports = function () {
	issueRouter.route('/')
		.get(function (req, res) {
			var request = new mssql.Request();
			var queryString = '';
			if (req.userSession.user.IsAdmin == true) {
				console.log(req.userSession);
				//queryString = "SELECT DISTINCT ISD.IssueId,ISHD.IssueHistoryId,  Description,Title,ISHD.Status, Priority, PostedBy, PostedByName, ModifiedBy, ModifiedByName, ModifiedOn, AssignedTo, AssignedToName FROM (SELECT I.IssueId, I.Title, I.IsActive,Description ,I.PostedBy, I.Priority, (EMP.FirstName + ' ' +EMP.LastName) AS 'PostedByName' FROM Issues I	JOIN Employees EMP		ON I.PostedBy = EMP.EmployeeId	WHERE I.IsActive = 1) AS ISD LEFT JOIN  (	SELECT ISH.IssueHistoryId,ISH.IssueId,ISH.Status, ISH.ModifiedOn, ISH.ModifiedBy,(EM.FirstName + ' ' +EM.LastName) AS 'ModifiedByName' FROM IssueHistories ISH	JOIN Employees EM		ON ISH.ModifiedBy = EM.EmployeeId) AS ISHD ON ISD.IssueId = ISHD.IssueId LEFT JOIN (SELECT ISH.IssueHistoryId,ISH.IssueId, ISH.AssignedTo,(EM.FirstName + ' ' +EM.LastName) AS 'AssignedToName' 	FROM IssueHistories ISH	JOIN Employees EM		ON ISH.AssignedTo = EM.EmployeeId) AS ISHAS ON ISHAS.IssueId = ISD.IssueId WHERE ISD.IsActive =1 AND ISHD.IssueHistoryId = (SELECT MAX(IssueHistoryId) FROM IssueHistories WHERE IssueId = ISD.IssueId) OR ISHD.IssueId IS NULL";
				queryString = "SELECT ISD.IssueId, Title,ISD.Priority, Description, PostedBy, PostedByName, IssueHistoryId, Comments, ModifiedBy, ModifiedByName, ModifiedOn, Status, AssignedTo, AssignedToName FROM ( SELECT ISS.IssueId, ISS.Title, ISS.Description, ISS.PostedBy, ISS.Priority, (EMP.FirstName + ' ' +EMP.LastName) AS 'PostedByName' FROM Issues ISS JOIN Employees EMP ON ISS.PostedBy = EMP.EmployeeId WHERE ISS.IsActive=1) AS ISD LEFT JOIN (SELECT ISHMD.IssueHistoryId,ISHAD.IssueHistoryId AS 'HIS', ISHMD.IssueId, ISHMD.Comments, ISHMD.ModifiedBy, ISHMD.ModifiedOn, ISHMD.Status, (ISHMD.FirstName + ' ' +ISHMD.LastName) AS 'ModifiedByName' , ISHAD.AssignedTo, ISHAD.AssignedToName FROM (SELECT * FROM IssueHistories ISH LEFT JOIN Employees EMP ON EMP.EmployeeId = ISH.ModifiedBy) AS ISHMD LEFT JOIN (SELECT ISH.IssueHistoryId, ISH.AssignedTo, (EMP.FirstName + ' ' +EMP.LastName) AS 'AssignedToName' FROM IssueHistories ISH	LEFT JOIN Employees EMP	ON EMP.EmployeeId = ISH.AssignedTo) AS ISHAD ON ISHMD.IssueHistoryId = ISHAD.IssueHistoryId) AS ISHD ON ISD.IssueId = ISHD.IssueId WHERE ModifiedOn = (SELECT MAX(ModifiedOn) FROM IssueHistories ISH WHERE ISH.IssueId = ISD.IssueId)";
			} else {
				queryString = 'SELECT ISS.[IssueId], ISH.Comments,ISS.Description,ISS.[Title],[Priority],[ISH].[AssignedTo],[ISH].[Status], (EMP.FirstName + \' \' + EMP.LastName) AS AssignedToName FROM [dbo].[Issues] AS ISS LEFT JOIN ([dbo].[IssueHistories] AS ISH	LEFT JOIN dbo.Employees EMP ON ISH.AssignedTo = EMP.EmployeeId) ON ISH.[IssueId]=[ISS].[IssueId] WHERE ISH.ModifiedOn = (SELECT MAX(ModifiedOn) FROM IssueHistories WHERE IssueId = ISS.IssueId) AND ISS.PostedBy = ' + req.userSession.user.EmployeeId + ' ORDER BY IssueId';
			}
			request.query(queryString, function (err, recordset) {
				if (err) {
					console.log('Here is the err \n ' + err);
				} else {
					var issues = JSON.parse(JSON.stringify(recordset.recordset));
					issues = issues.map(function (issue) {
						var obj = {
							id: issue.IssueId,
							Title: issue.Title,
							Priority: IssuePriorityValue(issue.Priority),
							PriorityId: issue.Priority,
							PostedBy: issue.PostedBy || req.userSession.user.EmployeeId,
							PostedByName: issue.PostedByName || req.userSession.user.FirstName + ' ' + req.userSession.user.LastName,
							AssignedTo: issue.AssignedTo,
							Status: StatusValue(issue.Status),
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
			if (req.userSession.IsAdmin) {
				var issueId = parseInt(req.body.id),
					comments = req.body.comments,
					assignedTo = req.body.assignedTo,
					status = req.body.status,
					modifiedBy = req.userSession.user['EmployeeId'];
				var ps = new mssql.PreparedStatement();
				ps.input('issueId', mssql.Int);
				ps.input('comments', mssql.VarChar(500));
				ps.input('assignedTo', mssql.Int);
				ps.input('status', mssql.Int);
				ps.input('modifiedBy', mssql.Int);

				ps.prepare('INSERT INTO [dbo].[IssueHistories]([IssueId],[Comments],[ModifiedBy],[ModifiedOn],[AssignedTo],[Status]) VALUES (@issueId,@comments,@modifiedBy,GETDATE(),@assignedTo,@status)', function (err) {
					var responseObj = {
						data: null,
						success: false
					};
					if (err) {
						console.log(err);
					} else {
						ps.execute({
							issueId: issueId,
							comments: comments,
							assignedTo: assignedTo,
							status: status,
							modifiedBy: modifiedBy
						}, function (err, data) {
							if (err) {
								console.log(err);
							} else {
								responseObj.success = true;
								responseObj.data = {}
							}
							res.send(responseObj);
						});
					}
				});
			} else {
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

				queryString = "UPDATE [dbo].[Issues] SET [Title] =@title,[Description] = @desc , [Priority] = @priority WHERE IssueId = @issueId";

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
			}
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
						if (err) {
							console.log(err);
						} else {
							responseObj.success = true;
							responseObj.data = {
								id: data.recordset[0]['id'],
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
						createIssueHistory(responseObj);
						//res.send(responseObj);
					});
				}
			});

			function createIssueHistory(responseObj) {
				var ps = new mssql.PreparedStatement();
				ps.input('id', mssql.Int);
				ps.input('comments', mssql.VarChar(500));
				ps.input('modifiedBy', mssql.Int);
				ps.prepare('INSERT INTO [dbo].[IssueHistories]([IssueId],[Comments],[ModifiedBy],[ModifiedOn],[AssignedTo],[Status])VALUES(@id,@comments,@modifiedBy,GETDATE(),null,1)', function (err) {
					if (err) {
						console.log(err);
					} else {
						ps.execute({
							id: responseObj.data.id,
							comments: 'Opened',
							modifiedBy: req.userSession.user.EmployeeId,
							priority: priority
						}, function (err, data) {
							if (err) {
								console.log(err);
							}
							res.send(responseObj);
						});
					}
				});

			}

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
							console.log('Unprepare error' + err);
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


		});

	issueRouter.route('/history/:id')
		.get(function (req, res) {
			var issueId = req.params.id;
			var responseObj = {
				invalidId: true,
				data: []
			};
			if (issueId) {
				var ps = new mssql.PreparedStatement();
				ps.input('id', mssql.Int);
				var queryString = "SELECT * FROM (SELECT IssueHistoryId, IssueId, Comments, ModifiedBy, ModifiedOn, AssignedTo,Status, (EMP.FirstName + ' ' + EMP.LastName) AS 'ModifiedByName' FROM IssueHistories ISH LEFT JOIN Employees EMP ON EMP.EmployeeId = ISH.ModifiedBy) AS ISD LEFT JOIN (SELECT ISH.IssueHistoryId, ISH.AssignedTo, (EMP.FirstName + ' ' + EMP.LastName) AS 'AssignedToName' FROM IssueHistories ISH LEFT JOIN Employees EMP ON ISH.AssignedTo = EMP.EmployeeId) AS ISHD ON ISD.IssueHistoryId= ISHD.IssueHistoryId WHERE ISD.IssueId = @id";
				ps.prepare(queryString, function (err, recordset) {
					if (err) {
						console.log("Issue history error 1" + err);
					}
					ps.execute({
						id: issueId
					}, function (err, data) {
						if (err) {
							console.log("Issue history error 2" + err);
						} else {
							responseObj.invalidId = false;

							responseObj.data = data.recordset.map(function (element) {
								return {
									Comments: element.Comments,
									ModifiedBy: element.ModifiedBy,
									ModifiedOn: element.ModifiedOn,
									AssignedTo: element.AssignedTo,
									Status: element.Status,
									ModifiedByName: element.ModifiedByName || 'N.A',
									AssignedToName: element.AssignedToName || 'N.A',
									StatusName: StatusValue(element.Status)
								}
							});
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

	function StatusValue(status) {
		var statusNum = parseInt(status, 10);
		var st = "Open";
		if (statusNum == 2) {
			st = "Work in progress";
		} else if (statusNum == 3) {
			st = "Closed";
		}

		return st;
	}
	return issueRouter;
};