import { asClass, asFunction, AwilixContainer, createContainer } from "awilix";
import { InMemoryBookingRepository } from "../../conference/adapters/in-memory-booking-repository";
import { MongoConference } from "../../conference/adapters/mongo/mongo-conference";
import { MongoConferenceRepository } from "../../conference/adapters/mongo/mongo-conference-repository";
import { BookSeat } from "../../conference/usecases/book-seat";
import { ChangeDates } from "../../conference/usecases/change-dates";
import { ChangeSeats } from "../../conference/usecases/change-seats";
import { OrganizeConference } from "../../conference/usecases/organize-conference";
import { CurrentDateGenerator } from "../../core/adapters/current-date-generator";
import { InMemoryMailer } from "../../core/adapters/in-memory-mailer";
import { RabbitMQPublisher } from "../../core/adapters/rabbitmq-publisher";
import { RandomIDGenerator } from "../../core/adapters/random-id-generator";
import { MongoUser } from "../../user/adapters/mongo/mongo-user";
import { MongoUserRepository } from "../../user/adapters/mongo/mongo-user-repository";
import { JwtAuthenticator } from "../../user/services/jwt-authenticator";

export interface Dependencies {
    conferenceRepository:   MongoConferenceRepository;
    idGenerator:            RandomIDGenerator;
    dateGenerator:          CurrentDateGenerator;
    mailer:                 InMemoryMailer;
    bookingRepository:      InMemoryBookingRepository;
    userRepository:         MongoUserRepository;
    messageBroker:          RabbitMQPublisher;
    organizeConference:     OrganizeConference;
    authenticator:          JwtAuthenticator;
    changeDates:            ChangeDates;
    changeSeats:            ChangeSeats;
    bookSeat:               BookSeat;
}

const container : AwilixContainer<Dependencies> = createContainer<Dependencies>();

container.register({
    idGenerator:            asClass(RandomIDGenerator)
                            .singleton(),
    dateGenerator:          asClass(CurrentDateGenerator)
                            .singleton(),
    mailer:                 asClass(InMemoryMailer)
                            .singleton(),
    bookingRepository:      asClass(InMemoryBookingRepository)
                            .singleton(),
    conferenceRepository:   asFunction(() => new MongoConferenceRepository(MongoConference.ConferenceModel))
                            .singleton(),
    userRepository:         asFunction(() => new MongoUserRepository(MongoUser.UserModel))
                            .singleton(),
    messageBroker:          asFunction(() => new RabbitMQPublisher('amqp://localhost'))
                            .singleton(),
    organizeConference:     asFunction(({ conferenceRepository, idGenerator, dateGenerator, messageBroker }) => 
                                            new OrganizeConference(conferenceRepository, idGenerator, dateGenerator, messageBroker))
                            .singleton(),
    authenticator:          asFunction(({ userRepository }) => new JwtAuthenticator(userRepository))
                            .singleton(),
    changeDates:            asFunction(({ conferenceRepository, dateGenerator, bookingRepository, mailer, userRepository }) => 
                                            new ChangeDates(conferenceRepository, dateGenerator, bookingRepository, mailer, userRepository))
                            .singleton(),
    bookSeat:               asFunction(({idGenerator, bookingRepository, mailer, conferenceRepository, userRepository}) => 
                                            new BookSeat(idGenerator, bookingRepository, mailer, conferenceRepository, userRepository))
                            .singleton(),
    changeSeats:            asFunction(({conferenceRepository, bookingRepository}) => new ChangeSeats(conferenceRepository, bookingRepository))
                            .singleton()
});

export type ResolveDependencyFn = <K extends keyof Dependencies>(key: K) => Dependencies[K]

const resolveDependency: ResolveDependencyFn = <K extends keyof Dependencies>(key: K): Dependencies[K] => {
    return container.resolve<K>(key);
};

export default resolveDependency;