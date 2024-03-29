// props.mode (replyTo, update, start)

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { fetchThrulineGet } from "../api"
import {keySigNames, relativeRootIdOptions, rootShiftArr, qualityOptions} from '../musicTheory'

export default function EditLoop(props){
    
    const [stagedLoop, setStagedLoop] = useState({
        title: "My Loop",
        status: "public",
        keySig: "Cmaj/Amin",
        chords: [
            {
            relativeRootSymbol: 'I',
            absoluteRootSymbol: "C",
            quality: 'maj'
            }, 
            {
            relativeRootSymbol: 'V',
            absoluteRootSymbol: "G",
            quality: 'maj'
            }, 
            {
            relativeRootSymbol: 'VI',
            absoluteRootSymbol: "A",
            quality: 'min'
            }, 
            {
            relativeRootSymbol: 'IV',
            absoluteRootSymbol: "F",
            quality: 'maj'
            }],
    }); 
    const [error, setError] = useState({message: "Loading..."});
    const {loopId, mode} = useParams();
    const [keyIsChanging, setKeyIsChanging] = useState(null);


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
                    const chords = relativeChordNames.map((relativeChordName) =>{
                        return getChordFromName(relativeChordName, updatingLoop.keysig);
                    })
                    setStagedLoop({
                        ...currentStagedLoop,
                        title: updatingLoop.title,
                        status: updatingLoop.status,
                        keySig: updatingLoop.keysig,
                        chords
                    })
                } else {
                    setError({message: "Unable to fetch data."})
                }
            }
            thrulineGet(props.token, loopId);
        } else {
            setError({message: null});
        }
    }, [])

    function getChordFromName(relativeChordName, keySig){
        const relativeRootSymbol = getRelativeFromName(relativeChordName);
        let chord = {
            quality: getQualityFromName(relativeChordName),
            relativeRootSymbol,
            absoluteRootSymbol: getAbsoluteFromRelative(relativeRootSymbol, keySig)
        }

        return chord;

    }

    function getQualityFromName(relativeChordName){
            let quality;
            let name = relativeChordName;
            if (name[name.length-1] == 'm'){
                quality = 'dim';
            } else if (name == name.toLowerCase()){
                quality = 'min';
            } else {
                quality = 'maj';
            }

            return quality;
    }

    function getRelativeFromName(relativeChordName){

            let relative;
            let name = relativeChordName;
            let unsuffixedName;
            if (name[name.length-1] == 'm'){
                let nameArr = name.split('');
                let unsuffixedNameArr = nameArr.splice(nameArr.length-3, 3);
                unsuffixedName = unsuffixedNameArr.join('');
            } else {
                unsuffixedName = name;
            }

            const upperCase = unsuffixedName.toUpperCase();
            const upperCaseArr = upperCase.split('');
            if(upperCaseArr[0] == "B"){
                upperCaseArr[0] = 'b';
            }

            relative = upperCaseArr.join('');

            return relative;
    }

    function getAbsoluteFromRelative(relativeRootSymbol, keySig){
        let keySigIndex;

        keySigNames.forEach((name, index) =>{
            if(name == keySig){
                keySigIndex = index;
            }
        });

        const correctChordBank = rootShiftArr[keySigIndex];

        let rootIndex;

        relativeRootIdOptions.forEach((option, index) =>{
            if(option == relativeRootSymbol){
                rootIndex = index;
            }
        });

        const absoluteRootSymbol = correctChordBank[rootIndex];

        return absoluteRootSymbol;
    }

    function getRelativeFromAbsolute(absoluteRootSymbol, previousKeySig, keySig){
        let keySigIndex;

        keySigNames.forEach((name, index) =>{
            if(name == keySig){
                keySigIndex = index;
            }
        });

        let previousKeySigIndex;

        keySigNames.forEach((name, index) =>{
            if(name == previousKeySig){
                previousKeySigIndex = index;
            }
        });


        const correctChordBank = rootShiftArr[previousKeySigIndex];
        let offSet = 12 - (keySigIndex - previousKeySigIndex);

        while(offSet <= 0){
            offSet = offSet - 12;
        }

        let rootIndex = correctChordBank.findIndex((chordName) =>{
            return absoluteRootSymbol == chordName;
        })

        rootIndex = rootIndex + offSet;

        while (rootIndex >= 12){
            rootIndex = rootIndex - 12;
        }

        const relativeRootSymbol = relativeRootIdOptions[rootIndex];

        return relativeRootSymbol;
    }

    function getRelativeFromAbsolute2(absoluteRootSymbol, keySig){
        let keySigIndex;

        keySigNames.forEach((name, index) =>{
            if(name == keySig){
                keySigIndex = index;
            }
        });

        const correctChordBank = rootShiftArr[keySigIndex];

        let rootIndex = correctChordBank.findIndex((chordName) =>{
            return absoluteRootSymbol == chordName;
        })

        const relativeRootSymbol = relativeRootIdOptions[rootIndex];

        return relativeRootSymbol;
    }

    function getNameFromChord(chord){
        let updatedUnsuffixed = chord.relativeRootSymbol;
        if (chord.quality == 'dim' || chord.quality == 'min'){
            updatedUnsuffixed = updatedUnsuffixed.toLowerCase();
        }
        let suffix = '';
        if (chord.quality == 'dim'){
            suffix = 'dim';
        }

        const chordName = `${updatedUnsuffixed}${suffix}`;

        return chordName;
    }

    function getKeySigIndex(keySig){
        let keySigIndex;

        keySigNames.forEach((name, index) =>{
            if(name == keySig){
                keySigIndex = index;
            }
        });

        return keySigIndex;
    }
    function handleMinus(index){

        const currentLoop = stagedLoop;
        const currentChords = stagedLoop.chords;
        currentChords.splice(index, 1);
        setStagedLoop({
            ...currentLoop,
           chords: currentChords
        });
    }

    function handlePlus(){
        const currentLoop = stagedLoop;
        const currentChords = stagedLoop.chords;
        const newChord = {
            quality: 'maj',
            relativeRootSymbol: 'I',
            absoluteRootSymbol: getAbsoluteFromRelative('I', currentLoop.keySig)
        }
        currentChords.push(newChord);
        setStagedLoop({
            ...currentLoop,
            chords: currentChords
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
                            let currentChords = stagedLoop.chords;
                            currentChords.forEach((chord, index) => {
                                const updatedAbsolute = getAbsoluteFromRelative(chord.relativeRootSymbol, currentStagedLoop.keySig);
                                currentChords[index] = {
                                    ...chord,
                                    absoluteRootSymbol: updatedAbsolute
                                }
                            });
                            setStagedLoop({...currentStagedLoop, 
                                chords: currentChords});
                            setKeyIsChanging(null);
                            }}>Keep Relative Chords</button>
                    <button onClick={()=>{
                            const currentStagedLoop = stagedLoop;
                            let currentChords = stagedLoop.chords;
                            currentChords.forEach((chord, index) => {
                                const updatedRelative = getRelativeFromAbsolute(chord.absoluteRootSymbol, keyIsChanging, currentStagedLoop.keySig);
                                const updatedAbsolute= getAbsoluteFromRelative(updatedRelative, currentStagedLoop.keySig);
                                currentChords[index] = {
                                    ...chord,
                                    relativeRootSymbol: updatedRelative,
                                    absoluteRootSymbol: updatedAbsolute
                                }
                            });
                            setStagedLoop({...currentStagedLoop, 
                                chords: currentChords});
                            setKeyIsChanging(null);
                    }}>Keep Absolute Chords</button>
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
                    setKeyIsChanging(currentStagedLoop.keySig);
                    }}>
                        {keySigNames.map((name) => {
                            return <option key={name} value={name}>{name}</option>
                        })}
                    </select>
                </label>
                <label className='editChords'>
                Chords:
                    {stagedLoop.chords.map((chord, index)=>{
                        return (
                                    <div key={index}>
                                        <select value={chord.relativeRootSymbol} onChange={(e) => {
                                                const currentStagedLoop = stagedLoop;
                                                let currentChords = stagedLoop.chords;
                                                let currentChordAtIndex = currentChords[index];
                                                let updatedAbsolute = getAbsoluteFromRelative(e.target.value, currentStagedLoop.keySig);
                                                currentChords[index] = {
                                                    ...currentChordAtIndex,
                                                    relativeRootSymbol: e.target.value,
                                                    absoluteRootSymbol: updatedAbsolute
                                                }
                                                setStagedLoop({...currentStagedLoop, 
                                                    chords: currentChords});
                                                }}>
                                                    {relativeRootIdOptions.map((name, i) => {
                                                        return <option key={i} value={name}>{name}</option>
                                                    })}
                                        </select> 
                                        <select value={chord.absoluteRootSymbol} onChange={(e) => {
                                                const currentStagedLoop = stagedLoop;
                                                let currentChords = stagedLoop.chords;
                                                let currentChordAtIndex = currentChords[index];
                                                let updatedRelative = getRelativeFromAbsolute2(e.target.value, currentStagedLoop.keySig);
                                                currentChords[index] = {
                                                    ...currentChordAtIndex,
                                                    relativeRootSymbol: updatedRelative,
                                                    absoluteRootSymbol: e.target.value
                                                }
                                                setStagedLoop({...currentStagedLoop, 
                                                    chords: currentChords});
                                                }}>
                                                    {rootShiftArr[getKeySigIndex(stagedLoop.keySig)].map((name, i) => {
                                                        return <option key={i} value={name}>{name}</option>
                                                    })}
                                        </select> 
                                        <select value={chord.quality} onChange={(e) => {
                                                const currentStagedLoop = stagedLoop;
                                                let currentChords = stagedLoop.chords;
                                                let currentChordAtIndex = currentChords[index];
                                                currentChords[index] = {
                                                    ...currentChordAtIndex,
                                                quality: e.target.value
                                                }
                                                setStagedLoop({...currentStagedLoop, 
                                                    chords: currentChords});
                                                }}>
                                                    {qualityOptions.map((name, i) => {
                                                        return <option key={i} value={name}>{name}</option>
                                                    })}
                                        </select> 
                                    {stagedLoop.chords.length > 1 && 
                                        <button type='button' onClick={()=>handleMinus(index)}>-</button>
                                    }
                                    </div>
                        )
                    })}
                </label>
                {stagedLoop.chords.length < 4 && 
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