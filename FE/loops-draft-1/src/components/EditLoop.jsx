// props.mode (replyTo, update, start)

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { fetchThrulineGet } from "../api"
import {keySigNames, relativeRootIdOptions, translateToAbsolute, rootShiftArr, translateToAbsolute2} from '../musicTheory'

export default function EditLoop(props){
    
    const [stagedLoop, setStagedLoop] = useState({
        title: "My Loop",
        status: "public",
        keySig: "Cmaj/Amin",
        relativeChordNames: ["I", "V", "vi", "IV"],
        relativeChordInfo: getChordInfo(["I", "V", "vi", "IV"]),
        absoluteChordNames: ["C", "G", "A", "F"]
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
                    const chordInfo = getChordInfo(relativeChordNames);
                    const absoluteChordNames = translateToAbsolute2(chordInfo, updatingLoop.keysig)
        
                    setStagedLoop({
                        ...currentStagedLoop, 
                        title: updatingLoop.title,
                        status: updatingLoop.status,
                        keySig: updatingLoop.keysig,
                        relativeChordNames,
                        relativeChordInfo: chordInfo,
                        absoluteChordNames
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

    function getChordInfo(relativeChordNames){
        const potentialChordInfo = relativeChordNames.map((chordName, index)=>{
            let returnObj = {
                quality: null,
                relativeRootId: null,
                indexRootId: null,
                position: index
            }
            let name = chordName;
            if (name[name.length-1] == 'm'){
                returnObj.quality = 'dim';
                let nameArr = name.split('');
                nameArr.splice(name.length-3, 3);
                name = nameArr.join('');
            } else if (name == name.toLowerCase()){
                returnObj.quality = 'min';
            } else {
                returnObj.quality = 'maj';
            }

            const upperCase = name.toUpperCase();
            const upperCaseArr = upperCase.split('');
            if(upperCaseArr[0] == "B"){
                upperCaseArr[0] = 'b';
            }
            const finalSymbol = upperCaseArr.join('');

            returnObj.relativeRootId = finalSymbol;
            returnObj.indexRootId = relativeRootIdOptions.findIndex((option) => {
                    return finalSymbol == option;
            });

            return returnObj;
        })


        return potentialChordInfo;
    }

    function handleMinus(index){

        const currentLoop = stagedLoop;
        const RCNames = stagedLoop.relativeChordNames;
        const newRCNames = [...RCNames];
        newRCNames.splice(index, 1);
        const newChordInfo = getChordInfo(newRCNames);
        const newAbsoluteChordNames = translateToAbsolute2(newChordInfo, stagedLoop.keySig);
        setStagedLoop({
            ...currentLoop,
            relativeChordNames: newRCNames,
            relativeChordInfo: newChordInfo,
            absoluteChordNames: newAbsoluteChordNames
        });
    }

    function handlePlus(){
        const currentLoop = stagedLoop;
        const RCNames = stagedLoop.relativeChordNames;
        const newRCNames = [...RCNames];
        newRCNames.push('I');
        const newChordInfo = getChordInfo(newRCNames);
        const newAbsoluteChordNames = translateToAbsolute2(newChordInfo, stagedLoop.keySig);
        setStagedLoop({
            ...currentLoop,
            relativeChordNames: newRCNames,
            relativeChordInfo: newChordInfo,
            absoluteChordNames: newAbsoluteChordNames
        });
    }

    return (
        <>
            {error.message ?
                <p>{error.message}</p>
            :
            <>
            {keyIsChanging ?
                <>
                    <button  onClick={()=>{
                            const currentStagedLoop = stagedLoop;
                            let currentChordNames = stagedLoop.relativeChordNames;
                            const newChordInfo = getChordInfo(currentChordNames);
                            const newAbsoluteChordNames = translateToAbsolute2(newChordInfo, currentStagedLoop.keySig);
                            setStagedLoop({...currentStagedLoop, 
                                relativeChordNames: currentChordNames,
                                relativeChordInfo: newChordInfo,
                                absoluteChordNames: newAbsoluteChordNames});
                            setKeyIsChanging(false);
                            }}>Keep Relative Chords</button>
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
                    setStagedLoop({...currentStagedLoop,
                         keySig: e.target.value,
                            });
                    setKeyIsChanging(true);
                    }}>
                        {keySigNames.map((name) => {
                            return <option key={name} value={name}>{name}</option>
                        })}
                    </select>
                </label>
                <label className='editChords'>
                Chords:
                    {stagedLoop.relativeChordInfo.map((chordInfo, index)=>{
                        return (
                                    <div key={index}>
                                        <select value={chordInfo.relativeRootId} onChange={(e) => {
                                        const currentStagedLoop = stagedLoop;
                                        let currentChordNames = stagedLoop.relativeChordNames;
                                        currentChordNames[index] = e.target.value;
                                        const newChordInfo = getChordInfo(currentChordNames);
                                        const newAbsoluteChordNames = translateToAbsolute2(newChordInfo, stagedLoop.keySig);
                                        setStagedLoop({...currentStagedLoop, 
                                            relativeChordNames: currentChordNames,
                                            relativeChordInfo: newChordInfo,
                                            absoluteChordNames: newAbsoluteChordNames});
                                        }}>
                                            {relativeRootIdOptions.map((name, i) => {
                                                return <option key={i} value={name}>{name}</option>
                                            })}
                                        </select> 
                                        <p>{stagedLoop.absoluteChordNames[index]}</p>
                                    {stagedLoop.relativeChordNames.length > 1 && 
                                        <button type='button' onClick={()=>handleMinus(index)}>-</button>
                                    }
                                    </div>
                        )
                    })}
                </label>
                {stagedLoop.relativeChordNames.length < 4 && 
                    <button type='button' onClick={()=>handlePlus()}>+</button>
                }
            </div>
                <button className="editButton" id='submit'>Submit</button>
            </form>
            }
            </>
            
             }
        </>
    )
}