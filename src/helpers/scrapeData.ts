import axios from 'axios';
import * as cheerio from 'cheerio';

export const getScrapeData = async (link: string) => {
  try {
    const response = await axios.get('https://axios-http.com/docs/example');
    const $ = cheerio.load(response.data);
    $('script').remove();
    // console.log($('body').children());
    // console.log($('body').children().text());
    return $('body').children().text();
  } catch (error) {
    console.error(error);
    throw Error(error);
  }
};
