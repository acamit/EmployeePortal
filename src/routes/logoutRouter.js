var express = require('express');
var mssql = require('mssql');
var logoutRouter = express.Router();
module.exports = function () {
    logoutRouter.route('/')
        .post(function (req, res) {

            if (req.cookies && req.cookies['sessionId']) {
                delete global.sessions[req.cookies['sessionId']]
            }
            res.send({
                success:true,
                error:null
            });
        });
    return logoutRouter;
}