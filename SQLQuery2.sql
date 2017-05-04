USE [EmployeePortal]
GO

INSERT INTO [dbo].[Users]
           ([EmployeeId]
           ,[Password]
           ,[IsAdmin])
     VALUES
           (2
           ,'password',0)
GO


INSERT INTO [dbo].[Employees]
           ([FirstName]
           ,[LastName]
           ,[Email]
           ,[DateOfJoining]
           ,[TerminationDate]
           ,[DepartmentId])
     VALUES
           ('Amit'
           ,'Chawla'
           ,'acamit84@gmail.com'
           ,'02/24/2017'
           ,'03/04/2017'
           ,2)
GO


INSERT INTO [dbo].[Notices]
           ([Title]
           ,[Description]
           ,[PostedBy]
           ,[StartDate]
           ,[ExpirationDate]
           ,[IsActive])
     VALUES
           ('Title'
           ,'Description'
           ,1
       ,'03/04/2016'
           ,'03/04/2016'
           ,1)
GO


INSERT INTO [dbo].[Issues]
           ([Title]
           ,[Description]
           ,[PostedBy]
           ,[Priority]
           ,[IsActive])
     VALUES
           ('Issue 1','description 3',1,1,1),
		    ('Issue 2','description 4',1,2,1)
GO


INSERT INTO [dbo].[IssueHistories]
           ([IssueId]
           ,[Comments]
           ,[ModifiedBy]
           ,[ModifiedOn]
           ,[AssignedTo]
           ,[Status])
     VALUES
           (1,'comments 1',1,'02-04-2107',6,1),
           (2,'comments 2',1,'02-04-2107',6,1),
           (2,'comments 3',1,'02-04-2107',6,1)
GO


INSERT INTO [dbo].[Users]
           ([EmployeeId]
           ,[Password]
           ,[IsAdmin])
     VALUES
           (6,'Password', 0)
GO


select * from dbo.Notices
select * from dbo.Users
SELECT * FROM EmployeePortal.dbo.Employees
select * from dbo.IssueHistories
select * from dbo.Issues

sp_help 'IssueHistories'

SELECT ISS.[IssueId]
      ,ISS.[Title]
      ,[PostedBy]
      ,[Priority]
      ,[IsActive],
	  [ISH].[AssignedTo],
	  [ISH].[Status]
  FROM [dbo].[Issues] AS ISS
  LEFT JOIN [dbo].[IssueHistories] AS ISH
	ON ISH.[IssueId]=[ISS].[IssueId]
	LEFT JOIN DBO.Employees AS EMP
	 ON EMP.EmployeeId = ISS.PostedBy
GO


SELECT ISS.[IssueId]
      ,ISS.[Title]
      ,EMP.FirstName + ' ' +EMP.LastName AS 'PostedByName'
	    ,[PostedBy]
      ,[Priority]
      ,[IsActive],
	  [ISH].[AssignedTo],
	  [ISH].[Status]
  FROM [dbo].[Issues] AS ISS
  LEFT JOIN [dbo].[IssueHistories] AS ISH
	ON ISH.[IssueId]=[ISS].[IssueId]
	LEFT JOIN DBO.Employees AS EMP
	 ON EMP.EmployeeId = ISS.PostedBy
GO

SELECT ISS.[IssueId],ISS.[Title],[Priority],[ISH].[AssignedTo],[ISH].[Status] FROM [dbo].[Issues] AS ISS
  LEFT JOIN [dbo].[IssueHistories] AS ISH
	ON ISH.[IssueId]=[ISS].[IssueId]
	where iss.PostedBy = 6
GO


SELECT [IssueHistoryId]
      ,[IssueId]
      ,[Comments]
      ,[ModifiedBy]
      ,[ModifiedOn]
      ,[AssignedTo]
      ,[Status]
  FROM [dbo].[IssueHistories]
GO


UPDATE DBO.Issues SET PostedBy = 6 WHERE IssueId = 4

DELETE FROM dbo.IssueHistories WHERE IssueId = 1
DELETE FROM dbo.Issues WHERE IssueId = 1



SELECT ISS.Description, ISS.[IssueId],ISS.[Title],EMP.FirstName + ' ' +EMP.LastName AS 'PostedByName',
ISS.PostedBy,ISS.[Priority],ISS.[IsActive],(
	SELECT (EMP.FirstName + ' ' +EMP.LastName) AS NAME
	FROM dbo.IssueHistories ISH
	JOIN Employees EMP
		ON ISH.AssignedTo = EMP.EmployeeId
	WHERE IssueId=ISS.IssueId AND IssueHistoryId=(SELECT MAX(IssueHistoryId) FROM IssueHistories where IssueId=ISS.IssueId)

) 'AssignedTo' , 
(
	SELECT Status
	FROM dbo.IssueHistories
	WHERE IssueId=ISS.IssueId AND IssueHistoryId=(SELECT MAX(IssueHistoryId) FROM IssueHistories where IssueId=ISS.IssueId)
) 'Status'
FROM [dbo].[Issues] AS ISS 
 LEFT JOIN DBO.Employees AS EMP 
	ON EMP.EmployeeId = ISS.PostedBy
WHERE ISS.IsActive =1

UPDATE Issues  SET IsActive = 0 WHERE IssueId = 3

	--Issue data query

SELECT DISTINCT ISD.IssueId,ISHD.IssueHistoryId,  Description,Title,ISHD.Status, Priority, PostedBy, PostedByName, ModifiedBy, ModifiedByName, ModifiedOn
FROM 
(
	SELECT I.IssueId, I.Title, I.IsActive,Description ,I.PostedBy, I.Priority, (EMP.FirstName + ' ' +EMP.LastName) AS 'PostedByName'
	FROM Issues I
	JOIN Employees EMP
		ON I.PostedBy = EMP.EmployeeId
	WHERE I.IsActive = 1
) AS ISD
LEFT JOIN 
(
	SELECT ISH.IssueHistoryId,ISH.IssueId,ISH.Status, ISH.ModifiedOn, ISH.ModifiedBy,(EM.FirstName + ' ' +EM.LastName) AS 'ModifiedByName'
	FROM IssueHistories ISH
	JOIN Employees EM
		ON ISH.ModifiedBy = EM.EmployeeId
) AS ISHD
ON ISD.IssueId = ISHD.IssueId
LEFT JOIN 
(
SELECT ISH.IssueHistoryId,ISH.IssueId, ISH.AssignedTo,(EM.FirstName + ' ' +EM.LastName) AS 'AssignedToName'
	FROM IssueHistories ISH
	JOIN Employees EM
		ON ISH.AssignedTo = EM.EmployeeId
) AS ISHAS
ON ISHAS.IssueId = ISD.IssueId
WHERE ISD.IsActive =1 AND ISHD.IssueHistoryId = (SELECT MAX(IssueHistoryId) FROM IssueHistories WHERE IssueId = ISD.IssueId) OR ISHD.IssueId IS NULL






DELETE FROM dbo.IssueHistories
DBCC CHECKIDENT ('EmployeePortal.dbo.IssueHistories',RESEED, 0)
TRUNCATE TABLE DBO.[Issues]