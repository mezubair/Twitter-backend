const Tweet = require("../models/tweet.model");
const User = require("../models/user.model");
const Comment = require ("../models/comment.model");
const CommentReply = require("../models/commentReply.model");

exports.postTweet = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("🚀 ~ exports.postTweet= ~ userId:", userId)
    console.log("🚀 ~ exports.postTweet= ~ userId:", userId)
    const { tweet } = req.body;
    const user = await User.findOne({ _id: userId });
    console.log("🚀 ~ exports.postTweet= ~ userId:", userId)
    if (!user.emailVerified)return res.status(403).json("‼ you cant post tweets ! Verify your email first");

    const tweetCreated = await Tweet.create({
      userId: userId,
      tweet: tweet,
    });
      console.log("🚀 ~ exports.postTweet= ~ userId:", userId)
      console.log("🚀 ~ exports.postTweet= ~ userId:", userId)
    if (!tweetCreated) return res.status(401).json({message: "❌ SMOMETHING WENT WRONG"});
    return res.status(200).json({ tweet });
  } catch (error) {
    res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.getTweets = async (req, res) => {
  try {
    const userIds = await Tweet.find().distinct("userId");
    if (!userIds.length)return res.status(404).json({ message: "no tweets found check again later" });

    const publicAccounts = (await User.find({ _id: { $in: userIds } })).filter(
      (i) => i.accountMode === "public"
    );
    if (!publicAccounts) return res.status(404).json({ message: "no tweets found check again later" });
    const publicAccountIds = publicAccounts.map((i) => i._id);

    const publicTweets = await Tweet.find({ userId: publicAccountIds })
    .populate({
      path : "comments",
      select :"comment"
    });
    return res.status(200).json({data : publicTweets});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "INTERNAL SERVER ERROR"});
  }
};

exports.getMyTweets = async (req, res) => {
  try {
    const tweet = await Tweet.find({ userId: req.user.userId }).sort({ createdAt: -1 })
    .populate({
      path: "comments",
      select: "comment userId"
    });
    if (!tweet) return res.status(200).json("no tweets found start by posting one");
    return res.status(200).json({data : tweet, totallikes : tweet.likes.length});
  } catch (error) {
    res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.editTweet = async (req, res) => {
  try {
    const { userId } = req.user;
    const { tweet } = req.body;
    const TweetInfo = await Tweet.findOne({ _id: req.params.tweetId });
    if (!TweetInfo) return res.status(404).json("NO TWEETS FOUND");

    if (TweetInfo.userId.toString() !== userId)return res.status(401).json("⚠ YOU ARE NOT AUTHORIZED TO EDIT THIS TWEET");
    TweetInfo.tweet = tweet;
    await TweetInfo.save();
    res.status(201).json(TweetInfo);
  } catch (error) {
    res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.commentTweet = async (req, res) => {
  try {
    const { comment } = req.body;
    const { tweetId } = req.params;
    const { userId } = req.user;

    const tweetInfo = await Tweet.findOne({ _id: tweetId });
   !tweetInfo && res.status(404).json({ message: "No tweets found with this id" });

   const tweet = await Comment.create({tweetId,userId,comment})
   console.log("🚀 ~ exports.commentTweet= ~ tweet:", tweet)
    res.status(201).json({ message: "comment added", data: tweet });
  } catch (error) {}
};

exports.commentReply = async (req, res) =>{
  try {
    const {commentId} = req.params;
    const {reply} = req.body;
    const isComment = await Comment.findOne({commentId});
    !isComment && res.status(404).json({message : 'no comment found invalid comment id'});
    const repycomment = await CommentReply.create({reply,userId: req.user.userId,commentId});
    res.status(201).json({replycomment});

  } catch (error) {
    res.status(500).json({error : "internal server error"})
  }
}

exports.likeTweet = async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user.userId.toString();

    const tweetInfo = await Tweet.findOne({ _id: tweetId });
    if (!tweetInfo) return res.status(404).json({ message: "No tweet found with this id" });

    const isDisliked = tweetInfo.dislikes.map(i => i.userId.toString());
    if(isDisliked.includes(req.user.userId)){
    return  res.status(200).json({message : "You have disliked this tweet, can't like"});
  }

    const isUser = tweetInfo.likes.some(like => like.userId.toString() === userId);

    if (isUser) {
      tweetInfo.likes = tweetInfo.likes.filter(i => i.userId.toString() !== userId);
      await tweetInfo.save();
      return res.status(200).json({ message: "You unliked the tweet" });
    }

    tweetInfo.likes.push({ userId: userId });
    await tweetInfo.save();
    return res.status(200).json({ message: "You liked the tweet" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.dislikes = async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user.userId;

    const tweetInfo = await Tweet.findOne({ _id: tweetId });
    if (!tweetInfo) {
      return res.status(404).json({ message: "No tweet found" });
    }

    const tweetLikes = tweetInfo.likes.map(i => i.userId);
    if (tweetLikes.includes(userId)) {
      return res.status(200).json({ message: "You've already liked this tweet, can't dislike." });
    }
    const tweetDislikes = tweetInfo.dislikes.map(i => i.userId.toString());
    console.log("🚀 ~ exports.dislikes= ~ tweetDislikes:", tweetDislikes)
    
    if (tweetDislikes.includes(req.user.userId)) {
      return res.status(200).json({ message: "You've already disliked this tweet, can't dislike again." });
    }

    tweetInfo.dislikes.push({ userId: req.user.userId });
    await tweetInfo.save();
    
    return res.status(200).json({ message: "You disliked this tweet" });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.commentReply =async (req,res)=>{
  try {

    const {commentId} = req.params;
    const {userId} = req.user;
    const {reply} = req.body;

    const commentReply = await CommentReply.create({commentId,userId,reply});

    res.status(201).json({message : " reply addded" , data : commentReply});
  } catch (error) {
   res.status(500).json({error : "Internal Server Error "})    
  }
}

exports.deleteTweet = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("🚀 ~ exports.deleteTweet ~ userId:", userId)
    const { tweetId } = req.params;

    const tweetInfo = await Tweet.findOne({ _id: tweetId });
    if (!tweetInfo) return res.status(404).json("NO TWEET FOUND");
    if (tweetInfo.userId.toString() !== userId)
      console.log("🚀 ~ exports.deleteTweet ~ userId:", userId)
      console.log("🚀 ~ exports.deleteTweet ~ userId:", userId)
      return res
        .status(401)
        .json("⚠ YOU ARE NOT AUTHORIZED TO DELETE THIS TWEET");

    const deletedtweet = await Tweet.findOneAndDelete({ _id: tweetId });
    if (!deletedtweet) return res.status(500).json("ERROR DELETING TWEET");
    res.status(200).json("TWEET DELEETD");
  } catch (error) {
    res.status(500).json("INTERNAL SERVER ERROR");
  }
};
