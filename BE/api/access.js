const express = require("express");
const accessRouter = express.Router();
const { requireUser, requireAdmin } = require("./utils");

const { client } = require("../db");

const {
    getLoopRowById
} = require("../db/loops");
const { updateAccess } = require("../db/access");


accessRouter.post("/:loopId", requireUser, async (req, res, next) => {
    const userId = req.user.id;
    const {loopId} = req.params;
    const {userArr} = req.body;

    try{
          const loopInQuestion = await getLoopRowById(loopId);

          if (loopInQuestion.status != 'private'){
            next({
                name: "LoopStatusError",
                message: "You cannot give access to this loop because its status is something other than private."
              });
              return
          }

          if (userId != loopInQuestion.userid){
            next({
                name: "LoopStatusError",
                message: "You cannot give access to this loop because it is a private loop that isn't yours."
              });
              return
          }

        const accessUpdated = await updateAccess(loopId, userArr);

        res.send(accessUpdated);

    } catch (err) {
      next(err);
    }
  });

  module.exports = accessRouter;