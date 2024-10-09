import { addDays, addHours } from "date-fns";
import { Conference } from "../entities/conference.entity";
import { testUsers } from "./test-users";


export const testConference = {
    conference1 : new Conference({
        id: 'id-1',
        title: "My first conference",
        organizerId: testUsers.johnDoe.props.id,
        seats: 100,
        startDate: addDays(new Date(), 4),
        endDate: addDays(addHours(new Date(), 2), 4)
    }),
    conferenceWithFewSeats: new Conference({
        id: 'id-2',
        title: "Conference with few seats",
        organizerId: testUsers.johnDoe.props.id,
        seats: 1,
        startDate: addDays(new Date(), 4),
        endDate: addDays(addHours(new Date(), 2), 4)
    })
}