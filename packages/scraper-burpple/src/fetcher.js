import Axios from 'axios';
import Cheerio from 'cheerio';
import cloudscraper from 'cloudscraper';
import convertTime from 'convert-time';
import { logger } from './utils/logger';

/**
 *  Use this to scrape all of Burpple.
 *
 * @param {*} param0
 */
export const scrapeBurpple = async ({ onResults }) => {
  let page = 0;

  while (true) {
    try {
      page++;

      const results = await scrapePage({
        page,
        priceMin: 0,
        priceMax: 90
      });

      // Empty page
      if (!results || !results.length) {
        break;
      }

      if (page % 20 === 0) {
        logger.info(`[Burpple] Scraped page=${page}..`);
      }

      onResults(results, page);
    } catch (e) {
      // NOOP; done
      break;
    }
  }

  logger.info(`[Burpple] Scraping done.`);
  return Promise.resolve();
};

/**
 * Scrapes Burpple's listings page.
 *
 * @param {*} opts
 */
export const scrapePage = async (
  opts = {
    page: 1,
    query: null,
    priceMin: 0,
    priceMax: 100
  }
) => {
  const { page, query, priceMin, priceMax } = opts;
  const query2 = query ? `&=${query}` : '';
  const url = `https://www.burpple.com/search/sg?offset=${page *
    12}&open_now=true&price_from=${priceMin}&price_to=${priceMax}${query2}`;

  // const result = await Axios.get(url);
  const response = await cloudscraper.get(url);
  const $ = Cheerio.load(response);

  return $('#masonry-container > div')
    .map((i, elem) => {
      const title = $(
        'div.searchVenue-header.card-item.card-item--header > a > div > div.searchVenue-header-nameWrapper.clearfix > div > span',
        elem
      ).text();

      const imgUrls = $('div.searchVenue-reviews > div > a', elem)
        .map((i, elem2) => {
          let imgUrl = $(
            'div.card-item.card-item--header.searchVenue-reviews-container-items-item-imgContainer > picture > img',
            elem2
          ).attr('src');

          if (imgUrl) {
            imgUrl = imgUrl.substring(0, imgUrl.indexOf('?'));
          }
          return imgUrl;
        })
        .get()
        .filter(el => el != null);

      const numReviews = parseInt(
        $(
          'div.searchVenue-header.card-item.card-item--header > a > div > span.searchVenue-header-reviews',
          elem
        ).text()
      );

      let price = $(
        'div.searchVenue-header.card-item.card-item--header > a > div > div.searchVenue-header-locationDistancePrice > span.searchVenue-header-locationDistancePrice-price',
        elem
      ).text();

      price = price ? price.match(/\d+/)[0] : null;

      const hasBeyond = $('div.searchVenue-reasonTags.card-item > a:nth-child(2) > div', elem)
        .text()
        .includes('BEYOND');

      const genericLoc = $(
        'div.searchVenue-header.card-item.card-item--header > a > div > div.searchVenue-header-locationDistancePrice > span.searchVenue-header-locationDistancePrice-location',
        elem
      ).text();

      let categories = $(
        'div.searchVenue-header.card-item.card-item--header > a > div > span.searchVenue-header-categories',
        elem
      ).text();

      categories = categories ? categories.split(',') : [];

      let id = $('div.searchVenue-header.card-item.card-item--header > a', elem).attr('href');
      id = id.substring(1, id.indexOf('?'));
      const link = `https://www.burpple.com/${id}`;

      const reviews = $(
        'div.searchVenue-reviews > div > a > div.card-item.searchVenue-reviews-container-items-item-body',
        elem
      )
        .map((i, elem2) => {
          const content = $('div.searchVenue-reviews-container-items-item-body-desc', elem2)
            .text()
            .replace(/\n/g, '');

          const author = $(
            'div.searchVenue-reviews-container-items-item-body-userTime > div.searchVenue-reviews-container-items-item-body-userTime-user > div.searchVenue-reviews-container-items-item-body-userTime-user-name > div',
            elem2
          )
            .text()
            .replace(/\n/g, '');

          return { author, content };
        })
        .get();

      return {
        id,
        imgUrls,
        title,
        numReviews,
        price,
        categories,
        hasBeyond,
        genericLoc,
        link
      };
    })
    .get();
};

/**
 * Given a Burpple URL, scrapes a single Burpple entry.
 */
export const scrapeEntry = async (opts = { url: undefined }) => {
  const { url } = opts;
  // const result = await Axios.get(url);
  // const $ = Cheerio.load(result.data);

  const response = await cloudscraper.get(url);
  const $ = Cheerio.load(response);

  let address =
    $(
      'body > div.page > div:nth-child(7) > div > div.col-lg-4.order-lg-3 > div.venue-details > div > div.venue-details__item.venue-details__item--address > div > p'
    ).text() || '';

  if (address) {
    address = address.replace(/\n/g, ', ');
  }

  // get lng lat
  const canvas = $('#map-canvas');
  const location = [canvas.attr('data-venue-lng'), canvas.attr('data-venue-lat')];

  const currOpeningHours = $(
    'body > div.page > div:nth-child(7) > div > div.col-lg-4.order-lg-3 > div.venue-details > div > div.venue-details__item.venue-details__item--opening > div > p'
  )
    .text()
    .split(' ');

  let openingHours = $('#venueInfo-details-header-item-body-hidden-openingHours > p')
    .map((i, elem) => {
      const text = $(elem)
        .text()
        .split(' ');
      return text;
    })
    .get();

  openingHours = [...currOpeningHours, ...openingHours].filter(x => !(x === '-' || x === ''));

  const openingHoursFormatted = [];
  for (let i = 0; i < openingHours.length; i += 3) {
    const day = openingHours[i].substring(0, openingHours[i].length - 1);

    const timeStart = convertTimeSafe(openingHours[i + 1]);
    const timeEnd = convertTimeSafe(openingHours[i + 2]);

    openingHoursFormatted.push({
      day,
      timeStart,
      timeEnd
    });
  }

  return {
    location,
    address,
    openingHours: openingHoursFormatted
  };
};

const convertTimeSafe = hoursStr => {
  try {
    let time = convertTime(hoursStr);
    if (time) {
      time = time.replace(/\n/g, '');
    }
    return time;
  } catch (e) {
    return null;
  }
};
