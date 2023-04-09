const getSkolverketData = require("./lib/getSkolverketData.js");
const mapAndClean = require("./lib/mapAndClean.js");
const mergeSchools = require("./lib/mergeSchools.js");
const geocodeSchools = require("./lib/geocodeSchools.js");
const writeOsmFiles = require("./lib/writeOsmFiles.js");
require("dotenv").config();

async function main() {
  const rawData = await getSkolverketData();
  const cleanedData = mapAndClean(rawData);
  const mergedSchools = mergeSchools(cleanedData);
  const geocodedSchools = await geocodeSchools(mergedSchools);
  writeOsmFiles(geocodedSchools);
}
main();
