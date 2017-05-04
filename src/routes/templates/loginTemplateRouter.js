var express = require('express');
var path = require('path');
var loginTemplateRouter = express.Router();
module.exports = function(){
    loginTemplateRouter.route('/')
                        .get(function(req, res){
                            res.sendFile(
                                path.join(__dirname, '..\\..\\..\\templates', 'login.hbs')
                            );
                        });
    return loginTemplateRouter;
}