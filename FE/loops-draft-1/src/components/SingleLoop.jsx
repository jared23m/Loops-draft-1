import { useEffect, useState } from "react"
import {useParams} from 'react-router-dom'
import { fetchSingleLoopGet } from "../api"
import LoopCard from "./LoopCard"

export default function SingleLoop(props){

    const [error, setError] = useState("Loading...");
    const [singleLoop, setSingleLoop] = useState({});
    const {loopId} = useParams();

    useEffect(()=>{
        async function singleLoopGet(token, loopId){
            const potentialSingleLoop = await fetchSingleLoopGet(token, loopId);
            if (potentialSingleLoop && potentialSingleLoop.message){
                setError(potentialSingleLoop);
            } else if (potentialSingleLoop){
                setSingleLoop(potentialSingleLoop);
                createReplyKey(potentialSingleLoop);
                setError(null);
            } else {
                setError("Unable to fetch data.")
            }
        }
       singleLoopGet(props.token, loopId);
    }, []);

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
    }

    function renderLoopWithChildren(loop){
        return (
            <div>
            <LoopCard loop={loop}/>
             {loop.childLoops &&
                <>
                    {loop.repliesOpen == true &&
                        <>
                        <button onClick={()=> handleCloseReply(loop)}>Close Replies</button>
                        {loop.childLoops.map((childLoop) => {
                            return (
                                <div key={childLoop.id}>
                                       {renderLoopWithChildren(childLoop)}
                                </div>
                            )
                        })}
                        </>
                    }   
                    {loop.repliesOpen == false && <button onClick={()=> handleOpenReply(loop)}>Open Replies</button>}
                </>
            } 
            </div>
        )
    }

    return (
        <>
        {error ?
            <p>{error}</p>
        :
            <>
            {renderLoopWithChildren(singleLoop)}
            </>
        }
        </>
    )
}