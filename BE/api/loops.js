const express = require("express");
const loopsRouter = express.Router();
const { requireUser, requireAdmin } = require("./utils");

const {
    createLoop, 
    getLoopRowById,
    updateLoop,
    getAllPublicLoopsWithChords
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

    if (!(body.status == 'public' || body.status == 'private' || body.status == 'followOnly')){
        next({
            name: "LoopStatusInvalid",
            message: "A loop must either be public, private, or followOnly",
          });
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
    }

    if (!body.relativeChordNames || body.relativeChordNames.length == 0 || body.relativeChordNames.length > 4){
      next({
        name: "relativeChordArrayInvalid",
        message: `A loop must have at least 1 and no more than 4 relative chord names.`
      });
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
        message: `A chord name must either be flat (b in front) or neutral (neither b or # in front). It must be a roman numeral 1-7, 
        either capital or lowercase. It can have an optional "dim" suffix.`
      });
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
    const loopInQuestion = await getLoopRowById(loopId);
    
    if (loopInQuestion.status == "private" && userId != loopInQuestion.userid) {
      next({
        name: "PrivateLoopError",
        message: `This loop is private. You can only reply to it if you are the creator. `
      });
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
    }

    if (!body.relativeChordNames || body.relativeChordNames.length == 0 || body.relativeChordNames.length > 4){
      next({
        name: "relativeChordArrayInvalid",
        message: `A loop must have at least 1 and no more than 4 relative chord names.`
      });
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
        message: `A chord name must either be flat (b in front) or neutral (neither b or # in front). It must be a roman numeral 1-7, 
        either capital or lowercase. It can have an optional "dim" suffix.`
      });
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
          }

          if (potentialLoop.status == 'reply'){
            next({
              name: "LoopIsAReplyError",
              message: "You cannot edit the status of a loop that is a reply to another loop."
            });
          } else if (!(body.status == 'public' || body.status == 'private' || body.status == 'followOnly')){
            next({
                name: "LoopStatusInvalid",
                message: "A loop must either be public, private, or followOnly",
              });
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

  module.exports = loopsRouter;