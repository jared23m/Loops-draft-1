const {  
    client
  } = require('./index');
const { getLoopRowById, getStartLoopRowById } = require('./loops');

  async function updateAccess(loopId, userIdArr){
    try {

        await client.query(
            `
            DELETE FROM access
            WHERE loopId = $1;
             `,
             [loopId]
        ) 

        await Promise.all(
            userIdArr.map((userId)=>{
                return grantAccess(loopId, userId);
            })
        );
  
        return {
            message: `Access granted to users.`
        }


    } catch (error){
        throw (error);
    }
  }

  async function grantAccess(loopId, userId){
    try {

        await client.query(
            `
            INSERT INTO access(loopId, userId) 
            VALUES($1, $2)
            RETURNING *;
          `,
            [loopId, userId]
          );
  
        return {
            message: `Access granted to individual user.`
        }


    } catch (error){
        throw (error);
    }
  }

  async function getAllAccess(){
    try {

        const {rows: accessRows} = await client.query(
            `
            SELECT *
            FROM access
          `
          );
  
        return accessRows;

    } catch (error){
        throw (error);
    }
  }

  async function getUserIdsThatHaveAccess(loopId){
    try {

      const {rows: users} = await client.query(
          `
          SELECT userId
          FROM access
          WHERE loopId = $1
        `,
        [loopId]
        );

      const userIds = users.map((user)=>{
        return user.userid;
      })
      
      return userIds;

  } catch (error){
      throw (error);
  }
  }
  

  
  module.exports = {
    updateAccess,
    grantAccess,
    getAllAccess,
    getUserIdsThatHaveAccess
  }