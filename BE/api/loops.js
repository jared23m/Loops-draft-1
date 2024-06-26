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
    getLoopIsLonely,
    getAllLoopsWithChords
} = require("../db/loops");

const {
  keySigNames,
  relativeChordNameOptions,
  alphabetWithSpaces,
  client
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

    if(body.title.length > 20){
      next({
        name: "TitleError",
        message: "Your title must be 20 characters or fewer.",
      });
    return
    }

    if(body.jottings.length > 100){
      next({
        name: "JottingsError",
        message: "Your jottings must be 100 characters or fewer.",
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
    body.timestamp = currentDate.toLocaleString('en-US', { timeZone: 'America/Chicago' });
    
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

    if(body.jottings.length > 100){
      next({
        name: "JottingsError",
        message: "Your jottings must be 100 characters or fewer.",
      });
    return
    }
  
    if (loopInQuestion.status == 'loopBank'){
      next({
        name: "LoopBankError",
        message: `This loop is a loopBank loop. You cannot reply to it, even if you are the creator.`
      });
      return
    } else if (loopInQuestion.status == "private" && userId != loopInQuestion.userid) {
      const {rows: [accessGiven]} = await client.query(
        `
        SELECT id
        FROM access
        WHERE userId = $1 AND loopId = $2;
        `,
        [userId, loopInQuestion.id]
      )

      console.log(accessGiven);

      if (!(accessGiven)){
        next({
          name: "PrivateLoopError",
          message: `This loop is private, or a reply to a private loop. You can only reply to it if you are the creator. `
        });
        return
      }
      
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
    body.timestamp = currentDate.toLocaleString('en-US', { timeZone: 'America/Chicago' });
    
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
            title: body.title,
            jottings: body.jottings
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

          if(!newBody.jottings){
            delete newBody.jottings
          }

          if (potentialLoop.userid != userId){
            next({
              name: "InvalidCredentials",
              message: `Tokened user did not make this loop.`
            });
            return
          } else if ((newBody.status) && potentialLoop.status == "loopBank") {
            next({
              name: "LoopBankError",
              message: `You cannot change the status of a loopBank loop.`
            });
            return
          } else if (startLoop.status == 'private' && startLoop.userid != userId){
            const {rows: [accessGiven]} = await client.query(
              `
              SELECT id
              FROM access
              WHERE userId = $1 AND loopId = $2;
              `,
              [userId, startLoop.id]
            )
      
            if (accessGiven && userId != potentialLoop.userid){
              next({
                name: "InvalidCredentials",
                message: `This loop is not your own. You cannot edit this.`
              });
            } else if (!accessGiven){
              next({
                name: "InvalidCredentials",
                message: `This loop's start loop is currently private and not your own. You cannot edit this.`
              });
              return
            }
            
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


          if(newBody.title && newBody.title.length > 20){
            next({
              name: "TitleError",
              message: "Your title must be 20 characters or fewer.",
            });
          return
          }
      
          if(newBody.jottings && newBody.jottings.length > 100){
            next({
              name: "JottingsError",
              message: "Your jottings must be 100 characters or fewer.",
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

            const newLoop = await updateLoop(loopId, newBody, req.user.id);
            res.send(newLoop);
    } catch (err) {
      next(err);
    }
  });

  loopsRouter.get("/", async (req, res, next) => {
    try {
      if (req.user && req.user.admin){
        loopsWithChords = await getAllLoopsWithChords(req.user.id);
      } else if (req.user) {
        loopsWithChords = await getAllPublicLoopsWithChords(req.user.id);
      } else {
        loopsWithChords = await getAllPublicLoopsWithChords();
      }
      res.send(loopsWithChords);
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
      } else if ((!req.user || !req.user.admin) && (loopInQuestion.status == 'private' && reqUserId != loopInQuestion.userid)){
        const {rows: [accessGiven]} = await client.query(
          `
          SELECT id
          FROM access
          WHERE userId = $1 AND loopId = $2;
          `,
          [reqUserId, loopId]
        )
  
        if (!(accessGiven)){
          next({
            name: "LoopStatusError",
            message: "You cannot get this loop from this endpoint because it is a private loop that you do not own."
          });
          return
        }
      }
      let loop;
      if (req.user){
        loop = await getLoopWithChildrenById(loopId, req.user.id);
      } else {
        loop = await getLoopWithChildrenById(loopId);
      }
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

      if(loopInQuestion.status == 'loopBank' && (reqUserId != loopInQuestion.userid)){
        next({
          name: "LoopStatusError",
          message: "You cannot get this loop from this endpoint because it is a loopBank loop that you do not own."
        });
        return
      }
      if ((!req.user || !req.user.admin) && (loopInQuestion.status == 'private' && reqUserId != loopInQuestion.userid)){
        const {rows: [accessGiven]} = await client.query(
          `
          SELECT id
          FROM access
          WHERE userId = $1 AND loopId = $2;
          `,
          [reqUserId, loopInQuestion.id]
        )
  
        if (!(accessGiven)){
          next({
            name: "LoopStatusError",
            message: "You cannot get this loop from this endpoint because it is a private loop that you do not own."
          });
          return
        }
      } 
      let thruline;
      if (req.user){
        thruline = await getThrulineById(loopId, req.user.id);
      } else {
        thruline = await getThrulineById(loopId);
      }
      
      const flattedThruline = thruline.flat(Infinity).reverse();

      res.send(flattedThruline);
    } catch (error){
      throw error
    }
  })

  loopsRouter.delete("/:loopId", requireUser, async (req, res, next) => {
    const { loopId } = req.params;
 
    try {
      const aboutToDestroy = await getLoopWithChildrenById(loopId, req.user.id);
      const loopIsLonely = await getLoopIsLonely(loopId);
      const startLoop = await getStartLoopRowById(loopId);

      if (!req.user.admin && (aboutToDestroy.userid != req.user.id)){
        next({
          name: "InvalidCredentials",
           message: `Tokened user did not make this loop.`
        });
        return
      }

      if (!req.user.admin && (startLoop.status == 'private' && startLoop.userid != req.user.id)){

        const {rows: [accessGiven]} = await client.query(
          `
          SELECT id
          FROM access
          WHERE userId = $1 AND loopId = $2;
          `,
          [req.user.id, startLoop.id]
        )
  
        if (accessGiven && req.user.id != aboutToDestroy.userid){
          next({
            name: "InvalidCredentials",
            message: `This loop is not your own. You cannot delete this.`
          });
        } else if (!accessGiven){
          next({
            name: "InvalidCredentials",
            message: `This loop's start loop is currently private and not your own. You cannot delete this.`
          });
          return
        }

      }

      if (!req.user.admin && !loopIsLonely){
        next({
          name: "LoopIsntLonely",
          message: "This loop has already been replied to by people who aren't you. You cannot delete it."
        });
        return
      }
      
      const destroyedLoop = await destroyLoopById(loopId);
      res.send({
        message: "DeleteConfirmation",
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
  
    if (loopInQuestion.status == 'loopBank'){
      next({
        name: "LoopBankError",
        message: `This loop is a loopBank loop. You cannot fork it, even if you are the creator.`
      });
      return
    } else if (loopInQuestion.status == "private" && forkingUser != loopInQuestion.userid) {
      console.log('here');
      const {rows: [accessGiven]} = await client.query(
        `
        SELECT id
        FROM access
        WHERE userId = $1 AND loopId = $2;
        `,
        [forkingUser, loopInQuestion.id]
      )

      if (!(accessGiven)){
        next({
          name: "PrivateLoopError",
          message: `This loop is private, or a reply to a private loop. You can only fork it if you are the creator. `
        });
        return
      }
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