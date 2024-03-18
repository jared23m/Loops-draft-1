const {  
    client
  } = require('./index');

  async function createRelativeChord({
    loopId,
    relativeRootId,
    quality,
    name,
    position
  }) {
    try {
        const {rows: [relativeChord]} = await client.query(
            `
            INSERT INTO relative_chords(loopId, relativeRootId, quality, name, position) 
            VALUES($1, $2, $3, $4, $5) 
            RETURNING *;
            `,
            [loopId, relativeRootId, quality, name, position]
        );
      
        return relativeChord;
    } catch (error) {
      throw error;
    }
  }

  async function getRelativeChordsByLoopId(loopId){
    const {rows: relativeChords} = await client.query(
        `
        SELECT *
        FROM relative_chords
        WHERE loopId = $1;
        `,
        [loopId]
    );

    const inOrder = relativeChords.sort(function(a, b) {
        var x = a['position']; var y = b['position'];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });

    return inOrder;
  }

  module.exports = {
    createRelativeChord,
    getRelativeChordsByLoopId,
  }