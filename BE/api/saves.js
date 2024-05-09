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
            const {rows: [accessGiven]} = await client.query(
              `
              SELECT id
              FROM access
              WHERE userId = $1 AND loopId = $2;
              `,
              [userId, startLoop.id]
            )
      
            if (!(accessGiven)){
              next({
                name: "PrivateLoopError",
                message: `This loop is private, or a reply to a private loop. You can only save it if you are the creator. `
              });
              return
            }

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
            const destroyedSave = await destroySave(currentlySaved.id);
            res.send(destroyedSave);
        } else {
            const createdSave = await createSave(userId, loopId);
            res.send(createdSave);
        }

    } catch (err) {
      next(err);
    }
  });

  module.exports = savesRouter;