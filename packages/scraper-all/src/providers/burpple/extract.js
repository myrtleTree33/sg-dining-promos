import BurppleScraper from '@scrapers/scraper-burpple';

export const runBurppleExtract = async transformQueue => {
  return BurppleScraper.scrapeBurpple({
    onResults: (results, page) => {
      console.log(`Scraping page=${page}`);
    }
  });
};
