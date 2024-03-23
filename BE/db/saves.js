const {  
    client
  } = require('./index');
const { getLoopRowById, getStartLoopRowById } = require('./loops');

  async function createSave(userId, loopId){
    try {
        const {rows: [user]} = await client.query(
            `
            SELECT username
            FROM users
            WHERE id = $1;
            `,
            [userId]
        )
        const loopRow = await getLoopRowById(loopId);
        const reply = (loopRow.status == 'reply');
        const startLoopRow = await getStartLoopRowById(loopId);

        await client.query(
            `
            INSERT INTO saves(userId, loopId) 
            VALUES($1, $2);
             `,
             [userId, loopId]
        )

       if (reply){
        return {
            message: `This reply from the start loop "${startLoopRow.title}" was saved by ${user.username}.`
        }
       } else {
        return {
            message: `This loop "${startLoopRow.title}" was saved by ${user.username}.`
        }
       }

    } catch (error){
        throw (error);
    }
  }


  async function destroySave(saveId){
    try {

        console.log('here now');
        const {rows: [save]} = await client.query(
            `
            SELECT userId, loopId
            FROM saves
            WHERE id = $1;
            `,
            [saveId]
        )

        const {rows: [user]} = await client.query(
            `
            SELECT username
            FROM users
            WHERE id = $1;
            `,
            [save.userid]
        )

        const loopRow = await getLoopRowById(save.loopid);
        const reply = (loopRow.status == 'reply');
        const startLoopRow = await getStartLoopRowById(save.loopid);

        await client.query(
            `
            DELETE FROM saves
            WHERE id = $1;
             `,
             [saveId]
        )

       if (reply){
        return {
            message: `This reply from the start loop "${startLoopRow.title}" was unsaved by ${user.username}.`
        }
       } else {
        return {
            message: `This loop "${startLoopRow.title}" was unsaved by ${user.username}.`
        }
       }

    } catch (error){
        throw (error);
    }
  }

  
  module.exports = {
    createSave,
    destroySave
  }