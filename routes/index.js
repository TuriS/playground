const express = require('express');
const router = express.Router();
const auth = require('../modules/toolkits/authToolkit');
const secured = auth.secured();

router.get('/', secured, function(req, res, next) {
    res.render("index", {title: "Playground"});
});

router.get('/login', (req, res, next) => {
    res.render("login");
});

router.post('/login', auth.login, (req, res, next) => {
    res.redirect('/');
});

router.get('/logout', secured, auth.logout, (req, res, next) => {
    res.redirect(req.app.locals.basePath + '/');
});

module.exports = router;
