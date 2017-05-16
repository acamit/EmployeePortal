var express = require('express');
var date = require('date-and-time');
var path = require('path');
var validator = require('validator');
var mssql = require('mssql');
var profileRouter = express.Router();
module.exports = function () {

    profileRouter.route('/')
        .get(function (req, res) {
            console.log(req.userSession);
            var responseObj = {
                success: false,
                data: {},
            };
            var ps = new mssql.PreparedStatement();
            ps.input('id', mssql.Int);
            var queryString = "SELECT EMP.FirstName, EMP.LastName, DEPT.DepartmentId, DEPT.DepartmentName FROM dbo.Employees EMP JOIN dbo.Departments DEPT ON EMP.DepartmentId = DEPT.DepartmentId WHERE EMP.EmployeeId = @id";
            ps.prepare(queryString, function (err) {
                if (err) {
                    console.log('profile query prepare error: ' + err);
                } else {
                    ps.execute({
                        id: req.userSession.user.EmployeeId
                    }, function (err, data) {
                        if (err) {
                            console.log('profile query execute error : ' + err);
                        } else {
                            console.log(data);
                            var userDetails = data.recordset.map(function (user) {
                                var obj = {
                                    firstName: user.FirstName,
                                    lastName: user.LastName,
                                    deptId: user.DepartmentId,
                                    deptName: user.DepartmentName
                                }
                                return obj;
                            });
                            console.log(userDetails);
                            responseObj.data = userDetails[0];
                        }
                        res.send(JSON.stringify(responseObj));

                    });
                }
            });
        })
        .put(function (req, res) {

            var profileFirstName = req.body.profileFirstName,
                profileLastName = req.body.profileLastName,
                profileDepartmentSelect = req.body.profileDepartmentSelect,
                profileOldPassword = req.body.profileOldPassword,
                profileNewPassword = req.body.profileNewPassword,
                profileConfirmPassword = req.body.profileConfirmPassword;

            var responseObj = {
                success: false,
                error: null
            }
            var errMsg = "";
            //validation checks
            if (profileOldPassword) {
                if(profileOldPassword!=req.userSession.user.Password){
                    errMsg +="Old password is incorrect";
                }
                if (profileNewPassword != profileConfirmPassword) {
                    errMsg += "<br/>New passwords should match";
                }
            } else {
                if (profileNewPassword || profileConfirmPassword) {
                    errMsg += "<br/>Old password is required for changing password";
                }
            }

            //if no errors
            if (!errMsg) {
                var ps = new mssql.PreparedStatement();
                ps.input('profileFirstName', mssql.VarChar);
                ps.input('profileLastName', mssql.VarChar);
                ps.input('profileDepartmentSelect', mssql.Int);
                ps.input('profileOldPassword', mssql.VarChar);
                ps.input('profileNewPassword', mssql.VarChar);
                var params = {
                    profileFirstName: profileFirstName,
                    profileLastName: profileLastName,
                    profileDepartmentSelect: profileDepartmentSelect,
                    profileOldPassword: profileOldPassword,
                    profileNewPassword: profileNewPassword
                }
                var queryString;

                if (profileOldPassword) {
                    queryString = "UPDATE [dbo].[Employees] SET [FirstName] = @profileFirstName ,[LastName] = @profileLastName WHERE [EmployeeId]=" + req.userSession.user.EmployeeId + ";UPDATE [dbo].[Users] SET [Password] =@profileNewPassword WHERE [EmployeeId] = " + req.userSession.user.EmployeeId;
                } else {
                    queryString = "UPDATE [dbo].[Employees]   SET [FirstName] = @profileFirstName,[LastName] = @profileLastName WHERE [EmployeeId]=" + req.userSession.user.EmployeeId;
                }
                ps.prepare(queryString, function (err) {
                    if (err) {
                        console.log("error preparing profile update query" + err);
                        errMsg += "<br/>Internal Error. Please try again later";

                    } else {
                        ps.execute(params, function (err, data) {
                            if (err) {
                                console.log("error executing profile update query" + err);
                                errMsg += "<br/>Internal Error. Please try again later";
                            }else{
                                console.log(data);
                                responseObj.success=true;
                                res.send(JSON.stringify(responseObj));
                            }
                        });
                    }
                });
            } else {
                responseObj.error={
                    message :errMsg
                }
                res.send(JSON.stringify(responseObj));
            }
        })
        .post(function (req, res) {

        })
        .delete(function (req, res) {

        })

    profileRouter.route('/template')
        .get(function (req, res) {
            res.sendFile(
                path.join(
                    __dirname,
                    '..\\..\\templates',
                    'profile.hbs'));
        });

    return profileRouter;
}