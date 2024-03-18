const {  
    client
  } = require('./index');

  async function createAbsoluteChord({
    loopId,
    absoluteRootId,
    quality,
    name,
    position
  }) {
    try {
        const {rows: [absoluteChord]} = await client.query(
            `
            INSERT INTO absolute_chords(loopId, absoluteRootId, quality, name, position) 
            VALUES($1, $2, $3, $4, $5)  
            RETURNING *    
            `,
            [loopId, absoluteRootId, quality, name, position]
        );
      
        return absoluteChord;
    } catch (error) {
      throw error;
    }
  }

  async function getAbsoluteChordsByLoopId(loopId){
    const {rows: absoluteChords} = await client.query(
        `
        SELECT *
        FROM absolute_chords
        WHERE loopId = $1;
        `,
        [loopId]
    );

    const inOrder = absoluteChords.sort(function(a, b) {
        var x = a['position']; var y = b['position'];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });

    return inOrder;
  }

  module.exports = {
    createAbsoluteChord,
    getAbsoluteChordsByLoopId,
  }