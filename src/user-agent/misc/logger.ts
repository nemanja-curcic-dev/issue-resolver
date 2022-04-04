import Logger from '../../common/logger';
import { Envs } from './envs';

export const logger = Logger.getLogger('user-agent');
logger.level = Envs.LOG_LEVEL;