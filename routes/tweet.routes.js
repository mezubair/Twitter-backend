const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {postTweet, getTweets, getMyTweets,editTweet,deleteTweet,commentTweet,likeTweet} = require("../controllers/tweet.controllers");

const router=express.Router();

router.use(authMiddleware);

router.post("/posttweet",postTweet);
router.get("/getalltweets",getTweets);
router.get("/gettweet",getMyTweets);
router.put("/edittweet/:tweetId",editTweet);
router.put("/comment-tweet/:tweetId",commentTweet);
router.put("/like-tweet/:tweetId",likeTweet);

router.delete("/deletetweet/:tweetId",deleteTweet);



module.exports = router;