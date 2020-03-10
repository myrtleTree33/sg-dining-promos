import Queue from 'bull';

const { REDIS_URI } = process.env;

export const queueTransform = new Queue('queue-transform', REDIS_URI);
