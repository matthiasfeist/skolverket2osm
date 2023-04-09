function capitalizeWords(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      switch (word) {
        case "ab":
          return "AB";
        case "kommun":
          return "kommun";
        case "skola":
          return "skola";
        case "gymnasium":
          "gymnasium";
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function splitAddress(addr) {
  const regex = /(\d*\D+[^A-Z]) ([^a-z]?\D*\d+.*)/;
  const result = addr.match(regex);
  if (result && result.length === 3) {
    return [result[1].trim(), result[2].trim()];
  }
  return [addr, ""];
}

function cleanSchoolName(name) {
  // to find all the F-3 or 1-9 and remove them
  const regex = /[F\d]\s?-\s?[\d]/gm;
  return name.replace(regex, "").trim();
}

module.exports = function (schoolsInput) {
  console.log("Filtering and reformatting Skolverket data.");
  console.log("  > Skolenheter in input: " + schoolsInput.length);

  const result = schoolsInput
    // first filter out all "skolenheter" we're not interested in
    .filter((element) => {
      const school = element.SkolenhetInfo;
      if (!school.Besoksadress.GeoData.Koordinat_WGS84_Lat) return false;
      if (!school.Besoksadress.GeoData.Koordinat_WGS84_Lng) return false;
      if (
        splitAddress(school.Besoksadress.Adress.trim().toLowerCase())[0] ===
        "box"
      )
        return false;
      if (school.Status !== "Aktiv") return false;
      if (school.Skolenhetstyp !== "Skolenhet") return false;

      // filter all school types that we're not interested in
      if (
        school.Skolformer.filter((skolform) =>
          [
            "Grundskola",
            "Gymnasieskola",
            "Forskoleklass",
            "Grundsameskola",
          ].includes(skolform.type)
        ).length === 0
      ) {
        return false;
      }
      return true;
    })

    // now we unify the data structure
    .map((element) => {
      const school = element.SkolenhetInfo;
      const name = capitalizeWords(
        cleanSchoolName(school.SkolaNamn ? school.SkolaNamn : school.Namn)
      );
      const lat = school.Besoksadress.GeoData.Koordinat_WGS84_Lat;
      const lng = school.Besoksadress.GeoData.Koordinat_WGS84_Lng;
      const addressSplit = splitAddress(school.Besoksadress.Adress.trim());
      let street = addressSplit[0];
      let housenr = addressSplit[1];
      const city = capitalizeWords(school.Besoksadress.Ort.trim());

      // parse out the grades and the level
      const grades = new Set();
      school.Skolformer.forEach((schooltype) => {
        if (schooltype.type === "Forskoleklass") grades.add(0);
        if (
          schooltype.type === "Grundskola" ||
          schooltype.type === "Grundsameskola"
        ) {
          if (schooltype.Ak1) grades.add(1);
          if (schooltype.Ak2) grades.add(2);
          if (schooltype.Ak3) grades.add(3);
          if (schooltype.Ak4) grades.add(4);
          if (schooltype.Ak5) grades.add(5);
          if (schooltype.Ak6) grades.add(6);
          if (schooltype.Ak7) grades.add(7);
          if (schooltype.Ak8) grades.add(8);
          if (schooltype.Ak9) grades.add(9);
        }
      });
      const iscedLevel = new Set();
      school.Skolformer.forEach((schooltype) => {
        if (schooltype.type === "Forskoleklass") iscedLevel.add(0);
        if (
          (schooltype.type === "Grundskola" ||
            schooltype.type === "Grundsameskola") &&
          (grades.has(1) ||
            grades.has(3) ||
            grades.has(4) ||
            grades.has(5) ||
            grades.has(6))
        ) {
          iscedLevel.add(1);
        }
        if (
          schooltype.type === "Grundskola" &&
          (grades.has(7) || grades.has(8) || grades.has(9))
        ) {
          iscedLevel.add(2);
        }
        if (schooltype.type === "Gymnasieskola") iscedLevel.add(3);
      });

      return {
        name,
        lat,
        lng,
        street,
        housenr,
        city,
        postcode: school.Besoksadress.Postnr.trim(),
        operator: capitalizeWords(school.Huvudman.Namn),
        ref: [parseInt(school.Skolenhetskod)],
        grades: Array.from(grades),
        iscedLevel: Array.from(iscedLevel),
        kommun: school.Kommun.Namn,
        website: school.Webbadress,
      };
    });

  console.log("  > Skolenheter after filter and cleanup: " + result.length);
  return result;
};
