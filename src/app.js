import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app=express();

app.use(cors({
    origin:process.env.CROSS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true,limit:'16kb'}));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js"; //we can give custom names only when export is default
import tweetRouter from "./routes/tweet.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comments.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";




//routes declaration
app.use("/api/v1/users", userRouter); //good standard practice
//when this routes on url hits userRouter activates
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/dashboard",dashboardRouter);
app.use("/api/v1/healthcheck",healthCheckRouter);
app.use("/api/v1/likes",likeRouter);
app.use("/api/v1/playlist",playlistRouter);
app.use("/api/v1/subscription",subscriptionRouter);

export {app};