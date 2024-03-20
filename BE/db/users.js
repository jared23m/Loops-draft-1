const {  
    client
  } = require('./index');
const { getLoopWithChordsById, getStartLoopRowById } = require('./loops');

const { filter } = require('./index');

async function createUser({ email, password, username, admin }) {
    if (admin == null) {
      admin = false;
    }
  
    try {
      const {
        rows: [user],
      } = await client.query(
        `
        INSERT INTO users(email, password, username, admin) 
        VALUES($1, $2, $3, $4) 
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
      `,
        [email, password, username, admin]
      );
  
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function getUserRowByUsername(username) {
    try {
      const {
        rows: [user],
      } = await client.query(
        `
        SELECT *
        FROM users
        WHERE username=$1
      `,
        [username]
      );
  
      return user;
    } catch (error) {
      throw error;
    }
  }


  async function getUserRowById(userId) {
    try {
      const {
        rows: [user],
      } = await client.query(`
        SELECT *
        FROM users
        WHERE id=$1;
      `
      , [userId]);
  
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function getPrivateUserPageById(userId){
    try{
      const {rows: [userInfo]} = await client.query(
        `
        SELECT id, email, username, admin
        FROM users
        WHERE id = $1;
        `,
        [userId]
      )

      const {rows: loops} = await client.query(
        `
        SELECT id
        FROM loops
        WHERE userId = $1;
        `,
        [userId]
      )

      const loopsWithChords = await Promise.all (
        loops.map((loop) => {
          return getLoopWithChordsById(loop.id);
        })
      )

      return {
        ...userInfo,
        loops: loopsWithChords
      }
    } catch (error){
      throw (error);
    }
  }

  async function getPublicUserPageById(userId){
    try{
      const {rows: [userInfo]} = await client.query(
        `
        SELECT id, username, admin
        FROM users
        WHERE id = $1;
        `,
        [userId]
      )

      const {rows: loops} = await client.query(
        `
        SELECT id
        FROM loops
        WHERE userId = $1;
        `,
        [userId]
      )

      const filteredLoops = await filter(loops, async (loop) =>{
          const startLoop = await getStartLoopRowById(loop.id);
          return (startLoop.status == 'public');
      })

      const loopsWithChords = await Promise.all (
        filteredLoops.map((loop) => {
          return getLoopWithChordsById(loop.id);
        })
      )

      return {
        ...userInfo,
        loops: loopsWithChords
      }
    } catch (error){
      throw (error);
    }
  }
  module.exports= {
    createUser,
    getUserRowByUsername,
    getUserRowById,
    getPrivateUserPageById,
    getPublicUserPageById
  }