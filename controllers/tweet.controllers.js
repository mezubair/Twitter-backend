const Tweet = require("../models/tweet.model");
const User = require("../models/user.model");
const Comment = require ("../models/comment.model");
const CommentReply = require("../models/commentReply.model");


exports.postTweet = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tweet } = req.body;
    const user = await User.findOne({ _id: userId });
    if (!user.emailVerified)return res.status(403).json({message:"‼ You Can't Post Tweets ! Verify your email first"});

    const tweetCreated = await Tweet.create({
      userId: userId,
      tweet: tweet,
    });
    if (!tweetCreated) return res.status(401).json({message: "❌ SMOMETHING WENT WRONG"});
    return res.status(200).json({ tweetCreated });
  } catch (error) {
    res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.getTweets = async (req, res) => {
  try {
    const userIds = await Tweet.distinct("userId");

    if (!userIds.length)
      return res.status(404).json({ message: "No tweets found. Check again later." });

    const publicAccounts = await User.find({ _id: { $in: userIds }, accountMode: "public" });
    const publicAccountIds = publicAccounts.map(i => i._id);    

    const privateAccounts = await User.find({ _id: { $in: userIds }, accountMode: "private" });
    const privateAccountIds = privateAccounts
    .filter(account => account.followers.some(followedUser => followedUser.userId.toString() === req.user.userId))
    .map(account => account._id);


    const tweets = await Tweet.find({userId: {$in: [...publicAccountIds, ...privateAccountIds]}})
    .populate({
                path: "comment",
                select: "comment -_id",
                populate: {
                        path: "reply",
                        select: "reply -_id"
                         }
              })
    return res.status(200).json({ data: tweets });
  }
   catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMyTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    console.log(tweets);
    if (tweets.length === 0) {
      return res.status(200).json({message : "No tweets found. Start by posting one."});
    }
    return res.status(200).json({ data: tweets });
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error. Please try again later.");
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
   tweetInfo.comment.push(tweet._id)
   await tweetInfo.save();
    res.status(201).json({ message: "comment added", data: tweet });
  } catch (error) {}
};

exports.commentReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reply } = req.body;
   
    const isComment = await Comment.findById(commentId);
 
    if (!isComment) return res.status(404).json({ message: 'No comment found with this id' });
    
    const newReply = await CommentReply.create({ reply, userId: req.user.userId, commentId });
  
    isComment.reply.push(newReply._id);
    await isComment.save();
    
    res.status(201).json({ message: 'Reply added', data: newReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

    const tweetLikes = tweetInfo.likes.map(i => i.userId.toString());
    if (tweetLikes.includes(userId)) {
      return res.status(200).json({ message: "You've already liked this tweet, can't dislike." });
    }

    const tweetDislikes = tweetInfo.dislikes.map(i => i.userId.toString());
    if (tweetDislikes.includes(userId)) {
      return res.status(200).json({ message: "You've already disliked this tweet, can't dislike again." });
    }

    tweetInfo.dislikes.push({ userId: userId });
    await tweetInfo.save();
    
    return res.status(200).json({ message: "You disliked this tweet" });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteTweet = async (req, res) => {
  try {
    const { userId } = req.user;
    const { tweetId } = req.params;

    const tweetInfo = await Tweet.findOne({ _id: tweetId });
    if (!tweetInfo) return res.status(404).json({ message: "No tweet found" });
    if (tweetInfo.userId.toString() !== userId) {
      return res.status(403).json({ message: "⚠ You are not authorized to delete this tweet" });
    }
    await Promise.all([
      Tweet.findOneAndDelete({ _id: tweetId }),
      Comment.deleteMany({ tweetId: tweetId }),
      CommentReply.deleteMany({ commentId: { $in: tweetInfo.comment } })
    ]);

    return res.status(200).json({ message: "Tweet and associated comments deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

