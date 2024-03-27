// props.mode (replyTo, update, start)

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { fetchThrulineGet } from "../api"
import {keySigNames} from '../musicTheory'

export default function EditLoop(props){
    
    const [stagedLoop, setStagedLoop] = useState({
        title: "My Loop",
        status: "public",
        keySig: "Cmaj/Amin",
        relativeChordNames: ["I", "V", "vi", "IV"]
    }); 
    const [error, setError] = useState({message: "Loading..."});
    const {loopId, mode} = useParams();
    const [keyIsChanging, setKeyIsChanging] = useState(false);


    useEffect(()=>{
        const currentStagedLoop = stagedLoop;
        if(mode == 'replyTo'){
            setError({message: null});
            setStagedLoop({
                ...currentStagedLoop, 
                title: null,
                status: null
            });
        } else if (mode == 'update'){
            async function thrulineGet(token, loopId){
                const potentialThruline = await fetchThrulineGet(token, loopId);
                if (potentialThruline && potentialThruline.message){
                    setError(potentialThruline);
                } else if (potentialThruline){
                    setError({message: null});
                    const updatingLoop = potentialThruline[potentialThruline.length - 1];
                    const relativeChordNames = updatingLoop.relativeChords.map((chord)=>{
                        return chord.name
                    })
        
                    setStagedLoop({
                        ...currentStagedLoop, 
                        title: updatingLoop.title,
                        status: updatingLoop.status,
                        keySig: updatingLoop.keysig,
                        relativeChordNames
                    });
                } else {
                    setError({message: "Unable to fetch data."})
                }
            }
            thrulineGet(props.token, loopId);
        } else {
            setError({message: null});
        }
    }, [])

    useEffect(()=>{
        console.log('stagedLoop', stagedLoop);
    }, [stagedLoop])

    return (
        <>
            {error.message ?
                <p>{error.message}</p>
            :
            <>
            {keyIsChanging ?
                <>
                    <button onClick={()=>setKeyIsChanging(false)}>Keep Relative Chords</button>
                    <button>Keep Absolute Chords</button>
                </>
            :
            <form className="editForm" onSubmit={(event)=>handleEditSubmit(event, loopId)}>
            <div className='editEntries'>
                {mode == 'replyTo' &&
                    <>
                            <label className='editTitle'>
                            Title: <input className='editInput' type= 'text' value= {stagedLoop.title} onChange= {(e) => {
                            const currentStagedLoop = stagedLoop;
                            setStagedLoop({...currentStagedLoop, title: e.target.value});
                            }}/>
                            </label>
                            <label className='editStatus'>
                            Status: 
                            <select value={stagedLoop.status} onChange={(e) => {
                                const currentStagedLoop = stagedLoop;
                                setStagedLoop({...currentStagedLoop, status: e.target.value});
                            }}>
                            <option value="public" onChange={(e) => {
                                const currentStagedLoop = stagedLoop;
                                setStagedLoop({...currentStagedLoop, status: e.target.value});
                            }}>Public</option>
                            <option value="private" onChange={(e) => {
                                const currentStagedLoop = stagedLoop;
                                setStagedLoop({...currentStagedLoop, status: e.target.value});
                            }}>Private</option>
    
                            <option value="loopBank" onChange={(e) => {
                                const currentStagedLoop = stagedLoop;
                                setStagedLoop({...currentStagedLoop, status: e.target.value});
                            }}>LoopBank</option>
                            </select>
                    </label>
                    </>
                }
                <label className='editKeySig'>
                Key Signature: 
                    <select value={stagedLoop.keySig} onChange={(e) => {
                    const currentStagedLoop = stagedLoop;
                    setStagedLoop({...currentStagedLoop, keySig: e.target.value});
                    setKeyIsChanging(true);
                    }}>
                        {keySigNames.map((name) => {
                            return <option key={name} value={name}>{name}</option>
                        })}
                    </select>
                </label>
            </div>
                <button className="editButton" id='submit'>Submit</button>
            </form>
            }
            </>
            
             }
        </>
    )
}