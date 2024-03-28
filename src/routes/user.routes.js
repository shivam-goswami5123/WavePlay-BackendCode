import {Router} from "express";
import {registerUser} from "../controllers/user.controller.js";

const router=Router();

router.route("/register").post(registerUser);

// whenever /register in url hits it registerUser activates

export default router;