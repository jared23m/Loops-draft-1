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
    forkLoop,
    getLoopIsLonely
} = require("../db/loops");

const {
  keySigNames,
  relativeChordNameOptions,
  alphabetWithSpaces
} = require("../db/index");

loopsRouter.post("/", requireUser, async (req, res, next) => {
    const { id: userId } = req.user;
    const { body } = req;

    if (!body.parentLoopId){
        body.parentLoopId = null;
    }

    if(!body.title){
      next({
        name: "TitleError",
        message: "You must have a title.",
      });
    return
    }

    if(!alphabetWithSpaces(body.title)){
      next({
        name: "TitleError",
        message: "Your title must only contain letters of the alphabet and spaces",
      });
    return
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

    if (body.title){
      delete body.title;
    }
  
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


  loopsRouter.patch("/:loopId", requireUser, async (req, res, next) => {
      const { id: userId } = req.user;
      const { loopId } = req.params;
      const { body } = req;

      try {

          const potentialLoop = await getLoopRowById(loopId);
          const startLoop = await getStartLoopRowById(loopId);
          const loopIsLonely = await getLoopIsLonely(loopId);

          const newBody = {
            status: body.status,
            relativeChordNames: body.relativeChordNames,
            keySig: body.keySig,
            title: body.title
          }

          if (!newBody.status){
            delete newBody.status
          }

          if (!newBody.relativeChordNames){
            delete newBody.relativeChordNames
          }

          if (!newBody.keySig){
            delete newBody.keySig
          }

          if (!newBody.title){
            delete newBody.title
          }

          if (potentialLoop.userid != userId){
            next({
              name: "InvalidCredentials",
              message: `Tokened user did not make this loop.`
            });
            return
          } else if (newBody.status && potentialLoop.status == "loopBank") {
            next({
              name: "LoopBankError",
              message: `You cannot change the status of a loopBank loop.`
            });
            return
          } else if (startLoop.status == 'private' && startLoop.userid != userId){
            next({
              name: "InvalidCredentials",
              message: `This loop's start loop is currently private and not your own. You cannot edit this.`
            });
            return
          }else if ((newBody.status || newBody.title) && potentialLoop.status == 'reply'){
            next({
                name: "LoopStatusInvalid",
                message: "You cannot change the status or title of a reply loop."
              });
            return
           } else if (newBody.status && !(newBody.status == 'public' || newBody.status == 'private')){
            next({
              name: "LoopStatusInvalid",
              message: "Loop status must be public or private."
            });
           return
           }

           if(body.title && (!alphabetWithSpaces(body.title))){
            next({
              name: "TitleError",
              message: "Your title must only contain letters of the alphabet and spaces",
            });
          return
          }

           if (!loopIsLonely){
            next({
              name: "LoopIsntLonely",
              message: "This loop has already been replied to by people who aren't you. You cannot edit it."
            });
            return
           }

           const keySigMatch = keySigNames.find((name) => {
            return newBody.keySig == name;
           })
    
        if (newBody.keySig && !keySigMatch){
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
    
        if (newBody.relativeChordNames){
          if ((newBody.relativeChordNames.length == 0 || newBody.relativeChordNames.length > 4)){
            next({
              name: "relativeChordArrayInvalid",
              message: `A loop must have at least 1 and no more than 4 relative chord names.`
            });
            return
          }
      
          let chordNameInvalid;
          let counter = 0;
      
          while (!chordNameInvalid && counter < newBody.relativeChordNames.length){
            const found = relativeChordNameOptions.find((option) =>{
              return newBody.relativeChordNames[counter].toLowerCase() == option;
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
      
        }

            const newLoop = await updateLoop(loopId, newBody);
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
 
    try {
      const aboutToDestroy = await getLoopWithChildrenById(loopId);
      const loopIsLonely = await getLoopIsLonely(loopId);
      const startLoop = await getStartLoopRowById(loopId);

      if (aboutToDestroy.userid != req.user.id){
        next({
          name: "InvalidCredentials",
           message: `Tokened user did not make this loop.`
        });
        return
      }

      if (startLoop.status == 'private' && startLoop.userid != req.user.id){
        next({
          name: "InvalidCredentials",
           message: `You cannot delete from a private loop tree that isn't yours, even if you created the reply loop.`
        });
        return
      }

      if (!loopIsLonely){
        next({
          name: "LoopIsntLonely",
          message: "This loop has already been replied to by people who aren't you. You cannot delete it."
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

      if(!body.title){
        next({
          name: "TitleError",
          message: "You must have a title.",
        });
      return
      }
  
      if(!alphabetWithSpaces(body.title)){
        next({
          name: "TitleError",
          message: "Your title must only contain letters of the alphabet and spaces",
        });
      return
      }
  
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
    } 

    if (!(body.status && (body.status == 'public' || body.status == 'private'))){
      next({
        name: "StatusError",
        message: `Status must either be public or private. `
      });
      return
    }

    const forkedLoop = await forkLoop(loopId, forkingUser, body.status, body.title);
    res.send(forkedLoop);
      } catch (err) {
        next(err);
      }
    });

  
  module.exports = loopsRouter;