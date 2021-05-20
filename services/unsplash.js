const { createApi } = require('unsplash-js');
const nodeFetch = require('node-fetch');

exports.getRandomPhoto = async (query, maxPages, perPage) => {
  const page = Math.ceil(Math.random(1, maxPages) * maxPages);
  const index = Math.ceil(Math.random(1, perPage) * perPage);

  const unsplash = createApi({
    accessKey: process.env.UNSPLASH_KEY,
    fetch: nodeFetch,
  });

  const result = await unsplash.search.getPhotos({ query, page, perPage });

  if (result.errors) {
    const error = new Error(result.errors.join(', '));
    error.statusCode = 500;
    throw error;
  }

  return result.response.results[index];
};
