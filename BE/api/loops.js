const express = require("express");
const loopsRouter = express.Router();
const { requireUser, requireAdmin } = require("./utils");

const {
    createLoop
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
    const timestampArr = body.timestamp.split(',');
    body.title = timestampArr[0];
    
    const loop = { ...body, userId };
    try {
      const newLoop = await createLoop(loop);
      res.send(newLoop);
    } catch (err) {
      next(err);
    }
  });

  module.exports = loopsRouter;