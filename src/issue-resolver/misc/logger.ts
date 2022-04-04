import Logger from '../../common/logger';
import { Envs } from './envs';

export const logger = Logger.getLogger('issue-resolver');
logger.level = Envs.LOG_LEVEL;