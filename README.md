# skolverket2osm

This projects converts data about schools in Sweden to a file that can be used to import this data into OpenStreetMap.

## How to use this script:

### Prerequisits:

1. You need to have nodeJS (version 16 or higher) installed on your computer
2. You need to have a HERE API key. This is used for their geocoding API. Sign up for one here: https://platform.here.com/portal/

### Run the script

1. Clone this repository into a folder on your computer
2. In the folder, run `npm install` to install all dependencies.
3. Create a `.env` file with the content

```Dotenv
HERE_API_KEY=<your API key>
```

4. Run `npm start` to run the script.
5. The resulting file will be generated in output/skolverket.osm

### Why is a HERE API key needed?

Skolverket's API does return geoposition data, however you can't rely on this data.
A lot of schools have the same position or positions are completely off.
When asked about this problem, Skolverket replied (in Swedish):

> Vi känner till felet. Det handlar om skolenheter som inte har uppdaterats sedan skolenhetsregistret flyttades från SCB, dvs de fick fel koordinater när SCB förvaltade registret. Det är inget som rättas till i databasen, utan görs med fördel av huvudmännen.

Essentially: They know of the problem but will not fix it.
