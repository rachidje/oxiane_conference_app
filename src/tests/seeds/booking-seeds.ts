import { Booking } from "../../conference/entities/booking.entity";
import { BookingFixture } from "../fixtures/booking-fixture";
import { e2eConferences } from "./conference-seeds";
import { e2eUsers } from "./user-seeds";


export const e2eBookings = {
    aliceBooking: new BookingFixture(
        new Booking({
            id: 'booking-1',
            userId: e2eUsers.alice.entity.props.id,
            conferenceId: e2eConferences.conference1.entity.props.id
        })
    )
}