import { IAuthenticator } from "../ports/authenticator.interface";
import { IUserRepository } from "../ports/user-repository.interface";
import { User } from "../user.entity";


export class BasicAuthenticator implements IAuthenticator {

    constructor(private readonly userRepository: IUserRepository) {}

    async authenticate(token: string): Promise<User> {
        const decoded = Buffer.from(token, 'base64').toString('utf-8') // johndoe@gmail.com:qwerty
        const [email, password] = decoded.split(':')

        const user = await this.userRepository.findByEmail(email)

        if(!user || user.props.password !== password) throw new Error("Wrong credentials")

        return user
    }
}