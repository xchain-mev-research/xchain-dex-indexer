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

const command = `npx ts-node -r dotenv/config -r tsconfig-paths/register src/app/chains/${parachain}/storeAllTokens.ts`;

execSync(command, { stdio: 'inherit', env: process.env })
