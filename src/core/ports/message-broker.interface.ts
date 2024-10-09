

export interface ImessageBroker {
    publish(queue: string, message: any): Promise<void>
}