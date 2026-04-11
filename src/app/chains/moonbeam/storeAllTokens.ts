import { TokensRepository } from '@app/core/data/TokensRepository';
import { ALL_MOONBEAM_TOKENS } from './trackedItems/tokens/generated/allMoonbeamTokens';

TokensRepository.storeTrackedTokens(ALL_MOONBEAM_TOKENS, 'storeAllTokens');
