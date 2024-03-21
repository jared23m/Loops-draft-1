
require('dotenv').config();
const bcrypt = require("bcrypt");

const {  
    client
  } = require('./index');

const {  
    createUser, getUserRowById
} = require('./users');

const {  
  createLoop, 
  getLoopRowById, 
  getLoopWithChordsById, 
  getAllPublicLoopsWithChords, 
  getLoopWithChildrenById,
  forkLoop
} = require('./loops');

const {  
  getRelativeChordsByLoopId
} = require('./relativeChords');

const {  
  getAbsoluteChordsByLoopId
} = require('./absoluteChords');
  
  async function dropTables() {
    try {
      console.log("Starting to drop tables...");
  
      await client.query(`
        DROP TABLE IF EXISTS likes;
        DROP TABLE IF EXISTS absolute_chords;
        DROP TABLE IF EXISTS relative_chords;
        DROP TABLE IF EXISTS notifications;
        DROP TABLE IF EXISTS follows;
        DROP TABLE IF EXISTS requests_to_follow;
        DROP TABLE IF EXISTS loops;
        DROP TABLE IF EXISTS users;
      `);
  
      console.log("Finished dropping tables!");
    } catch (error) {
      console.error("Error dropping tables!");
      throw error;
    }
  }
  
  async function createTables() {
    try {
      console.log("Starting to build tables...");
  
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          username varchar(255) UNIQUE NOT NULL,
          admin boolean DEFAULT false NOT NULL,
          timeOut boolean DEFAULT false NOT NULL
        );
  
        CREATE TABLE loops (
          id SERIAL PRIMARY KEY,
          userId INTEGER REFERENCES users(id),
          parentLoopId INTEGER REFERENCES loops(id),
          originalLoopId INTEGER,
          timestamp varchar(255) NOT NULL,
          status varchar(255) NOT NULL,
          keySig varchar(255) NOT NULL,
          likeCount int DEFAULT 0 NOT NULL
        );
  
        CREATE TABLE relative_chords (
            id SERIAL PRIMARY KEY,
            loopId INTEGER REFERENCES loops(id),
            relativeRootId int NOT NULL,
            quality varchar(255) NOT NULL,
            name varchar(255) NOT NULL,
            position int NOT NULL
          );
        
          CREATE TABLE absolute_chords (
            id SERIAL PRIMARY KEY,
            loopId INTEGER REFERENCES loops(id),
            absoluteRootId int NOT NULL,
            quality varchar(255) NOT NULL,
            name varchar(255) NOT NULL,
            position int NOT NULL
          );

          CREATE TABLE likes (
            id SERIAL PRIMARY KEY,
            userId INTEGER REFERENCES users(id),
            loopId INTEGER REFERENCES loops(id)
          );

          CREATE TABLE follows (
            id SERIAL PRIMARY KEY,
            followingUserId INTEGER REFERENCES users(id),
            followedUserId INTEGER REFERENCES users(id)          
            );

          CREATE TABLE requests_to_follow (
            id SERIAL PRIMARY KEY,
            followingUserId INTEGER REFERENCES users(id),
            followedUserId INTEGER REFERENCES users(id)
          );

          CREATE TABLE notifications (
            id SERIAL PRIMARY KEY,
            userId INTEGER REFERENCES users(id),
            loopId INTEGER REFERENCES loops(id),
            timestamp TIMESTAMP NOT NULL,
            fresh boolean DEFAULT true NOT NULL
          );
      `);
  
      console.log("Finished building tables!");
    } catch (error) {
      console.error("Error building tables!");
      throw error;
    }
  }
  
 async function createInitialUsers() {
    try {
      console.log("Starting to create users...");
      const adminPass =  await bcrypt.hash(process.env.ADMIN_PASS, 10);
      const userPass = await bcrypt.hash(process.env.USER_PASS, 10);
  
      await createUser({ 
        email: 'adminTest@gmail.com',
        password: adminPass,
        username: 'adminTest', 
        admin: true
      });
      await createUser({ 
        email: 'userTest@gmail.com',
        password: userPass,
        username: 'userTest', 
      });
      console.log("Finished creating users!");
    } catch (error) {
      console.error("Error creating users!");
      throw error;
    }
  }

  async function createInitialLoops() {
    try {
      console.log("Starting to create loops...");
      const currentDate = new Date();
      const timestamp = currentDate.toLocaleString();
  
      await createLoop({ 
        userId: 1,
        parentLoopId: null,
        status: "public",
        keySig: "Gmaj/Emin",
        timestamp: timestamp,
        relativeChordNames: ["I", "V", "vi", "IV"]
      });

      await createLoop({ 
        userId: 2,
        parentLoopId: 1,
        status: "reply",
        keySig: "Cmaj/Amin",
        timestamp: timestamp,
        relativeChordNames: ["I", "V", "vi", "IV"]
      });

      await createLoop({ 
        userId: 2,
        parentLoopId: 1,
        status: "reply",
        keySig: "Fmaj/Dmin",
        timestamp: timestamp,
        relativeChordNames: ["I", "V", "vi", "IV"]
      });

      await createLoop({ 
        userId: 1,
        parentLoopId: 2,
        status: "reply",
        keySig: "Emaj/C#min",
        timestamp: timestamp,
        relativeChordNames: ["I", "V", "vi", "IV"]
      });
      console.log("Finished creating loops!");
    } catch (error) {
      console.error("Error creating loops!");
      throw error;
    }
  }
  
  async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
      await createInitialLoops();
    } catch (error) {
      console.log("Error during rebuildDB")
      throw error;
    }
  }

  async function testDB(){
    try {
      const userRow2 = await getUserRowById(2);
      console.log("user with id 2: ", userRow2);

      const loop1WithChildren = await getLoopWithChildrenById(1);
      console.log("loop 1 with children", loop1WithChildren);

      const forkedLoop = await forkLoop(1, 2, 'public');
      console.log("forked loop test", forkedLoop);

    } catch (error){
      console.log("Error testing db")
      throw error;
    }
  }
  
  rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());