const {  
    client
  } = require('./index');

const {  
    createRelativeChord
  } = require('./relativeChords');

const relativeRootIdOptions = ["i", "bii", "ii", "biii", "iii", "iv", "bv",  "v", "bvi", "vi", "bvii", "vii"];

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
                let quality;
                if (chord == chord.toUpperCase()){
                    quality = "maj";
                } else if (chord[chord.length - 1] == 'm'){
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
      return getLoopRowById(loop.id);
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
  module.exports = {
    createLoop,
    getLoopRowById
  }