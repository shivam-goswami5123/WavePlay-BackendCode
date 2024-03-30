import {Router} from "express";
import {registerUser,loginUser,logoutUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/register").post(
    //data on multer from multiple fields
    upload.fields(
        [
            {
                name:"avatar", //same name of field in frontend
                maxCount:1
            },
            {
                name:"coverImage",
                maxCount:1
            }
        ]
    ),
    registerUser);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT,logoutUser);

// whenever /register in url hits it registerUser activates

export default router;