const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({

    tweetId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Tweet"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
    },
    reply : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "CommentReply"
    },
  },{timestamps : true,versionKey : false});
  

  const Comment = mongoose.model("Comment",commentsSchema)
  module.exports = Comment