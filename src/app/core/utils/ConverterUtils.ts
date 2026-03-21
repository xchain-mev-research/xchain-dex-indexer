

export class ConverterUtils {

    static timestampToDate(timestamp: number): Date {
        return new Date(timestamp);
    }

    static nameToSnakeCase(name: string): string {
        return name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }

}