const express = require ("express");
const mongoose = require ("mongoose");
const userRoutes = require("./routes/user.routes")
const tweetRoutes = require("./routes/tweet.routes")

const app = express();
app.use(express.json());



mongoose.connect("mongodb://localhost:27017/Twitter",{
    useNewUrlParser : true,
    useUnifiedTopology:true
}).then(()=>{
    console.log('====================================');
    console.log("MongoDB connected");
    console.log('====================================');
}).catch((error)=>{
    console.log('====================================');
    console.log("Oh hooo something went wrong ",error);
    console.log('====================================');
})

app.use("/user",userRoutes);
app.use("/",tweetRoutes);


app.listen(3001,()=>{
    console.log('====================================');
    console.log("Server started and is running on port 3001");
    console.log('====================================');
})