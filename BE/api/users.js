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
    updateUser
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
    const deletedUser = await destroyUserById(userId);
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
    
    if (!newBody.email){
      delete newBody.email;
    }

    if (!newBody.password){
      delete newBody.password;
    }

    if (!newBody.username){
      delete newBody.username;
    }

    if (!newBody.admin){
      delete newBody.admin;
    }

    if (!newBody.isActive){
      delete newBody.isActive;
    }


    if (newBody.password) {
      newBody.password = await bcrypt.hash(newBody.password, 10);
    }

      const updatedUser = await updateUser(id, newBody);
      res.send(updatedUser);

  } catch (err) {
    next(err);
  }
});

module.exports = usersRouter;