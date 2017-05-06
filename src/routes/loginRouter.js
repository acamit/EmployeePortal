var express = require('express');
var mssql = require('mssql');
var loginRouter = express.Router();
module.exports = function () {
    loginRouter.route('/')
        .post(function (req, res) {
            var userId = req.body.userId;
            var pwd = req.body.password;
            var ps = new mssql.PreparedStatement();
            ps.input('userId', mssql.VarChar);
            ps.input('password', mssql.VarChar);
            ps.prepare('SELECT EMP.EmployeeId, EMP.Email, USR.IsAdmin , EMP.FirstName, EMP.LastName FROM dbo.Employees EMP JOIN dbo.Users USR ON	EMP.EmployeeId = USR.EmployeeId WHERE EMP.Email = @userId AND Password =  @password COLLATE SQL_Latin1_General_CP1_CS_AS', function (err) {
                // ps.prepare('SELECT * FROM [Users] where UserId=@userId AND Password=@password', function (err) {
                if (err) {
                    console.log("error in login router" + err);
                } else {
                    ps.execute({
                        userId: userId,
                        password: pwd
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            // console.log(data);
                            if (data.recordset.length == 1) {
                                req.userSession.IsAuthenticated = true;
                                req.userSession.IsAuthorised = false;
                                req.userSession.user = data.recordset[0];
                                req.userSession.IsAdmin = data.recordset[0].IsAdmin;
                                res.send(JSON.stringify(req.userSession));
                            } else {
                                req.userSession.IsAuthenticated = false;
                                req.userSession.IsAuthorised = false;
                                req.userSession.user = null;
                                req.userSession.IsAdmin = 0;
                                res.send(JSON.stringify(req.userSession));
                            }
                        }
                    });
                }
            });
        });
    return loginRouter;
}