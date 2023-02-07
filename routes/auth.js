require("dotenv").config();
const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

router.post(
  "/signup",
  [
    body("name", "Name must be atleast 3 chars long").isLength({ min: 3 }),
    body("email", "Enter valid email").isEmail(),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 chars long")
      .matches(/\d/)
      .withMessage("Password must contain atleast 1 digit"),
    body("confirmPassword", "Password must match")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords do not match"),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, errors: [{ msg: "Email already exists" }] });
      }

      const salt = await bcrypt.genSalt(10);
      let hashedPassword = await bcrypt.hash(req.body.password, salt);

      await User.create({
        name: req.body.name,
        password: hashedPassword,
        email: req.body.email,
      });

      success = true;
      res.status(200).json({ success, msg: "User created successfully!" });
    } catch (error) {
      res
        .status(500)
        .json({ success, errors: [{ msg: "Internal Server Error" }] });
    }
  }
);
router.post(
  "/login",
  [
    body("email", "Enter valid email").isEmail(),
    body("password", "Passord cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      // 1. Return if requested email does not exists
      if (!user) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Please try to login with correct credentials" }],
        });
      }

      //2. Check if the password matches the email
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Please try to login with correct credentials" }],
        });
      }
      success = true;
      const payload = {
        id: user.id,
      };
      const authToken = jwt.sign(payload, process.env.ACCESS_SECTRET_TOKEN);
      res.status(200).json({ success, authToken });
    } catch (error) {
      res
        .status(500)
        .json({ success, errors: [{ msg: "Internal Server Error" }] });
    }
  }
);

router.get("/getuser", fetchuser, async (req, res) => {
  let success = false;
  try {
    let userId = req.id;
    //find user by id in the database and select everything except password
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({
        success,
        errors: [{ msg: "Unable to get user details" }],
      });
    }
    success = true;
    res.json({ success, user });
  } catch (error) {
    res
      .status(500)
      .json({ success, errors: [{ msg: "Internal Server Error" }] });
  }
});
module.exports = router;
