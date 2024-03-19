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
    relativeChordNames
  }) {
    try {
      const {
        rows: [loop],
      } = await client.query(
        `
        INSERT INTO loops(userId, parentLoopId, status, keySig, timestamp) 
        VALUES($1, $2, $3, $4, $5)
        RETURNING *;
      `,
        [userId, parentLoopId, status, keySig, timestamp]
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
    loopId
  }) {
    try {

      await client.query(
        `
        UPDATE loops
        SET status = $2
        WHERE id = $1
      `,
        [loopId, status]
      );

      const loopRow = await getLoopRowById(loopId);
      return loopRow;
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

  async function getLoopWithChildrenById(loopId){
    try {
      const loop = await getLoopWithChordsById(loopId);

      const {rows: children} = await client.query(
        `
        SELECT id
        FROM loops
        WHERE parentLoopId=$1;
        `,
        [loopId]
      )

      let returnObj;

      if (!children || children.length == 0){
        returnObj = loop;
      } else {
        const childLoops = await Promise.all(
          children.map((child)=>{
            return getLoopWithChildrenById(child.id);
          })
        );

        returnObj = {
          ...loop,
          childLoops
        }
        return returnObj;
      }
    } catch (error){
      throw (error);
    }
  }

  async function getStartLoopRowById(loopId){
    try {
      const loop = await getLoopRowById(loopId);
      if (!loop.parentloopid){
        return loop;
      } else {
        return await getStartLoopRowById(loop.parentloopid);
      }
    } catch (error){
      throw (error);
    }
  }

  module.exports = {
    createLoop,
    updateLoop,
    getLoopRowById,
    getLoopWithChordsById,
    getAllPublicLoopsWithChords,
    getLoopWithChildrenById,
    getStartLoopRowById
  }