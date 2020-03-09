import { runBurppleExtract } from '../burpple/extract';

export const runExtract = async () => {
  const transformQueue = null; // TODO new queue;

  return Promise.all([runBurppleExtract(transformQueue)]);
};
