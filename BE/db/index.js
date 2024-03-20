const { Client } = require("pg"); // imports the pg module

const client = new Client({
  connectionString:
    process.env.DATABASE_URL || "postgres://localhost:5432/loops-dev",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

const relativeRootIdOptions = ["i", "bii", "ii", "biii", "iii", "iv", "bv",  "v", "bvi", "vi", "bvii", "vii"];

const relativeChordNameOptions = ["i", "bii", "ii", "biii", "iii", "iv", "bv",  "v", "bvi", "vi", "bvii", "vii", "idim", "biidim", "iidim", "biiidim", "iiidim", "ivdim", "bvdim",  "vdim", "bvidim", "vidim", "bviidim", "viidim"]

const keySigNames = ["Cmaj/Amin", 
"Dbmaj/Bbmin", 
"Dmaj/Bmin", 
"Ebmaj/Cmin", 
"Emaj/C#min", 
"Fmaj/Dmin", 
"Gbmaj/Ebmin", 
"Gmaj/Emin",
"Abmaj/Fmin",
"Amaj/F#min",
"Bbmaj/Gmin",
"Bmaj/G#min"]

const rootShiftArr = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

async function filter(arr, callback) {
  const fail = Symbol()
  return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i=>i!==fail)
}

module.exports = {
    client,
    relativeRootIdOptions,
    keySigNames,
    rootShiftArr,
    relativeChordNameOptions,
    filter
}