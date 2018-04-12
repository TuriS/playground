const express = require('express');
const router = express.Router();
const auth = require('../modules/toolkits/authToolkit');
const secured = auth.secured();

router.get('/', /*secured,*/ function(req, res, next) {
    res.send("api root");
});

module.exports = router;