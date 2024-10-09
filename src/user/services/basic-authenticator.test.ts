import { InMemoryUserRepository } from "../adapters/in-memory-user-repository"
import { User } from "../user.entity"
import { BasicAuthenticator } from "./basic-authenticator"

describe("Authenticator", () => {
    const johnDoe = new User({
        id: 'john-doe',
        email: 'johndoe@gmail.com',
        password: 'qwerty'
    })

    let userRepository: InMemoryUserRepository
    let authenticator: BasicAuthenticator

    beforeEach(async () => {
        userRepository = new InMemoryUserRepository()
        await userRepository.create(johnDoe)
        authenticator = new BasicAuthenticator(userRepository)
    })

    describe('Case: token is valid', () => {
        it('should authenticate a user', async () => {
            const payload = Buffer.from(`${johnDoe.props.email}:${johnDoe.props.password}`).toString('base64')
    
            const user = await authenticator.authenticate(payload)
    
            expect(user.props).toEqual({
                id: 'john-doe',
                email: 'johndoe@gmail.com',
                password: 'qwerty'
            })
        })
    })

    describe('Case: token is invalid', () => {
        it('should fail', async () => {
            const payload = Buffer.from(`unknown@gmail.com:${johnDoe.props.password}`).toString('base64')
            await expect(authenticator.authenticate(payload)).rejects.toThrow('Wrong credentials')
        })
    })

})