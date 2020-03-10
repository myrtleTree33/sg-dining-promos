import { BurppleScraper } from '../burpple/burpple';
import { queueTransform } from '../../queues';
import { logger } from '../../utils/logger';

const extract = async () => Promise.all([BurppleScraper.extract(queueTransform)]);

const transform = async () => {
  queueTransform.process(job => {
    return processTransformJob(job);
  });
};

const load = async () => {};

const processTransformJob = async job => {
  const { provider, payload } = job.data;
  logger.info(`[Transform] Processing provider=${provider}..`);
  return Promise.resolve();
};

export const AllScraper = {
  extract,
  transform,
  load
};
