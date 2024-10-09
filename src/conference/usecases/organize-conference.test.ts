import { FixedDateGenerator } from "../../core/adapters/fixed-date-generator"
import { FixedIDGenerator } from "../../core/adapters/fixed-id-generator"
import { InMemoryPublisher } from "../../core/adapters/in-memory-publisher"
import { User } from "../../user/user.entity"
import { InMemoryConferenceRepository } from "../adapters/in-memory-conference-repository"
import { OrganizeConference } from "./organize-conference"

describe('Feature: Organize Conference', () => {
    const johnDoe = new User({
        id: 'john-doe', 
        email: 'johndoe@gmail.com', 
        password: 'qwerty'
    })

    let repository: InMemoryConferenceRepository
    let idGenerator: FixedIDGenerator
    let dateGenerator: FixedDateGenerator
    let messageBroker: InMemoryPublisher
    let usecase: OrganizeConference


    beforeEach(() => {
        repository = new InMemoryConferenceRepository()
        idGenerator = new FixedIDGenerator()
        dateGenerator = new FixedDateGenerator()
        messageBroker = new InMemoryPublisher
        usecase = new OrganizeConference(repository, idGenerator, dateGenerator, messageBroker)
    })

    describe('Scenario: Happy path', () => {
        const payload = {
            user: johnDoe,
            title: "My first conference",
            seats: 100,
            startDate: new Date('2024-01-04T10:00:00.000Z'),
            endDate: new Date('2024-01-04T11:00:00.000Z')
        }

        it('should return id', async () => {
            const result = await usecase.execute(payload)
    
            expect(result.id).toEqual('id-1')
        })
        it('should insert into database', async () => {
            await usecase.execute(payload)

            const conference = repository.database[0]
            expect(repository.database.length).toEqual(1)
            expect(conference.props.title).toEqual('My first conference')
        })
        it('should publish a message', async () => {
            await usecase.execute(payload)

            const publishedMessages = messageBroker.getPublishedMessages('conference_created')
            expect(publishedMessages).toHaveLength(1)
            expect(publishedMessages[0]).toEqual({
                conferenceId: expect.any(String),
                organizerEmail: johnDoe.props.email,
                title: 'My first conference',
                seats: 100
            })
        })
    })

    describe('Scenario: the conference is too early', () => {
        const payload = {
            user: johnDoe,
            title: "My first conference",
            seats: 100,
            startDate: new Date('2024-01-01T10:00:00.000Z'),
            endDate: new Date('2024-01-01T11:00:00.000Z')
        }

        it('should fail', async () => {
            await expect(usecase.execute(payload))
                    .rejects
                    .toThrow("The conference is too early (less than 3 days)")
        })

        it('should not insert conference in db', async () => {
            try {
                await usecase.execute(payload)
            } catch (error) {}
            expect(repository.database.length).toBe(0)
        })
    })

    describe('Scenario: Number of seats between 20 & 1000', () => {
        const payload = {
            user: johnDoe,
            title: "My first conference",
            seats: 1001,
            startDate: new Date('2024-01-04T10:00:00.000Z'),
            endDate: new Date('2024-01-04T11:00:00.000Z')
        }

        it('should fail', async () => {
            await expect(usecase.execute(payload))
                .rejects
                .toThrow("The conference must have a maximum of 1000 seats")
        })
    })

    describe('Scenario: Number of seats between 20 & 1000', () => {
        const payload = {
            user: johnDoe,
            title: "My first conference",
            seats: 15,
            startDate: new Date('2024-01-04T10:00:00.000Z'),
            endDate: new Date('2024-01-04T11:00:00.000Z')
        }

        it('should fail', async () => {
            await expect(usecase.execute(payload))
                .rejects
                .toThrow("The conference must have a minimum of 20 seats")
        })
    })

    describe('Scenario: The conference is too long', () => {
        const payload = {
            user: johnDoe,
            title: "My first conference",
            seats: 100,
            startDate: new Date('2024-01-04T10:00:00.000Z'),
            endDate: new Date('2024-01-04T14:00:00.000Z')
        }

        it('should fail', async () => {
            await expect(usecase.execute(payload))
                    .rejects
                    .toThrow("The conference is too long (> 3 hours)")
        })
    })
})