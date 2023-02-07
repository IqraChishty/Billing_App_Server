var jwt = require("jsonwebtoken");
require("dotenv").config();

const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(401)
      .send({ errors: [{ msg: "No token present" }] });
  }
  try {
    const data = jwt.verify(token, process.env.ACCESS_SECTRET_TOKEN);
    req.id = data.id;
    next();
  } catch (error) {
    res
      .status(401)
      .send({ errors: [{ msg: "Please authenticate using a valid token" }] });
  }
};
module.exports = fetchuser;
