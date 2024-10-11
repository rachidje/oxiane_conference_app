import { Router } from "express";
import container from "../config/dependecy-injection";
import { bookSeat, cancelBooking, cancelConference, changeDates, changeSeats, createConference } from "../controllers/conference.controllers";
import { isAuthenticated } from "../middlewares/authenticator.middleware";

const router = Router()

router.use(isAuthenticated)
router.post('/conference', createConference(container))
router.patch('/conference/dates/:conferenceId', changeDates(container))
router.patch('/conference/seats/:conferenceId', changeSeats(container))
router.post('/conference/book/:conferenceId', bookSeat(container))

router.delete('/conference/:conferenceId', cancelConference(container))
router.delete('/conference/book/:conferenceId', cancelBooking(container))

export default router;