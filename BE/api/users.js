const express = require("express");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");
const { requireUser, requireAdmin } = require("./utils");

const {
    getUserRowByUsername,
    createUser,
    getPrivateUserPageById,
    getPublicUserPageById,
    getAllUsers,
    getAllUsersPrivate,
    destroyUserById,
    getUserRowById,
    updateUser,
} = require("../db/users");

const {
  lettersAndNumbers
} = require("../db/index")

const {
  getLoopBankByUser
} = require("../db/loops")

const jwt = require("jsonwebtoken");

usersRouter.post("/register", async (req, res, next) => {
  const { email, password: unhashed, username } = req.body;

  try {

    const trimmedUsername = username.replaceAll(' ', '');
    const trimmedPassword = unhashed.replaceAll(' ', '');
    const trimmedEmail = email.replaceAll(' ', '');

    if ((trimmedUsername == '' || trimmedPassword == '' || trimmedEmail == '')){
      next({
        name: "EntryInvalid",
        message: "Entries must not be left blank.",
      });
      return
    }
    if (unhashed.length < 8){
      next({
        name: "EntryInvalid",
        message: "Password must be 8-15 characters.",
      });
      return
    }
    if (unhashed.length > 15){
      next({
        name: "EntryInvalid",
        message: "Password must be 8-15 characters.",
      });
      return
    }
    if (username.length > 8){
      next({
        name: "EntryInvalid",
        message: "Username must be 8 or fewer characters.",
      });
      return
    }
   
    if (!email.includes("@")){
      next({
        name: "EntryInvalid",
        message: "Email must include an @ symbol",
      });
      return
    }

    if (email.length > 30){
      next({
        name: "EntryInvalid",
        message: "Email must be fewer than 30 characters"
      });
      return
    }

    if (!lettersAndNumbers(username)){
      next({
        name: "UsernameInvalid",
        message: "Usernames can only have letters and numbers.",
      });
      return
    }
    if (!lettersAndNumbers(unhashed)){
      next({
        name: "PasswordInvalid",
        message: "Passwords can only have letters and numbers.",
      });
      return
    }
    const user = await getUserRowByUsername(username);
    if (user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists.",
      });
    }

    const password = await bcrypt.hash(unhashed, 10);
    const newUser = await createUser({
      email,
      password,
      username
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1w",
    });

    const { admin } = newUser;

    res.send({
      message: "Thank you for signing up!",
      token,
      admin,
      username,
      accountId: newUser.id
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please provide username and password",
    });
  }
  try {
    const user = await getUserRowByUsername(username);
    let auth;

    if (user && !user.isactive){
      next({
        name: "InactiveUser",
        message: "This user is no longer active.",
      });
      return
    }
    if (user) {
      auth = await bcrypt.compare(password, user.password);
    }
    if (user && auth) {
      const token = jwt.sign(
        { id: user.id, username },
        process.env.JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );
      const { admin } = user;
      res.send({
        message: "Successfully logged in!",
        token,
        admin,
        username,
        accountId: user.id
      });
    } else {
      next({
        name: "InvalidCredentialsError",
        message: "Invalid username or password",
      });
    }
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/loopBank", requireUser, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isActive = req.user.isactive;
    const admin = req.user.admin;
    if (!admin && !isActive){
      next({
        name: "InactiveUser",
        message: "This user is no longer active. You can only view them if you are an admin.",
      });
      return;
    }

    const loopBank = await getLoopBankByUser(userId);

    res.send(loopBank);
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/:userId/", async (req, res, next) => {
  const { userId } = req.params;
  try {
    let user;
    const userRow = await getUserRowById(userId);

    if ((!req.user || !req.user.admin) && !userRow.isactive){
      next({
        name: "InactiveUser",
        message: "This user is no longer active. You can only view them if you are an admin.",
      });
      return;
    }

    if (req.user && (req.user.id == userId || req.user.admin)) {
      user = await getPrivateUserPageById(userId, req.user.id);
    } else if (req.user) {
      user = await getPublicUserPageById(userId, req.user.id);
    } else {
      user = await getPublicUserPageById(userId);
    }

    res.send(user);
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    let users;
    if (req.user && req.user.admin){
      users = await getAllUsersPrivate();
    } else {
      users = await getAllUsers();
    }
    res.send( users );
  } catch (error) {
    throw (error);
  }
});

usersRouter.delete("/:userId", requireUser, requireAdmin, async (req, res, next) => {
  const {userId} = req.params;
  try {
    const potentialDeletedUser = await getUserRowById(userId);
    if (req.user.id == potentialDeletedUser.id){
      next({
        name: "CredentialsError",
        message: "You cannot delete yourself, even if you are an admin.",
      });
      return
    }
    const deletedUser = await getUserRowById(userId);
    const deletingUser = await destroyUserById(userId);
    delete deletedUser.email;
    delete deletedUser.password;
    res.send({
      name: "DeleteConfirmation",
      destroyedUser: deletedUser,
    });
  } catch (error){
    throw (error);
  }
})

usersRouter.patch("/:userId/", requireUser, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const tokenId = req.user.id;
    const { body } = req;
    

    const userRow = await getUserRowById(userId);

    if (!req.user.admin && !userRow.isactive){
      next({
        name: "InactiveUser",
        message: "This user is no longer active. You can only edit them if you are an admin.",
      });
      return;
    }
    
    let newBody;
    if (req.user.admin && tokenId == userId){
      newBody = {
        email: body.email,
        password: body.password,
        username: body.username,
      }
    } else  if (req.user.admin){
      newBody = {
        email: body.email,
        password: body.password,
        username: body.username,
        admin: body.admin,
        isActive: body.isActive
      }
    } else if (tokenId == userId){
      newBody = {
        email: body.email,
        password: body.password,
        username: body.username,
        isActive: body.isActive,
      }
    } else {
      next({
        name: "CredentialsError",
        message: "You cannot change this users user info because you are not the user."
      });
    }
    
    if (!newBody.email || newBody.email == ''){
      delete newBody.email;
    } 

    if (!newBody.password || newBody.password == ''){
      delete newBody.password;
    }

    if (!newBody.username || newBody.username == ''){
      delete newBody.username;
    }

    if (!newBody.admin){
      delete newBody.admin;
    }

    if (!newBody.isActive){
      delete newBody.isActive;
    }

    if (newBody.password && newBody.password.length < 8){
      next({
        name: "EntryInvalid",
        message: "Password must be 8-15 characters.",
      });
      return
    }
    if (newBody.username && newBody.username.length > 8){
      next({
        name: "EntryInvalid",
        message: "Username must be 8 or fewer characters.",
      });
      return
    }
    if (newBody.password && newBody.password.length > 15){
      next({
        name: "EntryInvalid",
        message: "Password must be 8-15 characters.",
      });
      return
    }
    if (newBody.email && !newBody.email.includes("@")){
      next({
        name: "EntryInvalid",
        message: "Email must include an @ symbol",
      });
      return
    }

    if (newBody.email && newBody.email.length > 30){
      next({
        name: "EntryInvalid",
        message: "Email must be fewer than 30 characters"
      });
      return
    }

    if (newBody.username && !lettersAndNumbers(newBody.username)){
      next({
        name: "UsernameInvalid",
        message: "Usernames can only have letters and numbers.",
      });
      return
    }
    if (newBody.username){
      const user = await getUserRowByUsername(newBody.username);
      if (user && user.id != req.user.id) {
        next({
          name: "UserExistsError",
          message: "Another user by that username already exists.",
        });
      }
    }

    if (newBody.password && !lettersAndNumbers(newBody.password)){
      next({
        name: "PasswordInvalid",
        message: "Passwords can only have letters and numbers.",
      });
      return
    }

    if (newBody.password) {
      newBody.password = await bcrypt.hash(newBody.password, 10);
    }

      const updatingUser = await updateUser(userId, newBody);
      const updatedUser = await getUserRowById(userId);
      delete updatedUser.email;
      delete updatedUser.password;
      res.send(updatedUser);

  } catch (err) {
    next(err);
  }
});

module.exports = usersRouter;