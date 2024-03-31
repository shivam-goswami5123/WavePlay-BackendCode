import {Router} from "express";
import {registerUser,loginUser,logoutUser,refreshAccessToken,changeUserPassword,getCurrentUser
    ,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,
    getWatchHistory} from "../controllers/user.controller.js";
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
router.route("/change-password").post(verifyJWT,changeUserPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account-details").patch(verifyJWT,updateAccountDetails); //patch route because needs to update only few fields
router.route("/update-avatar").patch(
    verifyJWT, //firstly user should be loggedIn then update avatar
    upload.single("avatar"), //want to upload single file (not used upload.fields() as above)
    updateUserAvatar);
router.route("/update-coverimage").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage);

//getting information from url : from req.params
router.route("/c/:username").get(verifyJWT,getUserChannelProfile); 
router.route("/watch-history").get(verifyJWT,getWatchHistory);



export default router;