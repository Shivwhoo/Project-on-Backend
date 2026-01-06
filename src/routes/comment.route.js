import { Router } from "express";
import {getVideoComments,addComment,updateComment,deleteComment} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware";

const router=Router()

router.use(verifyJWT)

router.route("/comment/c/:videoId").get(getVideoComments)
router.route("/comment/c/:videoId").post(addComment)
router.route("/comment/c/:commentId").patch(updateComment)
router.route("/comment/c/:commentId").delete(deleteComment)

export default router