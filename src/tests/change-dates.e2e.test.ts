import { addDays, addHours } from 'date-fns';
import { Application } from 'express';
import request from 'supertest';
import { IConferenceRepository } from '../conference/ports/conference-repository.interface';
import resolveDependency from '../infrastructure/config/dependecy-injection';
import { e2eConferences } from './seeds/conference-seeds';
import { e2eUsers } from './seeds/user-seeds';
import { TestApp } from './utils/test-app';


describe('Feature: Change conference dates', () => {
    let testApp: TestApp
    let app: Application
    let conferenceRepository: IConferenceRepository

    beforeEach(async () => {
        testApp = new TestApp()
        await testApp.setup()
        await testApp.loadAllFixtures([
            e2eUsers.johnDoe,
            e2eConferences.conference1
        ])
        app = testApp.expressApp
        conferenceRepository = resolveDependency('conferenceRepository')
    });

    afterAll(async () => {
        await testApp.tearDown()
    })


    it('should organize a conference', async () => {

        const conferenceId = e2eConferences.conference1.entity.props.id

        const startDate = addDays(new Date(), 8)
        const endDate = addDays(addHours(new Date(), 2), 8)

        const result = await request(app)
                        .patch(`/conference/dates/${conferenceId}`)
                        .set('Authorization', e2eUsers.johnDoe.createJwtToken())
                        .send({
                            startDate: startDate.toISOString(),
                            endDate: endDate.toISOString()
                        });
        
        expect(result.status).toBe(200);

        const fetchedConference = await conferenceRepository.findById(e2eConferences.conference1.entity.props.id)
        expect(fetchedConference).toBeDefined()
        expect(fetchedConference!.props.startDate).toEqual(startDate)
        expect(fetchedConference!.props.endDate).toEqual(endDate)

    });
});