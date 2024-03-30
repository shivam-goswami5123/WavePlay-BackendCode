import {Router} from "express";
import {registerUser,loginUser,logoutUser,refreshAccessToken} from "../controllers/user.controller.js";
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
// whenever /register in url hits it registerUser activates

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);



export default router;