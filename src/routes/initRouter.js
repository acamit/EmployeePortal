var express = require('express');
var initRouter = express.Router();
module.exports = function () {
    initRouter.route('/')
        .get(function (req, res) {
            res.send({
               /* IsAuthenticated: req.userSession.IsAuthenticated,
                IsAuthorised: req.userSession.IsAuthorised,
                userName: req.userSession.user.Name*/
            });
        })
    return initRouter;
};