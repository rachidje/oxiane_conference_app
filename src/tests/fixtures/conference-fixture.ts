import { Conference } from "../../conference/entities/conference.entity";
import { ResolveDependencyFn } from "../../infrastructure/config/dependecy-injection";
import { IFixture } from "../utils/fixture.interface";


export class ConferenceFixture implements IFixture {
    constructor(public entity: Conference) {}

    async load(container: ResolveDependencyFn): Promise<void> {
        const repository = container('conferenceRepository')
        await repository.create(this.entity)
    }
}