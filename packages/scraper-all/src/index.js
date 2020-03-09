import { logger } from './utils/logger';
import { runExtract } from './providers/all/extract';
import { runLoad } from './providers/all/load';

const {} = process.env;

// TODO use a job queue like here: https://github.com/OptimalBits/bull

logger.info('Starting batch jobs..');

// Run ETL jobs in parallel
(async () => {
  await Promise.all([runExtract(), runTransform(), runLoad()]);
})();
