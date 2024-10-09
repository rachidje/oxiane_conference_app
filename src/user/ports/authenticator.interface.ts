import { User } from "../user.entity";

export interface IAuthenticator {
    authenticate(token: string): Promise<User>
}