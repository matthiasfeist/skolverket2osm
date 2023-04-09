const axios = require("axios");
const cliProgress = require("cli-progress");
const Cache = require("./cache");

module.exports = async function () {
  const cache = new Cache("skolverket");
  const progressBar = new cliProgress.SingleBar(
    { etaBuffer: 300, clearOnComplete: true },
    cliProgress.Presets.shades_classic
  );

  console.log("Downloading data index from Skolverket");
  const listResponse = await axios.get(
    "https://api.skolverket.se/skolenhetsregistret/v1/skolenhet"
  );

  console.log("Downloading data for the individual schools from Skolverket...");
  if (cache.length() > 0) {
    console.log(
      "💡 Cached data is avaiable from a previous run. Downloading only new schools!"
    );
  }
  progressBar.start(listResponse.data.Skolenheter.length, 0);

  const result = [];
  for (let i = 0; i < listResponse.data.Skolenheter.length; i++) {
    progressBar.update(i + 1);
    const school = listResponse.data.Skolenheter[i];
    const enhetskod = school.Skolenhetskod;

    const cachedResult = cache.get(enhetskod);
    if (cachedResult) {
      result.push(cachedResult);
    } else {
      const schoolResponse = await axios.get(
        `https://api.skolverket.se/skolenhetsregistret/v1/skolenhet/${enhetskod}`,
        { timeout: 30 }
      );
      result.push(schoolResponse.data);
      cache.set(enhetskod, schoolResponse.data);

      // save the cache every so often to not start from the very beginning
      // if something breaks or the script get interrupted by the user.
      if (i % 200 === 0) cache.save();
    }
  }

  progressBar.stop();
  cache.save();
  return result;
};
