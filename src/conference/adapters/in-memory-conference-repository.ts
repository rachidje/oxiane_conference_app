import { Conference } from "../entities/conference.entity";
import { IConferenceRepository } from "../ports/conference-repository.interface";

export class InMemoryConferenceRepository implements IConferenceRepository {
    public database: Conference[] = []

    async create(conference: Conference): Promise<void> {
        this.database.push(conference)
    }

    async findById(id: string): Promise<Conference | null> {
        return this.database.find(conference => conference.props.id === id) ?? null
    }

    async update(conference: Conference): Promise<void> {
        const index = this.database.findIndex(conf => conf.props.id === conference.props.id)
        this.database[index] = conference
    }
}