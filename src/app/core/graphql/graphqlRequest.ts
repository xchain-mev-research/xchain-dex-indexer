import axios from 'axios';
import { logger } from '../log/logger';

export async function graphqlRequest(url: string, query: string, variables = {}): Promise<any> {

    logger.log(`📡 Executing query: ${query}`);
    try {
        const response = await axios.post(
            url,
            {
                query,
                variables,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Errore GraphQL:', error.response?.data || error.message);
        throw error;
    }
}





