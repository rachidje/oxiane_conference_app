import { addDays } from "date-fns";
import { Model } from "mongoose";
import { MongoConference } from "./mongo-conference";
import { MongoConferenceRepository } from "./mongo-conference-repository";
import { Conference } from "../../entities/conference.entity";
import { TestApp } from "../../../tests/utils/test-app";

const testIntConference = new Conference({
    id: 'conference-1',
    organizerId: 'organizer-id',
    title: 'Conference 1',
    startDate: addDays(new Date(), 5),
    endDate: addDays(new Date(), 5),
    seats: 100
})

describe('MongoConferenceRepository', () => {
    let app: TestApp
    let model: Model<MongoConference.ConferenceDocument>
    let repository: MongoConferenceRepository

    beforeEach(async () => {
        app = new TestApp()
        await app.setup()

        model = MongoConference.ConferenceModel;
        model.deleteMany({})
        repository = new MongoConferenceRepository(model)

        const record = new model({
            _id: testIntConference.props.id,
            organizerId: testIntConference.props.organizerId,
            title: testIntConference.props.title,
            startDate: testIntConference.props.startDate,
            endDate: testIntConference.props.endDate,
            seats: testIntConference.props.seats,
        })
        await record.save()
    })

    afterAll(async () => {
        await app.tearDown()
    })

    describe('FindById', () => {
        it('should find a conference corresponding to the ID', async () => {
            const conference = await repository.findById('conference-1')
            expect(conference!.props).toEqual(testIntConference.props)
        })
        it('should return null if conference does not exist', async () => {
            const conference = await repository.findById('non-existing-id')
            expect(conference).toBeNull()
        })
    })

    describe('Create', () => {
        it('should create a new conference', async () => {
            const newConference = new Conference({
                id: 'conference-2',
                organizerId: 'organizer-id',
                title: 'Conference 2',
                startDate: addDays(new Date(), 5),
                endDate: addDays(new Date(), 5),
                seats: 100
            })

            await repository.create(newConference)
            const foundConference = await repository.findById('conference-2')
            expect(foundConference).not.toBeNull()
        })
    })

    describe('Update', () => {
        it('should update an existing conference', async () => {
            const updatedConference = new Conference({
                ...testIntConference.props,
                title: 'Updated conference',
                seats: 150
            })

            await repository.update(updatedConference)

            const foundConference = await repository.findById(testIntConference.props.id)
            expect(foundConference!.props.title).toEqual('Updated conference')
            expect(foundConference!.props.seats).toEqual(150)
        })
    })
})