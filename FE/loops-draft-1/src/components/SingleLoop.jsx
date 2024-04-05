import { useEffect, useState } from "react"
import {useParams} from 'react-router-dom'
import { fetchSingleLoopGet } from "../api"
import TinyLoopCard from "./TinyLoopCard";

export default function SingleLoop(props){

    const [error, setError] = useState({message:"Loading..."});
    const [singleLoop, setSingleLoop] = useState({});
    const [refresh, setRefresh] = useState(0);
    const {loopId} = useParams();
    const [repliesOpen, setRepliesOpen] = useState(null);

    useEffect(()=>{
        async function singleLoopGet(token, loopId){
            const potentialSingleLoop = await fetchSingleLoopGet(token, loopId);
            if (potentialSingleLoop && potentialSingleLoop.message){
                setError(potentialSingleLoop);
            } else if (potentialSingleLoop){
                setSingleLoop(potentialSingleLoop);
                createReplyKey(potentialSingleLoop);
                if(repliesOpen){
                    transferRepliesOpen(repliesOpen, potentialSingleLoop);
                }
                setError({message:null});
            } else {
                setError({message: "Unable to fetch data."})
            }
        }
       singleLoopGet(props.token, loopId);
    }, [refresh, loopId]);

    function openPreviousReplies(loop, nextParentLoop){
        let loopWithChildren = loop;
        let loopTree = nextParentLoop;
        if (loopTree.id == loopWithChildren.id){
            if (loopWithChildren.repliesOpen == true){
                loopTree.repliesOpen = true;
            }
            if (loopWithChildren.repliesOpen == false){
                loopTree.repliesOpen = false;
            }
        } else if (loopTree.childLoops) {
            const newChildren = loopTree.childLoops.map((childLoop)=> {
                return openPreviousReplies(loop, childLoop);
               })
    
               loopTree = {
                ...loopTree,
                childLoops: newChildren
               }
        }

        return loopTree;
    }

    function transferRepliesOpen(loop, startLoop){
        const newLoop = openPreviousReplies(loop, startLoop);
        setSingleLoop(newLoop);
    }


    function setRepliesToClosed(loop){
       let loopWithChildren = loop;
       loopWithChildren.repliesOpen = false;
       if(loopWithChildren.childLoops){
          const newChildren = loopWithChildren.childLoops.map((childLoop)=> {
            return setRepliesToClosed(childLoop);
           })

           loopWithChildren = {
            ...loopWithChildren,
            childLoops: newChildren
           }
       }
      
       return loopWithChildren;
    }

    function createReplyKey(loop){
        const newLoop = setRepliesToClosed(loop);
        setSingleLoop(newLoop);
    }

    function openReply(loop, nextParentLoop){
        let clickedLoop = loop;
        let loopTree = nextParentLoop;
        if (loopTree.id == clickedLoop.id){
            loopTree.repliesOpen = true;
        } else if (loopTree.childLoops) {
            const newChildren = loopTree.childLoops.map((childLoop)=> {
                return openReply(loop, childLoop);
               })
    
               loopTree = {
                ...loopTree,
                childLoops: newChildren
               }
        }

        return loopTree;
    }

    function handleOpenReply(loop){
        const newLoop = openReply(loop, singleLoop);
        setSingleLoop({...newLoop});
        setRepliesOpen({...newLoop});
    }

    function closeReply(loop, nextParentLoop){
        let clickedLoop = loop;
        let loopTree = nextParentLoop;
        if (loopTree.id == clickedLoop.id){
            loopTree.repliesOpen = false;
            if (loopTree.childLoops){
                const newChildren = loopTree.childLoops.map((childLoop) =>{
                    return setRepliesToClosed(childLoop);
                })
                loopTree = {
                    ...loopTree,
                    childLoops: newChildren
                }
            }
        } else if (loopTree.childLoops) {
            const newChildren = loopTree.childLoops.map((childLoop)=> {
                return closeReply(loop, childLoop);
               })
    
               loopTree = {
                ...loopTree,
                childLoops: newChildren
               }
        }

        return loopTree;
    }

    function handleCloseReply(loop){
        const newLoop = closeReply(loop, singleLoop);
        setSingleLoop({...newLoop});
        setRepliesOpen({...newLoop});
    }

    function renderLoopWithChildren(loop){
        return (
            <div className="loopWithChildren">
            <TinyLoopCard loop={loop} 
            token={props.token} 
            admin={props.admin} 
            accountId={props.accountId} 
            refresh={refresh} 
            setRefresh={setRefresh}
            loopIdParam={loopId}/>
             {loop.childLoops &&
                <>
                    {loop.repliesOpen == true &&
                        <>
                        <button className="closeReplies" onClick={()=> handleCloseReply(loop)}>Close Replies</button>
                        {loop.childLoops.map((childLoop) => {
                            return (
                                <div key={childLoop.id}>
                                       {renderLoopWithChildren(childLoop)}
                                </div>
                            )
                        })}
                        </>
                    }   
                    {loop.repliesOpen == false && <button className="openReplies" onClick={()=> handleOpenReply(loop)}>Open Replies</button>}
                </>
            } 
            </div>
        )
    }

    return (
        <div className="singleLoopMaster">
        {error.message ?
            <p>{error.message}</p>
        :
            <div>
            {renderLoopWithChildren(singleLoop)}
            </div>
        }
        </div>
    )
}