const {  
    client,
    relativeRootIdOptions,
    keySigNames,
    rootShiftArr
  } = require('./index');

const {  
    createRelativeChord,
    getRelativeChordsByLoopId
  } = require('./relativeChords');

const {  
    createAbsoluteChord,
    getAbsoluteChordsByLoopId
  } = require('./absoluteChords');



async function createLoop({
    userId,
    parentLoopId,
    status,
    keySig,
    timestamp,
    title,
    relativeChordNames
  }) {
    try {
      console.log("parentloopid", parentLoopId);
      const {
        rows: [loop],
      } = await client.query(
        `
        INSERT INTO loops(userId, parentLoopId, status, keySig, timestamp, title) 
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `,
        [userId, parentLoopId, status, keySig, timestamp, title]
      );

      const relativeChords = await Promise.all(
        relativeChordNames.map((chord, index)=>{
                let numerals;
                if (chord[0] == "b"){
                  const numeralsArr = chord.split('');
                  numeralsArr.splice(0, 1);
                  numerals = numeralsArr.join('');
                } else {
                  numerals = chord;
                }
                let quality;
                if (numerals == numerals.toUpperCase()){
                    quality = "maj";
                } else if (numerals[numerals.length - 1] == 'm'){
                    quality = "dim";
                } else {
                    quality = "min";
                }

                let chordName;
                if (quality == 'dim'){
                    const chordNameArr = chord.split('');
                    chordNameArr.splice(chordNameArr.length - 3, 3);
                    const newChordName = chordNameArr.join('');
                    chordName = newChordName;
                } else {
                    chordName = chord;
                }

                let relativeRootId;
                let counter = 0;
                let done = false;
                while (!done && (counter < relativeRootIdOptions.length)){
                    if (chordName.toLowerCase() == relativeRootIdOptions[counter]) {
                        relativeRootId = counter;
                        done = true;
                    } 

                    counter = counter + 1;
                }

                return createRelativeChord({
                    loopId: loop.id, 
                    relativeRootId, 
                    quality, 
                    name: chord, 
                    position: index
                });
        })
      )

      let keySigIndex;

        keySigNames.forEach((option, index) => {
          if  (loop.keysig == option){
            keySigIndex = index;
          }
      })

      const absoluteChords = await Promise.all(
        relativeChords.map((chord) => {
          let absoluteRootId = chord.relativerootid + keySigIndex;
          while (absoluteRootId >= 12){
            absoluteRootId = absoluteRootId - 12;
          }
          const name = `${rootShiftArr[absoluteRootId]}${chord.quality}`;
          return createAbsoluteChord({
            loopId: loop.id, 
            absoluteRootId, 
            quality: chord.quality,
            name,
            position: chord.position
        });
        })
      )
      return await getLoopRowById(loop.id);
    } catch (error) {
      throw error;
    }
  }

  async function updateLoop({
    status,
    keySig,
    relativeChordNames,
    loopId
  }) {
    try {

      console.log("here");
      console.log(status);
      console.log(keySig);
      const {
        rows: [loop],
      } = await client.query(
        `
        UPDATE loops
        SET status = $2, keySig = $3
        WHERE id = $1
        RETURNING *;
      `,
        [loopId, status, keySig]
      );

      console.log(loop);

      let relativeChords;

      if (relativeChordNames){

          await client.query(
            `
            DELETE FROM relative_chords
            WHERE loopId = $1;
            `,
            [loopId]
          )

        relativeChords = await Promise.all(
          relativeChordNames.map((chord, index)=>{
                  let numerals;
                  if (chord[0] == "b"){
                    const numeralsArr = chord.split('');
                    numeralsArr.splice(0, 1);
                    numerals = numeralsArr.join('');
                  } else {
                    numerals = chord;
                  }
                  let quality;
                  if (numerals == numerals.toUpperCase()){
                      quality = "maj";
                  } else if (numerals[numerals.length - 1] == 'm'){
                      quality = "dim";
                  } else {
                      quality = "min";
                  }
  
                  let chordName;
                  if (quality == 'dim'){
                      const chordNameArr = chord.split('');
                      chordNameArr.splice(chordNameArr.length - 3, 3);
                      const newChordName = chordNameArr.join('');
                      chordName = newChordName;
                  } else {
                      chordName = chord;
                  }
  
                  let relativeRootId;
                  let counter = 0;
                  let done = false;
                  while (!done && (counter < relativeRootIdOptions.length)){
                      if (chordName.toLowerCase() == relativeRootIdOptions[counter]) {
                          relativeRootId = counter;
                          done = true;
                      } 
  
                      counter = counter + 1;
                  }
  
                  return createRelativeChord({
                      loopId: loop.id, 
                      relativeRootId, 
                      quality, 
                      name: chord, 
                      position: index
                  });
          })
        )
      }
    

      let keySigIndex;

      console.log("keysig",loop.keysig);

        keySigNames.forEach((option, index) => {
          if  (loop.keysig == option){
            keySigIndex = index;
          }
        })

        console.log("keysigindex", keySigIndex);

      await client.query(
        `
        DELETE FROM absolute_chords
        WHERE loopId = $1;
        `,
        [loopId]
      );


        const {rows: relativeChordsGet} = await client.query(`
        SELECT *
        FROM relative_chords
        WHERE loopId = $1
        `,
        [loopId])

      console.log("relativeChords", relativeChordsGet);

      const absoluteChords = await Promise.all(
        relativeChordsGet.map((chord) => {
          let absoluteRootId = chord.relativerootid + keySigIndex;
          while (absoluteRootId >= 12){
            absoluteRootId = absoluteRootId - 12;
          }
          const name = `${rootShiftArr[absoluteRootId]}${chord.quality}`;
          return createAbsoluteChord({
            loopId: loop.id, 
            absoluteRootId, 
            quality: chord.quality,
            name,
            position: chord.position
        });
        })
      )

      console.log("absolute", absoluteChords);

      const loopRow = await getLoopRowById(loop.id);
      console.log("looprow", loopRow);
      return await getLoopRowById(loop.id);
    } catch (error) {
      throw error;
    }
  }

  async function getLoopRowById(loopId) {
    try {
      const {
        rows: [loop],
      } = await client.query(
        `
        SELECT *
        FROM loops
        WHERE id=$1;
      `,
        [loopId]
      );
  
      if (!loop) {
        throw {
          name: "LoopNotFoundError",
          message: "Could not find a loop with that loopId",
        };
      }
  
      return loop;
    } catch (error) {
      throw error;
    }
  }

  async function getLoopWithChordsById(loopId){
    try {
      const loopRow = await getLoopRowById(loopId);
      const relativeChords = await getRelativeChordsByLoopId(loopId);
      const absoluteChords = await getAbsoluteChordsByLoopId(loopId);

      const returnObj = {
        ...loopRow,
        relativeChords,
        absoluteChords
      }

      return returnObj;
    } catch (error) {
      throw (error);
    }
  }

  async function getAllPublicLoopsWithChords(){
    try {
      const {rows: publicLoopIds} = await client.query(
        `
        SELECT id
        FROM loops
        WHERE status='public'
        `
      );

      const publicLoopsWithChords = await Promise.all(
        publicLoopIds.map((id)=>{
          return getLoopWithChordsById(id.id);
        })

      )

      return publicLoopsWithChords;

    } catch (error){
      throw (error);
    }
  }

  module.exports = {
    createLoop,
    updateLoop,
    getLoopRowById,
    getLoopWithChordsById,
    getAllPublicLoopsWithChords
  }