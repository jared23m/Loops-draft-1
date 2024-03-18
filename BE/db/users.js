const {  
    client
  } = require('./index');

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
  module.exports= {
    createUser,
    getUserRowByUsername,
    getUserRowById
  }