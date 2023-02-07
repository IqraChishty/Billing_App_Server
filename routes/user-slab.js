require("dotenv").config();
const express = require("express");
const router = new express.Router();
const Slab = require("../models/slabs");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");

router.post(
  "/createslab",
  [body("slabValues", "Slab must have exactly 4 values").isArray({ min: 4, max: 4 })],
  fetchuser,
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      let userId = req.id;
      const { slabValues } = req.body;
      await Slab.create({
        userId: userId,
        slabValues,
      });
      success = true;
      res.status(200).json({ success, msg: "Slab created successfully!" });
    } catch (error) {
      res
        .status(500)
        .json({ success, errors: { msg: "Internal Server Error" } });
    }
  }
);
router.get("/getslabs", fetchuser, async (req, res) => {
  let success = false;
  try {
    let userId = req.id;
    const user = await Slab.find({userId:userId});
    let userSlabs = user.map((slab)=>{
      return {slabId: slab._id,slabValues: slab.slabValues}
    })
    success = true;
    res.status(200).json({ success, userSlabs });
  } catch (error) {
    res.status(500).json({ success, errors: { msg: "Internal Server Error" } });
  }
});
module.exports = router;
