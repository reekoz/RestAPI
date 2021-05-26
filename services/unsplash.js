const { createApi } = require('unsplash-js');
const nodeFetch = require('node-fetch');
const logger = require('../services/logger');

exports.getRandomPhoto = async (query, maxPages, maxPerPage) => {

  const unsplash = createApi({
    accessKey: process.env.UNSPLASH_KEY,
    fetch: nodeFetch,
  });

  // first request to get total results 
  const totalResult = await unsplash.search.getPhotos({ query, per_page: 1 });

  if (totalResult.errors) {
    const error = new Error(result.errors.join(', '));
    error.statusCode = 500;
    throw error;
  }

  const total = +totalResult.response.total;
  const totalPages = +totalResult.response.total_pages;

  if (total === 0) {
    logger.warn(`Found no image(s) for query '${query}'`);
    return null;
  }

  if (maxPages > totalPages)
    maxPages = totalPages;

  if (maxPerPage > total)
    maxPerPage = total;

  const page = Math.ceil(Math.random(1, maxPages) * maxPages);
  const perPage = Math.ceil(Math.random(1, maxPerPage) * maxPerPage);
  const index = Math.ceil(Math.random(1, perPage) * perPage) - 1;

  logger.info('Unsplash request ' +  JSON.stringify({
    page,
    perPage,
    index,
  }, null, 4));

  const result = await unsplash.search.getPhotos({ query, page, perPage });

  if (result.errors) {
    const error = new Error(result.errors.join(', '));
    error.statusCode = 500;
    throw error;
  }

  return result.response.results[index];
};
