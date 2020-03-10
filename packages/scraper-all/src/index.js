import { logger } from './utils/logger';
import { AllScraper } from './providers/all/all';

const {} = process.env;

// TODO use a job queue like here: https://github.com/OptimalBits/bull

logger.info('Starting batch jobs..');

// Run ETL jobs in parallel
(async () => {
  await Promise.all([AllScraper.extract(), AllScraper.transform(), AllScraper.load()]);
})();
