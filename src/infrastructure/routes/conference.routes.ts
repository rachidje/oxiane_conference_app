import { Router } from "express";
import container from "../config/dependecy-injection";
import { bookSeat, cancelBooking, cancelConference, changeDates, changeSeats, createConference } from "../controllers/conference.controllers";
import { isAuthenticated } from "../middlewares/authenticator.middleware";

const router = Router()

router.use(isAuthenticated)
router.post('', createConference(container))
router.patch('/dates/:conferenceId', changeDates(container))
router.patch('/seats/:conferenceId', changeSeats(container))
router.post('/book/:conferenceId', bookSeat(container))

router.delete('/:conferenceId', cancelConference(container))
router.delete('/book/:conferenceId', cancelBooking(container))

export default router;