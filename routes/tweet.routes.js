const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {postTweet, getTweets, getMyTweets,editTweet,deleteTweet,commentTweet,likeTweet, dislikes,commentReply} = require("../controllers/tweet.controllers");

const router=express.Router();

router.use(authMiddleware);

router.post("/posttweet",postTweet);
router.get("/getalltweets",getTweets);
router.get("/gettweet",getMyTweets);
router.put("/edittweet/:tweetId",editTweet);
router.post("/comment-tweet/:tweetId",commentTweet);
router.put("/like-tweet/:tweetId",likeTweet);
router.put("/dislike/:tweetId",dislikes);
router.post("/reply-comment/:commentId",commentReply);
router.delete("/deletetweet/:tweetId",deleteTweet);



module.exports = router;