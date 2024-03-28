export const keySigNames = ["Cmaj/Amin", 
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

export const rootShiftArr = [
["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
["Db", "Ebb", "Eb", "Fb", "F", "Gb", "Abb", "Ab", "Bbb", "Bb", "Cb", "C"],
["D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B", "C", "C#"],
["Eb", "Fb", "F", "Gb", "G", "Ab", "Bbb", "Bb", "Cb", "C", "Db", "D"],
["E", "F", "F#", "G", "G#", "A", "Bb", "B", "C", "C#", "D", "D#"],
["F", "Gb", "G", "Ab", "A", "Bb", "Cb", "C", "Db", "D", "Eb", "E"],
["Gb", "Abb", "Ab", "Bbb", "Bb", "Cb", "Dbb", "Db", "Ebb", "Eb", "Fb", "F"],
["G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "F#"],
["Ab", "Bbb", "Bb", "Cb", "C", "Db", "Ebb", "Eb", "Fb", "F", "Gb", "G"],
["A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#"],
["Bb", "Cb", "C", "Db", "D", "Eb", "Fb", "F", "Gb", "G", "Ab", "A"],
["B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#"],
]

export const relativeRootIdOptions = ["I", "bII", "II", "bIII", "III", "IV", "bV",  "V", "bVI", "VI", "bVII", "VII"];

export function translateToAbsolute2(potentialChordInfo, keySig){

    let keySigIndex;

    keySigNames.forEach((name, index) =>{
        if(name == keySig){
            keySigIndex = index;
        }
    });

    const rootShiftSubArray = rootShiftArr[keySigIndex];

    const absoluteChords = potentialChordInfo.map((chord) => {

          const name = `${rootShiftSubArray[chord.indexRootId]}${chord.quality}`;

          return name;
        })

    return absoluteChords;
}

export function translateToAbsolute(relativeChords, keySig){

    let keySigIndex;

    keySigNames.forEach((name, index) =>{
        if(name == keySig){
            keySigIndex = index;
        }
    });

    const rootShiftSubArray = rootShiftArr[keySigIndex];

    const absoluteChords = relativeChords.map((chord) => {

          const name = `${rootShiftSubArray[chord.relativerootid]}${chord.quality}`;

          return {
            quality: chord.quality,
            name,
            position: chord.position
          }
        })

    return absoluteChords;
}

export function renderAbsoluteChords(relativeChords, keySig){
  const absoluteChords = translateToAbsolute(relativeChords, keySig);
  return (
      <>
          {absoluteChords.map((chord) => {
              return <div key={chord.position}>
                  <p>{chord.name}</p>
              </div>
          })}
      </>
  )
}