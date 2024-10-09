import { Application } from 'express';
import request from 'supertest';
import { e2eConferences } from './seeds/conference-seeds';
import { e2eUsers } from './seeds/user-seeds';
import { TestApp } from './utils/test-app';


describe('Feature: Organizing Conference', () => {
    let testApp: TestApp
    let app: Application

    beforeEach(async () => {
        testApp = new TestApp()
        await testApp.setup()
        await testApp.loadAllFixtures([
            e2eUsers.johnDoe,
            e2eConferences.conference1
        ])
        app = testApp.expressApp

    });

    afterAll(async () => {
        await testApp.tearDown()
    })

    it('should organize a conference', async () => {
        const conferenceId = e2eConferences.conference1.entity.props.id
        const result = await request(app)
                            .post(`/conference/book/${conferenceId}`)
                            .set('Authorization', e2eUsers.johnDoe.createJwtToken())
        
        expect(result.status).toBe(201);
        expect(result.body.data).toEqual({ bookId: expect.any(String) });


    });
});