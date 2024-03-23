const express = require("express");
const savesRouter = express.Router();
const { requireUser, requireAdmin } = require("./utils");

const {
    createSave,
    destroySave
} = require("../db/saves");

const { client } = require("../db");

const {
  getStartLoopRowById
} = require("../db/loops");


savesRouter.post("/:loopId", requireUser, async (req, res, next) => {
    const userId = req.user.id;
    const {loopId} = req.params;
    try{
          const startLoop = await getStartLoopRowById(loopId);

          if (startLoop.status == 'loopBank'){
            next({
                name: "LoopStatusError",
                message: "You cannot save this loop because it is a loopBank loop."
              });
              return
          }

          if (startLoop.status == 'private' && userId != startLoop.userid){
            next({
                name: "LoopStatusError",
                message: "You cannot save this loop because its start loop is a private loop that isn't yours."
              });
              return

          }

        const {rows: [currentlySaved]} = await client.query(
            `
            SELECT id
            FROM saves
            WHERE userId = $1 AND loopId = $2;
            `,
            [userId, loopId]
        )

        if (currentlySaved){
          console.log("out");
            const destroyedSave = await destroySave(currentlySaved.id);
            res.send(destroyedSave);
        } else {
          console.log("in");
            const createdSave = await createSave(userId, loopId);
            res.send(createdSave);
        }

    } catch (err) {
      next(err);
    }
  });

  module.exports = savesRouter;