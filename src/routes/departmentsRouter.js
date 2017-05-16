var express = require('express');
var date = require('date-and-time');
var validator = require('validator');
var path = require('path');
var deptRouter = express.Router();
module.exports = function () {

    deptRouter.route('/')
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
    /*  .put(function (req, res) {

      })
      .post(function (req, res) {

      })
      .delete(function (req, res) {

      })*/

    return deptRouter;
}