import jwt from 'jsonwebtoken'
import { testUsers } from "../../conference/tests/test-users"
import { InMemoryUserRepository } from "../adapters/in-memory-user-repository"
import { JwtAuthenticator } from './jwt-authenticator'

describe('JWT Authenticator', () => {
    let userRepository: InMemoryUserRepository
    let authenticator: JwtAuthenticator
    const jwtSecret = 'mysecret'

    beforeEach(async () => {
        userRepository = new InMemoryUserRepository()
        await userRepository.create(testUsers.johnDoe)
        authenticator = new JwtAuthenticator(userRepository)
        authenticator.setJwtSecret(jwtSecret)
    })

    describe('Scenario: token is valid', () => {
        it('should return a user', async () => {
            const token = jwt.sign({email: testUsers.johnDoe.props.email}, jwtSecret, {expiresIn: '1h'})
            const user = await authenticator.authenticate(token)

            expect(user.props).toEqual(testUsers.johnDoe.props)
        })
    })
    
    describe('Scenario: token is not valid', () => {
        it('should fail', async () => {
            const invalidToken = jwt.sign({email: 'unknown@gmail.com'}, jwtSecret, {expiresIn: '1h'})
            await expect(authenticator.authenticate(invalidToken)).rejects.toThrow("User not found")
        })
    })
    
    describe('Scenario: token is malformed', () => {
        it('should fail', async () => {
            const malformedToken = 'malformed.token'
            await expect(authenticator.authenticate(malformedToken)).rejects.toThrow('Invalid Token')
        })
    })
})