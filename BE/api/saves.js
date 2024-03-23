const express = require("express");
const savesRouter = express.Router();
const { requireUser, requireAdmin } = require("./utils");

const {
    createSave
} = require("../db/saves");


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
        const currentlySaved = await getCurrentlySaved(userId, loopId);

        if (currentlySaved){
            const destroyedSave = await destroySave(currentlySaved.id);
            return destroyedSave;
        } else {
            const createdSave = await createSave(userId, loopId);
            return createdSave;
        }

    } catch (err) {
      next(err);
    }
  });

  module.exports = savesRouter;