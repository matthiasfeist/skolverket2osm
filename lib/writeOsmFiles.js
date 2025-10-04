const fs = require("fs");
const path = require("path");
const { XMLBuilder } = require("fast-xml-parser");

module.exports = function (schoolInput) {
  const outputDir = path.resolve("./output/");
  fs.mkdirSync(outputDir, { recursive: true });

  const nodes = [];
  for (let i = 0; i < schoolInput.length; i++) {
    const school = schoolInput[i];
    const id = (i + 1000) * -1; // negative IDs for the OSM file
    nodes.push(
      makeNode(id, school.lat, school.lng, {
        amenity: "school",
        name: school.name,
        "ref:SE:skolverket": school.ref.sort()[0],
        website: school.website,
        "addr:housenumber": school.housenr,
        "addr:street": school.street,
        "addr:city": school.city,
        "addr:postcode": school.postcode,
        "addr:municipality": school.municipality,
        operator: school.operator,
        grades: formatGradeRange(school.grades),
        "isced:level": formatIscedLevel(school.iscedLevel),
      })
    );
  }

  const osmObj = {
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "UTF-8",
    },
    osm: {
      "@_version": "0.6",
      "@_generator": "skolverket2osm",
      "@_upload": "false",
      node: nodes,
    },
  };

  const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
  const xmlContent = builder.build(osmObj);
  const outputFile = path.join(outputDir, "skolverket.osm");
  console.log("Writing the output file to: " + path.relative("", outputFile));
  fs.writeFileSync(outputFile, xmlContent);
};

function makeNode(id, lat, lng, tags) {
  return {
    "@_id": id,
    "@_lat": lat,
    "@_lon": lng,
    tag: Object.keys(tags)
      .filter((key) => !!tags[key])
      .map((key) => {
        return { "@_k": key, "@_v": tags[key] };
      }),
  };
}

function formatGradeRange(input) {
  const a = Array.from(new Set(input)).sort(); // to deduplicate and to get a sorted list.
  if (a.length < 2) return "";
  return a[0] + "-" + a[a.length - 1];
}

function formatIscedLevel(input) {
  return Array.from(new Set(input)).sort().join(";");
}
