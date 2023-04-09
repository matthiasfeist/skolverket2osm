const fs = require("fs");
const path = require("path");

module.exports = class Cache {
  cacheFilePath;
  map;

  constructor(id) {
    this.cacheFilePath = path.resolve(__dirname, id + ".cache.json");
    this.map = new Map();

    if (fs.existsSync(this.cacheFilePath)) {
      this.map = new Map(
        JSON.parse(fs.readFileSync(this.cacheFilePath, { encoding: "utf-8" }))
      );
    }
  }

  save() {
    fs.writeFileSync(
      this.cacheFilePath,
      JSON.stringify(Array.from(this.map), null, 2)
    );
  }

  length() {
    return Array.from(this.map.keys()).length;
  }

  set(key, data) {
    this.map.set(key, data);
  }

  has(key) {
    return this.map.has(key);
  }

  get(key) {
    return this.map.get(key);
  }
};
