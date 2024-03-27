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

const rootShiftArr = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export function translateToAbsolute(relativeChords, keySig){

    let keySigIndex;

    keySigNames.forEach((name, index) =>{
        if(name == keySig){
            keySigIndex = index;
        }
    });

    const absoluteChords = relativeChords.map((chord) => {
          let absoluteRootId = chord.relativerootid + keySigIndex;
          while (absoluteRootId >= 12){
            absoluteRootId = absoluteRootId - 12;
          }
          const name = `${rootShiftArr[absoluteRootId]}${chord.quality}`;

          return {
            absoluteRootId,
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