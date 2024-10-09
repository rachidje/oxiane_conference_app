import { addDays, addHours } from "date-fns";
import { ConferenceFixture } from "../fixtures/conference-fixture";
import { e2eUsers } from "./user-seeds";
import { Conference } from "../../conference/entities/conference.entity";


export const e2eConferences = {
    conference1 : new ConferenceFixture(
        new Conference({
            id: 'id-1',
            title: "My first conference",
            organizerId: e2eUsers.johnDoe.entity.props.id,
            seats: 100,
            startDate: addDays(new Date(), 4),
            endDate: addDays(addHours(new Date(), 2), 4)
        })
    )
}