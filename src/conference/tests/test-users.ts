import { User } from "../../user/user.entity";


export const testUsers = {
    johnDoe: new User({
        id: 'john-doe',
        email: 'johndoe@gmail.com',
        password: 'qwerty'
    }),
    alice: new User({
        id: 'alice',
        email: 'alice@gmail.com',
        password: 'qwerty'
    }),
    bob: new User({
        id: 'bob',
        email: 'bob@gmail.com',
        password: 'qwerty'
    }),
    charles: new User({
        id: 'charles',
        email: 'charles@gmail.com',
        password: 'qwerty'
    }),
    henry: new User({
        id: 'henry',
        email: 'henry@gmail.com',
        password: 'qwerty'
    }),
    valerie: new User({
        id: 'valerie',
        email: 'valerie@gmail.com',
        password: 'qwerty'
    })
}