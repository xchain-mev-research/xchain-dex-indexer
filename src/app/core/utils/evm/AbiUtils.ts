

export class AbiUtils {

    static checkEvent(log: any, event: any): boolean {
        return log.topics.includes(event.topic)
    }

}