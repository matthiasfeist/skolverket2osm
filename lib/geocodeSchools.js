const axios = require("axios");
const cliProgress = require("cli-progress");
const Cache = require("./cache");

module.exports = async function (schoolsInput) {
  if (!process.env.HERE_API_KEY) {
    console.log("❌ HERE Api key not found. Please check the .env file!");
    process.exit(1);
  }

  const cache = new Cache("geocode-here");
  const progressBar = new cliProgress.SingleBar(
    { etaBuffer: 300, clearOnComplete: true },
    cliProgress.Presets.shades_classic
  );

  console.log(
    "Geocoding school adresses (because Skolverket's geo coordinates can't be trusted."
  );
  if (cache.length() > 0) {
    console.log(
      "💡 Cached data is avaiable from a previous run. Only geocoding new addresses!"
    );
  }
  progressBar.start(schoolsInput.length, 0);
  for (let i = 0; i < schoolsInput.length; i++) {
    progressBar.update(i + 1);

    const school = schoolsInput[i];
    const query = `${school.street} ${school.housenr}, ${school.postcode} ${school.city}`;

    if (!cache.has(query)) {
      const hereResponse = await axios.get(
        "https://geocode.search.hereapi.com/v1/geocode",
        { params: { q: query, apiKey: process.env.HERE_API_KEY, timeout: 10 } }
      );
      cache.set(query, hereResponse.data);

      // save the cache every so often to not start from the very beginning
      // if something breaks or the script get interrupted by the user.
      if (i % 100 === 0) cache.save();
    }

    const geolocationReponse = cache.get(query);
    if (geolocationReponse.items && geolocationReponse.items.length > 0) {
      school.lat = geolocationReponse.items[0].position.lat;
      school.lng = geolocationReponse.items[0].position.lng;
    }
  }

  progressBar.stop();
  cache.save();
  return schoolsInput;
};
