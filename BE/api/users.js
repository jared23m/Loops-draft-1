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
    getUserRowById
} = require("../db/users");

const jwt = require("jsonwebtoken");

usersRouter.post("/register", async (req, res, next) => {
  const { email, password: unhashed, username } = req.body;

  try {
    const user = await getUserRowByUsername(username);
    if (user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
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

usersRouter.get("/:userId/", async (req, res, next) => {
  const { userId } = req.params;
  try {
    let user;

    if (req.user && (req.user.id == userId || req.user.admin)) {
      user = await getPrivateUserPageById(userId);
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

usersRouter.delete("/:userId", requireAdmin, async (req, res, next) => {
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
    const deletedUser = await destroyUserById(userId);
    res.send({
      name: "DeleteConfirmation",
      destroyedUser: deletedUser,
    });
  } catch (error){
    throw (error);
  }
})

module.exports = usersRouter;