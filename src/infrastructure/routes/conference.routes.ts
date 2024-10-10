import { Router } from "express";
import resolveDependency from "../config/dependecy-injection";
import { bookSeat, changeDates, changeSeats, createConference } from "../controllers/conference.controllers";
import { isAuthenticated } from "../middlewares/authenticator.middleware";

const router = Router()

router.use(isAuthenticated)
router.post('/conference', createConference(resolveDependency))
router.patch('/conference/dates/:conferenceId', changeDates(resolveDependency))
router.patch('/conference/seats/:conferenceId', changeSeats(resolveDependency))
router.post('/conference/book/:conferenceId', bookSeat(resolveDependency))

export default router;