import { ResolveDependencyFn } from "../../infrastructure/config/dependecy-injection";

export interface IFixture {
    load(container: ResolveDependencyFn): Promise<void>
}