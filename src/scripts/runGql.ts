
import { execSync } from 'child_process'
import * as dotenv from 'dotenv'

dotenv.config()

const dbPrefix = process.env.DB_URL_PREFIX || 'postgresql://localhost:5432/'
const parachain = process.env.PARACHAIN;
if (!parachain) {
    console.error('Please set the PARACHAIN environment variable.')
    process.exit(1)
}
process.env.DB_URL = dbPrefix + parachain;

var command = `clear && npx tsc && npx squid-graphql-server`;

execSync(command, { stdio: 'inherit' })

