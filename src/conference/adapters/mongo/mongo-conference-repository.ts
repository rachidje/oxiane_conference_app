import { Model } from "mongoose";
import { MongoConference } from "./mongo-conference";
import { Conference } from "../../entities/conference.entity";
import { IConferenceRepository } from "../../ports/conference-repository.interface";

class ConferenceMapper {
    toCore(conferenceDoc: MongoConference.ConferenceDocument) : Conference {
        return new Conference({
            id: conferenceDoc._id,
            organizerId: conferenceDoc.organizerId,
            title: conferenceDoc.title,
            startDate: conferenceDoc.startDate,
            endDate: conferenceDoc.endDate,
            seats: conferenceDoc.seats
        })
    }

    toPersistence(conference: Conference) : MongoConference.ConferenceDocument {
        return new MongoConference.ConferenceModel({
            _id: conference.props.id,
            organizerId: conference.props.organizerId,
            title: conference.props.title,
            startDate: conference.props.startDate,
            endDate: conference.props.endDate,
            seats: conference.props.seats
        })
    }
}


export class MongoConferenceRepository implements IConferenceRepository {

    private readonly mapper = new ConferenceMapper()

    constructor(
        private readonly model: Model<MongoConference.ConferenceDocument>
    ) {}

    async create(conference: Conference): Promise<void> {
        const conferenceDoc = this.mapper.toPersistence(conference)
        await conferenceDoc.save()
    }

    async findById(id: string): Promise<Conference | null> {
        const conference = await this.model.findOne({_id: id})

        if(!conference) return null;

        return this.mapper.toCore(conference)
    }

    async update(conference: Conference): Promise<void> {
        const conferenceDoc = this.mapper.toPersistence(conference)
        await this.model.updateOne({_id: conference.props.id}, conferenceDoc)
    }
}