const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  userId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  }
})

const dislikeSchema = new mongoose.Schema({
  userId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  }
})


const tweetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tweet: {
      type: String,
      required: [true, "Tweet can't be empty"],
    },
    comments : [{
      type : mongoose.Schema.Types.ObjectId,
      ref: "Comment"

    }],
    likes :[likeSchema],
    dislikes : [dislikeSchema],
  },
  { timestamps: true }
);

const Tweet = mongoose.model("Tweet", tweetSchema);

module.exports = Tweet;
