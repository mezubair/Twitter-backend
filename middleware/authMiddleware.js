const jwt = require("jsonwebtoken");
const RevToken = require("../models/revokedTokens.model")
require("dotenv").config();

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      console.log("Authorization header missing");
      return res.status(401).json("Authorization header missing");
    }
    if(await RevToken.findOne({revTokens:token})) return res.status(401).json("SESSION EXPIRED PLEASE LOG-IN AGAIN ")
    jwt.verify(token, process.env.MY_SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(500).json("Internal server error");
  }
}

module.exports = authMiddleware;
