import amqp from 'amqplib';
import { ImessageBroker } from '../ports/message-broker.interface';


export class RabbitMQPublisher implements ImessageBroker {
    private connection: amqp.Connection | null = null
    private channel: amqp.Channel | null = null

    constructor(private readonly url: string) {}

    async connect() {
        try {
            this.connection = await amqp.connect(this.url)
            this.channel = await this.connection.createChannel()
        } catch (error) {
            console.log('Failed to connect to Rabbit', error);
            
        }
    }

    async publish(queue: string, message: any): Promise<void> {
        if(!this.channel) throw new Error("Channel not initialized")
        
        const messageBuffer = Buffer.from(JSON.stringify(message))
        await this.channel.assertQueue(queue, {durable: false})
        this.channel.sendToQueue(queue, messageBuffer)
    }

    isConnected() {
        return this.channel !== null
    }

    async close() {
        if(this.channel) await this.channel.close()
        if(this.connection) await this.connection.close()
    }
}