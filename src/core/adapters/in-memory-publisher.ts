import { ImessageBroker } from "../ports/message-broker.interface";


export class InMemoryPublisher implements ImessageBroker {
    public messages: {queue: string, message: any}[] = []

    async publish(queue: string, message: any): Promise<void> {
        this.messages.push({queue, message})
    }

    getPublishedMessages(queue: string) : any[] {
        return this.messages
                    .filter(msg => msg.queue === queue)
                    .map(msg => msg.message)
    }

    clearMessages(): void {
        this.messages = []
    }
}