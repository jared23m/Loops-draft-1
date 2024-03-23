const {  
    client,
    relativeRootIdOptions,
    keySigNames,
    rootShiftArr,
    filter
  } = require('./index');

const {  
    createRelativeChord,
    getRelativeChordsByLoopId
  } = require('./relativeChords');



async function createLoop({
    userId,
    parentLoopId,
    originalLoopId = null,
    title = null,
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
        INSERT INTO loops(userId, parentLoopId, originalLoopId, title, status, keySig, timestamp) 
        VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `,
        [userId, parentLoopId, originalLoopId, title, status, keySig, timestamp]
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

      return await getLoopWithChordsById(loop.id);
    } catch (error) {
      throw error;
    }
  }

  async function updateLoop(loopId, fields = {}) {
    const { relativeChordNames } = fields; 
    delete fields.relativeChordNames;
  
    const setString = Object.keys(fields)
      .map((key, index) => `${key}=$${index + 1}`)
      .join(", ");
  
    try {
      if (setString.length > 0) {
        const {
          rows: [loop],
        } = await client.query(
          `
          UPDATE loops
          SET ${setString}
          WHERE id=${loopId}
          RETURNING *;
        `,
          Object.values(fields)
        );
      }
  
      if (relativeChordNames == undefined || relativeChordNames == null) {
        return await getLoopWithChordsById(loopId);
      }

        await client.query(`
        DELETE FROM relative_chords
        WHERE loopId = $1;
        `,
        [loopId])

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
                      loopId,
                      relativeRootId, 
                      quality, 
                      name: chord, 
                      position: index
                  });
          })
        )

      return await getLoopWithChordsById(loopId);
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
      const {rows: [user]} = await client.query(
        `
        SELECT id, username, admin, isActive
        FROM users
        WHERE id = $1;
        `,
        [loopRow.userid]
      )
      const relativeChords = await getRelativeChordsByLoopId(loopId);

      const returnObj = {
        ...loopRow,
        user,
        relativeChords
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


  async function getAllLoopsWithChords(){
    try {
      const {rows: loopIds} = await client.query(
        `
        SELECT id
        FROM loops
        `
      );

      const loopsWithChords = await Promise.all(
        loopIds.map((id)=>{
          return getLoopWithChordsById(id.id);
        })

      )

      return loopsWithChords;

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
        return returnObj;
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

  async function getThrulineById(loopId){
    try {
      const singleLoop = await getLoopWithChordsById(loopId);
      if (singleLoop.parentloopid){
        const thruline = await getThrulineById(singleLoop.parentloopid);
        return [
          singleLoop,
          thruline
        ]
      } else {
        return singleLoop;
      }
    } catch (error) {
      throw (error);
    }
  }

  async function destroyLoopById(loopId){
    try{
      const {rows: childLoops} = await client.query(
        `
        SELECT id
        FROM loops
        WHERE parentLoopId = $1;
         `,
         [loopId]
      );

      if (childLoops && childLoops.length != 0){
        const deleteChildLoops = await Promise.all(
          childLoops.map((childLoop) => {
            return destroyLoopById(childLoop.id);
          })
        )
      }

      await client.query(
        `
        DELETE FROM relative_chords
        WHERE loopId = $1;
        `,
        [loopId]
      )

      await client.query(
        `
        DELETE FROM saves
        WHERE loopId = $1;
        `,
        [loopId]
      )
      
      await client.query(
        `
        DELETE FROM loops
        WHERE id = $1;
      `,
      [loopId]
      )

      return null;
      
    } catch (error){
      throw (error);
    }
  }

  async function forkLoop(loopId, forkingUser, status, title){
    try{
      const loopWithChildren = await getLoopWithChildrenById(loopId);
      const currentDate = new Date();
      const timestamp = currentDate.toLocaleString();

      const relativeChordNames = loopWithChildren.relativeChords.map((relativeChord) => {
        return relativeChord.name;
      })

      const loopData = {
        userId: forkingUser,
        parentLoopId: null,
        originalLoopId: loopId,
        title,
        status,
        keySig: loopWithChildren.keysig,
        timestamp,
        relativeChordNames
      }

      const createdLoop = await createLoop(loopData);

      if (loopWithChildren.childLoops) {
        await createForkChildren(createdLoop.id, loopWithChildren.childLoops, forkingUser, timestamp);
      }

      return await getLoopWithChildrenById(createdLoop.id);

    } catch (error){
      throw (error);
    }
  }

  async function createForkChildren(loopId, childLoops, forkingUser, timestamp){
    try{
      const childLayerDuplicates = await Promise.all(
        childLoops.map((childLoop) => {
          const relativeChordNames = childLoop.relativeChords.map((relativeChord) => {
            return relativeChord.name;
          })
          const loopData = {
            userId: forkingUser,
            parentLoopId: loopId,
            originalLoopId: childLoop.id,
            status: 'reply',
            keySig: childLoop.keysig,
            timestamp,
            relativeChordNames
          }

          return createLoop(loopData);
        })
      )

      const childrenOfChildren = await Promise.all(
        childLoops.map((childLoop, index) => {
          if (childLoop.childLoops){
            return createForkChildren(childLayerDuplicates[index].id, childLoop.childLoops, forkingUser, timestamp);
          } else {
            return null;
          }
        })
      )

      return null;

    } catch (error){
      throw (error);
    }
  }

  async function getLoopIsLonely(loopId){
    try{
      const loopRow = await getLoopRowById(loopId);
      const {rows: children} = await client.query(
        `
        SELECT *
        FROM loops
        WHERE parentLoopId = $1;
        `,
        [loopId]
      )

      if (!children || children.length == 0){
        return true;
      } else {
        const everyChild = children.every((child) => {
          return loopRow.userid == child.userid;
        })

        if (!everyChild){
          return false;
        } else {
          const lonelyChildren = await Promise.all(
            children.map((child) => {
              return getLoopIsLonely(child.id);
            })
          )

          const everyGrandchild = lonelyChildren.every((grandchild) => {
            return grandchild;
          })

          return everyGrandchild;
        }
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
    getStartLoopRowById,
    getThrulineById,
    destroyLoopById,
    forkLoop,
    getLoopIsLonely,
    getAllLoopsWithChords
  }