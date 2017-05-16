var express = require('express'),
    mssql = require('mssql'),
    path = require('path'),
    validator = require('validator'),
    loginRouter = express.Router();
module.exports = function () {
    loginRouter.route('/')
        .post(function (req, res) {
            var userId = req.body.userId;
            var pwd = req.body.password || "";
            var errorMsgs = validate(userId, pwd);
            if (errorMsgs.length != 0) {
                req.userSession.IsAuthenticated = false;
                req.userSession.IsAuthorised = false;
                req.userSession.user = null;
                req.userSession.IsAdmin = 0;
                req.userSession.error = errorMsgs;
                res.send(JSON.stringify(req.userSession));
                return;
            }


            var ps = new mssql.PreparedStatement();
            ps.input('userId', mssql.VarChar);
            ps.input('password', mssql.VarChar);
            ps.prepare('SELECT EMP.EmployeeId, EMP.Email, USR.IsAdmin ,USR.[Password], EMP.FirstName, EMP.LastName FROM dbo.Employees EMP JOIN dbo.Users USR ON EMP.EmployeeId = USR.EmployeeId WHERE EMP.Email = @userId AND Password =  @password COLLATE SQL_Latin1_General_CP1_CS_AS', function (err) {
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
                                req.userSession.errorMsgs = null;
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

    loginRouter.route('/template')
        .get(function (req, res) {
            res.sendFile(
                path.join(__dirname, '..\\..\\templates', 'login.hbs')
            );
        });
    return loginRouter;
}

function validate(userId, pwd) {
    var errorMsgs = [];
    if (validator.isEmpty(userId) || validator.isEmpty(pwd)) {
        errorMsgs.push("Both Username password required");
    } else if (pwd.length < 8 || pwd.length > 16) {
        errorMsgs.push("Password Should be 8 to 16 characters.");
    }

    if (!(validator.matches(pwd, '\d', 'g') && validator.matches(pwd, '[!@#$%^&*~?.]+', 'g') && validator.matches(pwd, '[a-z A-Z]', 'g'))) {
        errorMsgs.push("Password should contain one letter one number and one special character among (!, @, #, $, %, ^, &, *, ~, ?, .)")
    }
  /*  console.log("saad" + validator.matches(pwd, '[^0-9 a-z A-z !@#$%^&*~?.]', 'g'));
    if (validator.matches(pwd, '[^[0-9][a-z A-z]!@#$%^&*~?.]', 'g')) {
        errorMsgs.push("Only (!, @, #, $, %, ^, &, *, ~, ?, .) special characters are allowed");
    }*/
    return errorMsgs;
}