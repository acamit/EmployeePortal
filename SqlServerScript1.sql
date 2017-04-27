USE EmployeePorta
IF NOT EXISTS(
	SELECT 1
	FROM sys.tables 
	WHERE name='Notices'
)
	BEGIN
		CREATE TABLE Notices
		(
			noticeId INT IDENTITY(1,1) PRIMARY KEY,
			noticeTitle VARCHAR(100) NOT NULL,
			noticeDesc VARCHAR(500) 
		)
	END
ELSE
	BEGIN
		PRINT 'EXISTS'
	END