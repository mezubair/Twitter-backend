const mongoose = require("mongoose");

const commentReplySchema = new mongoose.Schema({
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reply: {
    type: String,
  },
});

const CommentReply = mongoose.model("CommentReply", commentReplySchema);

module.exports = CommentReply;
