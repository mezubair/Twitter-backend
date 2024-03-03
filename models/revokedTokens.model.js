const mongoose = require("mongoose");

const revTokensSchema = new mongoose.Schema({
  revTokens: String,
});

const RevToken = mongoose.model("RevToken", revTokensSchema);

module.exports = RevToken;
