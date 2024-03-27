const {  
    client
  } = require('./index');
const { getLoopRowById, getStartLoopRowById } = require('./loops');

  async function createSave(userId, loopId){
    try {

        await client.query(
            `
            INSERT INTO saves(userId, loopId) 
            VALUES($1, $2);
             `,
             [userId, loopId]
        )

  
        return {
            message: `Loop saved.`
        }


    } catch (error){
        throw (error);
    }
  }


  async function destroySave(saveId){
    try {
        await client.query(
            `
            DELETE FROM saves
            WHERE id = $1;
             `,
             [saveId]
        )

        return {
            message: `Loop unsaved.`
        }

    } catch (error){
        throw (error);
    }
  }

  
  module.exports = {
    createSave,
    destroySave
  }