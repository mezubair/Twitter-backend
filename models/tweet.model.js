const mongoose = require("mongoose");


const commentsSchema = new mongoose.Schema({
  comment: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const likeSchema = new mongoose.Schema({
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
    
    likes :[likeSchema],
    comments: [commentsSchema],
  },
  { timestamps: true }
);

const Tweet = mongoose.model("Tweet", tweetSchema);

module.exports = Tweet;
