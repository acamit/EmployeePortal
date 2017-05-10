var express = require('express');
var path = require('path');
var mssql = require('mssql');
var date= require('date-and-time');
var employeeRouter = express.Router();
module.exports = function () {
    employeeRouter.route('/')
        .get(function (req, res) {
            var responseObj = {
                user: req.userSession.user,
                data: []
            };
            var queryString = 'SELECT [DepartmentId],[DepartmentName]FROM [dbo].[Departments]';
            var ps = new mssql.PreparedStatement();
            ps.prepare(queryString, function (err) {
                if (err) {
                    console.log('Departments get error' + err);
                } else {
                    ps.execute({}, function (err, data) {
                        if (err) {
                            console.log('Departments get error' + err);
                        } else {
                            responseObj.data = data.recordset;
                        }
                        res.send(JSON.stringify(responseObj));
                    });
                }
            });
        })
        .post(function (req, res) {
            var searchFirstName = req.body.searchFirstName,
                searchLastName = req.body.searchLastName,
                searchEmail = req.body.searchEmail,
                searchBeginDate = req.body.searchBeginDate,
                searchEndDate = req.body.searchEndDate,
                searchDepartment = req.body.searchDepartment;
            var queryString = 'SELECT [EMP].[EmployeeId],[FirstName],[LastName] ,[Email],[DateOfJoining],[TerminationDate],EMP.DepartmentId,[US].[IsAdmin],DEPT.DepartmentName  FROM [dbo].[Employees] EMP LEFT JOIN dbo.Departments DEPT  ON EMP.DepartmentId = DEPT.DepartmentId LEFT JOIN dbo.Users US ON EMP.EmployeeId = US.EmployeeId';
            var appendString = '';
            var ps = new mssql.PreparedStatement();

            if (searchFirstName) {
                ps.input('firstName', mssql.VarChar(100));
                appendString += appendString ? ' OR' : '';
                appendString += "[FirstName] LIKE ('%' + @firstName + '%')";
            }
            if (searchLastName) {
                ps.input('lastName', mssql.VarChar(100));
                appendString += appendString ? ' OR' : '';
                appendString += " [LastName] LIKE ('%' + @lastName + '%')";
            }
            if (searchEmail) {
                ps.input('email', mssql.VarChar(100));
                appendString += appendString ? ' OR' : '';
                appendString += " [Email] LIKE ('%' + @email + '%')";
            }
            if (searchDepartment) {
                ps.input('deptId', mssql.Int);
                appendString += appendString ? ' OR' : '';
                appendString += ' [EMP].[DepartmentId] = @deptId';
            }
            if (searchBeginDate) {
                ps.input('doj', mssql.Date);
                appendString += appendString ? ' OR' : '';
                appendString += ' [DateOfJoining] >= @doj';
            }
            if (searchEndDate) {
                ps.input('endDate', mssql.Date);
                if (searchBeginDate) {
                    appendString += appendString ? ' OR' : '';
                } else {
                    appendString += appendString ? ' AND' : '';
                }
                appendString += ' [DateOfJoining] <= @endDate';
            }
            if (!req.userSession.user.IsAdmin) {
                appendString += appendString ? ') AND' : '';
                appendString += ' [TerminationDate] IS NOT NULL';
            } else {

                appendString += appendString ? ')' : '';
            }
            if (appendString) {
                queryString += ' WHERE (' + appendString;
            }
       
            var datap = {
                firstName: searchFirstName,
                lastName: searchLastName,
                email: searchEmail,
                endDate: searchEndDate,
                doj: searchBeginDate,
                deptId: searchDepartment,
            };
            ps.prepare(queryString, function (err) {
                ps.execute(datap, function (err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        var employees = JSON.parse(JSON.stringify(data.recordset));
                        employees = employees.map(function (employee) {
                            var obj = {
                                empId: employee.EmployeeId,
                                firstName: employee.FirstName,
                                lastName: employee.LastName,
                                email: employee.Email,
                                doj: employee.DateOfJoining,
                                // doj: date.format(new Date(employee.DateOfJoining), 'DD/MM/YYYY'),
                                deptName: employee.DepartmentName,
                                deptId: employee.DepartmentId,
                                endDate: employee.TerminationDate,
                                // endDate: date.format(new Date(employee.TerminationDate), 'DD/MM/YYYY'),
                                isAdmin: employee.IsAdmin
                            };
                            return obj;
                        });
                        res.send(JSON.stringify(employees));
                    }
                });
            });
        })
        .put(function (req, res) {
            var firstName = req.body.firstName,
                empid = req.body.empid,
                lastName = req.body.lastName,
                email = req.body.email,
                doj = req.body.doj|| null,
                terminationdate = req.body.terminationdate || null,
                deptId = req.body.deptId,
                isAdmin = req.body.isAdmin,
                password = req.body.password;
            isAdmin = (isAdmin == true) ? 1 : 0;
            var ps = new mssql.PreparedStatement();
            ps.input('firstName', mssql.VarChar(50));
            ps.input('lastName', mssql.VarChar(50));
            ps.input('email', mssql.VarChar(100));
            ps.input('doj', mssql.Date);
            ps.input('terminationdate', mssql.Date);
            ps.input('deptId', mssql.Int);
            ps.input('isAdmin', mssql.Int);
            ps.input('empid', mssql.Int);
            ps.input('password', mssql.VarChar(50));
            var queryString = "UPDATE [dbo].[Employees]   SET [FirstName] = @firstName      ,[LastName] = @lastName      ,[Email] = @email      ,[DateOfJoining] = @doj       ,[TerminationDate] = @terminationdate      ,[DepartmentId] = @deptId WHERE [EmployeeId]=@empid ;UPDATE [dbo].[Users]   SET      [Password] = @password      ,[IsAdmin] = @isAdmin WHERE  [EmployeeId] =@empid  ";
            var responseObj = {
                success: false,
                data: []
            };

            ps.prepare(queryString, function (err) {
                if (err) {
                    console.log('insert employee prepare error : ' + err);
                } else {
                    var params = {
                        empid:empid,
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        doj: doj,
                        terminationdate: terminationdate,
                        deptId: deptId,
                        isAdmin: isAdmin,
                        password: password,
                    };
                    ps.execute(params, function (err, data) {
                        if (err) {
                            console.log("Insert employee execute error : " + err);
                        } else {
                            responseObj.success = true;
                        }
                        res.send(JSON.stringify(responseObj));
                    });

                }
            });
        });
    employeeRouter.route('/template')
        .get(function (req, res) {
            res.sendFile(
                path.join(
                    __dirname,
                    '..\\..\\templates',
                    'employees.hbs'));
        });
    employeeRouter.route('/add')
        .post(function (req, res) {
            var firstName = req.body.firstName,
                lastName = req.body.lastName,
                email = req.body.email,
                doj = req.body.doj,
                terminationdate = req.body.terminationdate || null,
                deptId = req.body.deptId,
                isAdmin = req.body.isAdmin,
                password = req.body.password;
            isAdmin = (isAdmin == true) ? 1 : 0;
            var ps = new mssql.PreparedStatement();
            ps.input('firstName', mssql.VarChar(50));
            ps.input('lastName', mssql.VarChar(50));
            ps.input('email', mssql.VarChar(100));
            ps.input('doj', mssql.Date);
            ps.input('terminationdate', mssql.Date);
            ps.input('deptId', mssql.Int);
            ps.input('isAdmin', mssql.Int);
            ps.input('password', mssql.VarChar(50));
            var queryString = "INSERT INTO [dbo].[Employees]([FirstName],[LastName],[Email],[DateOfJoining],[TerminationDate],[DepartmentId]) VALUES (@firstName, @lastName, @email, @doj, @terminationdate, @deptId); DECLARE @var int; SELECT @var = (SELECT @@IDENTITY); INSERT INTO [dbo].[Users]([EmployeeId],[Password],[IsAdmin]) VALUES (@var, @password, @isAdmin) ";
            var responseObj = {
                success: false,
                data: []
            };

            ps.prepare(queryString, function (err) {
                if (err) {
                    console.log('insert employee prepare error : ' + err);
                } else {
                    var params = {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        doj: doj,
                        terminationdate: terminationdate,
                        deptId: deptId,
                        isAdmin: isAdmin,
                        password: password,
                    };
                    ps.execute(params, function (err, data, numrows) {
                        if (err) {
                            console.log("Insert employee execute error : " + err);
                        } else {
                            responseObj.success = true;
                        }
                        res.send(JSON.stringify(responseObj));
                    });

                }
            });
        });
    return employeeRouter;
}