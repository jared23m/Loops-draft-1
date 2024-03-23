const express = require("express");
const apiRouter = express.Router();
const path = require("path");

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const {
    getUserRowById
} = require("../db/users");

apiRouter.use(express.static(path.join(__dirname, "documentation")));

apiRouter.use(async (req, res, next) => {
  const auth = req.header("Authorization");
  const token = auth?.split(" ")[1];

  if (!auth) next();
  else {
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      if (id) {
        req.user = await getUserRowById(id);
        next();
      } else
        next({
          name: "AuthorizationHeaderError",
          message: "Authorization token malformed",
        });
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
});

apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);
  }

  next();
});

const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);

const loopsRouter = require("./loops");
apiRouter.use("/loops", loopsRouter);

const savesRouter = require("./saves");
apiRouter.use("/saves", savesRouter);

apiRouter.use((error, req, res, next) => {
  res.send(error);
});

module.exports = apiRouter;
