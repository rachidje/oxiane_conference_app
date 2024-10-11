import { Application } from 'express';
import request from 'supertest';
import { TestApp } from './utils/test-app';


describe('Feature: Register a new User', () => {
    let testApp: TestApp
    let app: Application

    beforeEach(async () => {
        testApp = new TestApp()
        await testApp.setup()
        app = testApp.expressApp

    });

    afterAll(async () => {
        await testApp.tearDown()
    })

    it('should register a new user', async () => {
        const result = await request(app)
                            .post(`/user/register`)
                            .send({
                                email: 'johndoe@gmail.com',
                                password: 'qwerty'
                            });
        
        expect(result.status).toBe(201);
        expect(result.body.data).toEqual({ id: expect.any(String) });
    });
});