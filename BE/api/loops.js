const express = require("express");
const loopsRouter = express.Router();
const { requireUser, requireAdmin } = require("./utils");

const {
    createLoop, 
    getLoopRowById,
    updateLoop,
    getAllPublicLoopsWithChords,
    getStartLoopRowById,
    getLoopWithChildrenById,
    getThrulineById,
    destroyLoopById,
    forkLoop
} = require("../db/loops");

const {
  keySigNames,
  relativeChordNameOptions
} = require("../db/index");

loopsRouter.post("/", requireUser, async (req, res, next) => {
    const { id: userId } = req.user;
    const { body } = req;

    if (!body.parentLoopId){
        body.parentLoopId = null;
    }

    if (!(body.status == 'public' || body.status == 'private' || body.status == 'loopBank')){
        next({
            name: "LoopStatusInvalid",
            message: "A loop created through this endpoint must either be public, private, or loopBank.",
          });
        return
    }

    const keySigMatch = keySigNames.find((name) => {
        return body.keySig == name;
    })

    if (!keySigMatch){
        next({
            name: "KeySigInvalid",
            message: `A loop must have one of these key signature names:
                    "Cmaj/Amin',  
                    "Dbmaj/Bbmin", 
                    "Dmaj/Bmin",
                    "Ebmaj/Cmin", 
                    "Emaj/C#min", 
                    "Fmaj/Dmin", 
                    "Gbmaj/Ebmin", 
                    "Gmaj/Emin",
                    "Abmaj/Fmin",
                    "Amaj/F#min",
                    "Bbmaj/Gmin",
                    "Bmaj/G#min"
                    `
          });
          return
    }

    if (!body.relativeChordNames || body.relativeChordNames.length == 0 || body.relativeChordNames.length > 4){
      next({
        name: "relativeChordArrayInvalid",
        message: `A loop must have at least 1 and no more than 4 relative chord names.`
      });
      return
    }

    let chordNameInvalid;
    let counter = 0;

    while (!chordNameInvalid && counter < body.relativeChordNames.length){
      const found = relativeChordNameOptions.find((option) =>{
        return body.relativeChordNames[counter].toLowerCase() == option;
      });

      if (!found){
        chordNameInvalid = true;
      }

      counter = counter + 1;
    }

    if (chordNameInvalid){
      next({
        name: "relativeChordNameInvalid",
        message: `A chord name must either be flat (b in front) or neutral (neither b or # in front). I (i) and IV (iv) cannot be flat. It must be a roman numeral 1-7, 
        either capital or lowercase. It can have an optional "dim" suffix.`
      });
      return
    }

    const currentDate = new Date();
    body.timestamp = currentDate.toLocaleString();
    
    const loop = { ...body, userId };
    try {
      const newLoop = await createLoop(loop);
      res.send(newLoop);
    } catch (err) {
      next(err);
    }
  });

  loopsRouter.post("/:loopId", requireUser, async (req, res, next) => {
    const { id: userId } = req.user;
    const { loopId } = req.params;
    const { body } = req;
    try {
    const loopInQuestion = await getStartLoopRowById(loopId);
  
    if (loopInQuestion.status == 'loopBank'){
      next({
        name: "LoopBankError",
        message: `This loop is a loopBank loop. You cannot reply to it, even if you are the creator.`
      });
      return
    } else if (loopInQuestion.status == "private" && userId != loopInQuestion.userid) {
      next({
        name: "PrivateLoopError",
        message: `This loop is private, or a reply to a private loop. You can only reply to it if you are the creator. `
      });
      return
    }

    body.parentLoopId = loopId;

    body.status = 'reply';

    const keySigMatch = keySigNames.find((name) => {
        return body.keySig == name;
    })

    if (!keySigMatch){
        next({
            name: "KeySigInvalid",
            message: `A loop must have one of these key signature names:
                    "Cmaj/Amin',  
                    "Dbmaj/Bbmin", 
                    "Dmaj/Bmin",
                    "Ebmaj/Cmin", 
                    "Emaj/C#min", 
                    "Fmaj/Dmin", 
                    "Gbmaj/Ebmin", 
                    "Gmaj/Emin",
                    "Abmaj/Fmin",
                    "Amaj/F#min",
                    "Bbmaj/Gmin",
                    "Bmaj/G#min"
                    `
          });
          return
    }

    if (!body.relativeChordNames || body.relativeChordNames.length == 0 || body.relativeChordNames.length > 4){
      next({
        name: "relativeChordArrayInvalid",
        message: `A loop must have at least 1 and no more than 4 relative chord names.`
      });
      return
    }

    let chordNameInvalid;
    let counter = 0;

    while (!chordNameInvalid && counter < body.relativeChordNames.length){
      const found = relativeChordNameOptions.find((option) =>{
        return body.relativeChordNames[counter].toLowerCase() == option;
      });

      if (!found){
        chordNameInvalid = true;
      }

      counter = counter + 1;
    }

    if (chordNameInvalid){
      next({
        name: "relativeChordNameInvalid",
        message: `A chord name must either be flat (b in front) or neutral (neither b or # in front). I (i) and IV (iv) cannot be flat. It must be a roman numeral 1-7, 
        either capital or lowercase. It can have an optional "dim" suffix.`
      });
      return
    } 

    const currentDate = new Date();
    body.timestamp = currentDate.toLocaleString();
    
    const loop = { ...body, userId };
  
        const newLoop = await createLoop(loop);
        res.send(newLoop);
      } catch (err) {
        next(err);
      }
    });


  loopsRouter.put("/:loopId", requireUser, async (req, res, next) => {
      const { id: userId } = req.user;
      const { loopId } = req.params;
      const { body } = req;

      try {

          const potentialLoop = await getLoopRowById(loopId);

          if (potentialLoop.userid != userId){
            next({
              name: "InvalidCredentials",
              message: `Tokened user did not make this loop.`
            });
            return
          } else if (potentialLoop.status == 'reply'){
            next({
              name: "LoopIsAReplyError",
              message: "You cannot edit the status of a loop that is a reply to another loop."
            });
            return
          } else if (potentialLoop.status == 'loopBank'){
            next({
              name: "LoopIsALoopBankError",
              message: "You cannot edit the status of a loop that is a loopBank loop."
            });
            return
          } else if (!(body.status == 'public' || body.status == 'private')){
            next({
                name: "LoopStatusInvalid",
                message: "You can only edit this loop to become public or private."
              });
            return
           }

            const loop = { ...body, loopId};
            const newLoop = await updateLoop(loop);
            res.send(newLoop);
    } catch (err) {
      next(err);
    }
  });

  loopsRouter.get("/public", async (req, res, next) => {
    try {
      const publicLoopsWithChords = await getAllPublicLoopsWithChords();
      res.send(publicLoopsWithChords);
    } catch (error){
      throw (error);
    }
  })

  loopsRouter.get("/:loopId", async (req, res, next) => {
    const { loopId } = req.params;

    let reqUserId;
    if (req.user && req.user.id){
      reqUserId = req.user.id;
    }
  
    try {
      const loopInQuestion = await getLoopRowById(loopId);
      if (loopInQuestion.status == 'loopBank'){
        next({
          name: "LoopStatusError",
          message: "You cannot get this loop from this endpoint because it is a loopBank loop."
        });
        return
      } else if (loopInQuestion.status == 'reply'){
        next({
          name: "LoopStatusError",
          message: "You cannot get this loop from this endpoint because it is a reply loop."
        });
        return
      } else if (loopInQuestion.status == 'private' && reqUserId != loopInQuestion.userid){
        next({
          name: "LoopStatusError",
          message: "You cannot get this loop from this endpoint because it is a private loop that you do not own."
        });
        return
      }

      const loop = await getLoopWithChildrenById(loopId);
      res.send(loop);
    } catch (err) {
      next(err);
    }
  });

  loopsRouter.get("/thruline/:loopId", async (req, res, next) => {
    const {loopId} = req.params;

    let reqUserId;
    if (req.user && req.user.id){
      reqUserId = req.user.id;
    }

    try{
      const loopInQuestion = await getStartLoopRowById(loopId);
      if (loopInQuestion.status == 'loopBank'){
        next({
          name: "LoopStatusError",
          message: "You cannot get this loop from this endpoint because it is a loopBank loop."
        });
        return
      } else if (loopInQuestion.status == 'private' && reqUserId != loopInQuestion.userid){
        next({
          name: "LoopStatusError",
          message: "You cannot get this loop from this endpoint because it is a private loop that you do not own."
        });
        return
      } 

      const thruline = await getThrulineById(loopId);
      const flattedThruline = thruline.flat(Infinity);

      res.send(flattedThruline);
    } catch (error){
      throw error
    }
  })

  loopsRouter.delete("/:loopId", requireUser, async (req, res, next) => {
    const { loopId } = req.params;
    body.loopId = loopId;
    try {
      const aboutToDestroy = await getLoopWithChildrenById(loopId);
      if (aboutToDestroy.userid != req.user.id){
        next({
          name: "InvalidCredentials",
           message: `Tokened user did not make this loop.`
        });
        return
      }
      
      const destroyedLoop = await destroyLoopById(loopId);
      res.send({
        name: "DeleteConfirmation",
        destroyedLoop: aboutToDestroy,
      });
    } catch (err) {
      next(err);
    }
  });

  loopsRouter.post("/fork/:loopId", requireUser, async (req, res, next) => {
    const { id: forkingUser } = req.user;
    const { loopId } = req.params;
    const { body } = req;

    try {
    
      const loopInQuestion = await getStartLoopRowById(loopId);
  
    if (loopInQuestion.status == 'loopBank'){
      next({
        name: "LoopBankError",
        message: `This loop is a loopBank loop. You cannot fork it, even if you are the creator.`
      });
      return
    } else if (loopInQuestion.status == "private" && userId != loopInQuestion.userid) {
      next({
        name: "PrivateLoopError",
        message: `This loop is private, or a reply to a private loop. You can only fork it if you are the creator. `
      });
      return
    } else if (loopInQuestion.status == "privateFork" && userId != loopInQuestion.userid) {
      next({
        name: "PrivateForkLoopError",
        message: `This loop is private, or a reply to a private loop. You can only fork it if you are the creator. `
      });
      return
    }

    const forkedLoop = await forkLoop(loopId, forkingUser);
    res.send(forkedLoop);
      } catch (err) {
        next(err);
      }
    });

  
  module.exports = loopsRouter;