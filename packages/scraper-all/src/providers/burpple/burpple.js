import Scraper from '@scrapers/scraper-burpple';

const extract = async queueTransform =>
  Scraper.scrapeBurpple({
    onResults: (results, page) => {
      console.log(`Scraping page=${page}`);
      results.map(r =>
        queueTransform.add({
          provider: 'burpple',
          payload: { ...r }
        })
      );
    }
  });

const transform = async () => {};

const load = async () => {};

export const BurppleScraper = {
  extract,
  load,
  transform
};
