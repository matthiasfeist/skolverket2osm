module.exports = function (schoolsInput) {
  console.log("Merging school units into single schools.");
  console.log("  > Skolenheter in input: " + schoolsInput.length);

  const result = new Map();
  for (let i = 0; i < schoolsInput.length; i++) {
    const schoolElement = schoolsInput[i];
    const mapKey = schoolElement.name + "/" + schoolElement.city;

    if (result.has(mapKey)) {
      const existingSchool = result.get(mapKey);
      existingSchool.ref.push(...schoolElement.ref);
      existingSchool.grades.push(...schoolElement.grades);
      existingSchool.iscedLevel.push(...schoolElement.iscedLevel);
    } else {
      result.set(mapKey, schoolElement);
    }
  }

  const resultArr = Array.from(result.values());
  console.log("  > Schools after merging: " + resultArr.length);
  return resultArr;
};
