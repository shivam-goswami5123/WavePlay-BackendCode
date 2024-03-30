import dotenv from "dotenv";
import connectDB from "./db/index.db.js";
import {app} from "./app.js";

//require('dotenv').config({path:'./env'});

dotenv.config({path:'./.env'});





connectDB() //it returns a promise as it is async function
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is listening at port:${process.env.PORT}`);
    });
})
.catch((err)=>{
    console.log("Database Connection Failed: ",err);
})





















/*
const app=express();
;( async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("ERROR: ",error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening at port:${process.env.PORT}`);
        })
    }
    catch(error){
        console.error("ERROR: ",error);
        throw error;
    }
})();
*/