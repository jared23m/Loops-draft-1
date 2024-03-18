const express = require("express");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");
const { requireUser, requireAdmin } = require("./utils");
const { returnImageUrl } = require("./uploadImage");

const {
    getUserRowByUsername,
    createUser
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
