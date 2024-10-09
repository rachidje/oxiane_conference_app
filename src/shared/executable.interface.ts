

export interface IExecutable<TRequest= any, TResponse= any> {
    execute(data: TRequest): Promise<TResponse>
}