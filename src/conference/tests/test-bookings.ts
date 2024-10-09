import { Booking } from "../entities/booking.entity";
import { testConference } from "./test-conferences";
import { testUsers } from "./test-users";


export const testBookings = {
    aliceBooking: new Booking({
        id: 'id-1',
        userId: testUsers.alice.props.id,
        conferenceId: testConference.conference1.props.id
    }),
    bobBooking: new Booking({
        id: 'id-2',
        userId: testUsers.bob.props.id,
        conferenceId: testConference.conference1.props.id
    }),
    charlesBooking: new Booking({
        id: 'id-3',
        userId: testUsers.charles.props.id,
        conferenceId: testConference.conferenceWithFewSeats.props.id
    })
}