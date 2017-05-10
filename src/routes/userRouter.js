var express = require('express'),
    userRouter = express.Router(),
    mssql = require('mssql');

module.exports = function () {
    userRouter.route('/admins')
        .get(function (req, res) {
            var request = new mssql.Request();
            var queryString = '';
            // if (req.userSession.user.IsAdmin == true) {
                queryString = "SELECT [EmployeeId],[FirstName],[LastName] FROM [dbo].[Employees] WHERE [DepartmentId] = 1";

                request.query(queryString, function (err, recordset) {
                    if (err) {
                        console.log('Here is the err \n ' + err);
                    } else {
                        var adminUsers = JSON.parse(JSON.stringify(recordset.recordset));
                        adminUsers = adminUsers.map(function (adminUser) {
                            var obj = {
                                empId : adminUser.EmployeeId,
                                firstName : adminUser.FirstName,
                                lastName : adminUser.LastName
                            };
                            return obj;
                        });
                        var rv = {};
                        rv.adminUsers = adminUsers;
                        res.send(JSON.stringify(rv));
                    }
                });
            // }
        })
        .put(function (req, res) {

        })
        .post(function (req, res) {

        })
        .delete(function (req, res) {

        });
    return userRouter;
};