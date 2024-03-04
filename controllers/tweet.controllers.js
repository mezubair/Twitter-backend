
const Tweet = require("../models/tweet.model");
const User = require("../models/user.model");

exports.postTweet = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tweet } = req.body;
    const user = await User.findOne({ _id: userId });
    if(!user.emailVerified) return res.status(403).json("‼ you cant post tweets ! Verify your email first");

    const tweetCreated = await Tweet.create({
      userId: userId,
      tweet: tweet,
    });
    if (!tweetCreated) return res.status(401).json("❌ SMOMETHING WENT WRONG");
   return res.status(200).json({ tweet })
  } catch (error) {
    res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.getTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find().select(["tweet","-_id","userId","createdAt","comments","likes"]).sort({createdAt : -1});
    if (!tweets) {
      return res.status(200).json("its lonely here (no tweets found) check again later");
    }
    res.status(200).json(tweets);
  } catch (error) {
    res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.getMyTweets = async (req, res) => {
  try {
    const tweet = await Tweet.find({ userId: req.user.userId }).select([
      "tweet",
      "createdAt",
      "comments",
      "likes"
    ]).sort({createdAt : -1});
    if (!tweet)
      return res.status(200).json("no tweets found start by posting one");
    return res.status(200).json(tweet);
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
  
    if (TweetInfo.userId.toString() !== userId)
    return res
      .status(401)
      .json("⚠ YOU ARE NOT AUTHORIZED TO EDIT THIS TWEET");
    TweetInfo.tweet = tweet;
    await TweetInfo.save();
    res.status(201).json(TweetInfo);
  } catch (error) {
    res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.commentTweet = async (req , res) =>{
    try{
      const {comment} = req.body;
      const {tweetId} = req.params;
      const {userId}= req.user;

      const tweetInfo = await Tweet.findOne({_id : tweetId})
      if(!tweetInfo) return res.status(404).json({message: "No tweets found with this id"});

      tweetInfo.comments.push({ comment: comment, userId: userId });
    await tweetInfo.save();
    res.status(201).json({message: "comment added", data : tweetInfo})
  } catch (error) {
    
  }
};

exports.likeTweet = async (req, res) =>{

  try {
    const { tweetId } = req.params;
    const userId = req.user.userId.toString();
    
    const tweetInfo = await Tweet.findOne({ _id: tweetId });
    if (!tweetInfo) return res.status(404).json({ message: "No tweet found with this id" });

    const likedUserIds = tweetInfo.likes.map((like)=>{
return like.userId.toString()
    }) 
    const isUser = likedUserIds.includes(userId);
    
    
    if (isUser){
      tweetInfo.likes = tweetInfo.likes.filter((i)=>{
     return  i.userId.toString() !== userId
      })
      await tweetInfo.save();
      
      return res.status(200).json({ message: "You unliked the tweet" });
    } 

    tweetInfo.likes.push({ userId: userId });
    await tweetInfo.save();
    return res.status(200).json({ message: "You liked the tweet" });
} 
 catch (error) {
    res.status(500).json({error:"Internal Server Error"})
  }

}
exports.deleteTweet = async (req, res) => {
  try {
    const { userId } = req.user;
    const { tweetId } = req.params;

    const tweetInfo = await Tweet.findOne({ _id: tweetId });
    if (!tweetInfo) return res.status(404).json("NO TWEET FOUND");
    if (tweetInfo.userId.toString() !== userId)
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
