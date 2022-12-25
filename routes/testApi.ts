var express = require("express");
var router = express.Router();

router.get("/", function(req: any, res: any, next: any) {
    res.send("API is working properly");
});

module.exports = router