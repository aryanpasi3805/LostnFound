const express = require("express");
const router = express.Router();
const { createClaim, getClaims } = require("../controllers/claimController");

router.route("/").get(getClaims).post(createClaim);

module.exports = router; 