import { v4 as uuid4 } from "uuid";
import { IIDGenerator } from "../ports/id-generator.interface";


export class RandomIDGenerator implements IIDGenerator {
    generate(): string {
        return uuid4()
    }
}