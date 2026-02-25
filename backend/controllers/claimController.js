const Claim = require("../models/Claim");

const createClaim = async (req, res, next) => {
  try {
    const claim = await Claim.create(req.body);
    res.status(201).json(claim);
  } catch (err) {
    next(err);
  }
};

const getClaims = async (_req, res, next) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createClaim,
  getClaims,
};