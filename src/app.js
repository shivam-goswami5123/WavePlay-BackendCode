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

//routes declaration
app.use("/api/v1/users", userRouter); //good standard practice
//when this routes on url hits userRouter activates

export {app};