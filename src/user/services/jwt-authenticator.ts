import jwt from 'jsonwebtoken';
import { IAuthenticator } from "../ports/authenticator.interface";
import { IUserRepository } from "../ports/user-repository.interface";
import { User } from "../user.entity";

export class JwtAuthenticator implements IAuthenticator {
    private jwtSecret: string

    constructor(private readonly userRepository: IUserRepository) {
        this.jwtSecret = 'mysecretkey'
    }

    setJwtSecret(secret: string) {
        this.jwtSecret = secret
    }

    async authenticate(token: string): Promise<User> {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as {email: string}
            const user = await this.userRepository.findByEmail(decoded.email)

            if(!user) throw new Error("User not found")

            return user!
        } catch (error) {
            if(error.message === 'User not found') throw error
            throw new Error("Invalid Token")
        }
    }
}