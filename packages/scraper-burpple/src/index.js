import { scrapePage, scrapeEntry, scrapeBurpple } from './fetcher';

const BurppleScraper = { scrapeBurpple, scrapePage, scrapeEntry };

export default BurppleScraper;

// function app() {
//   (async () => {
//     await scrapeBurpple({
//       onResults: (results, page) => {
//         console.log(`Scraping page=${page}`);
//       }
//     });
//   })();
// }

// if (require.main === module) {
//   app();
// }
