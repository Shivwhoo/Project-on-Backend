import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.model.js"

const router = Router();

router.route('/').get(healthcheck);

export default router