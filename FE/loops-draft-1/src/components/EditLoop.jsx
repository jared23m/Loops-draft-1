// replyTo, update, copy, new, replyFromLoopBank, updateFromLoopBank, newFromLoopBank

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { fetchThrulineGet } from "../api"
import {keySigNames, relativeRootIdOptions, rootShiftArr, qualityOptions} from '../musicTheory'
import { useNavigate } from "react-router-dom"
import {fetchLoopPatch, fetchStartLoopPost, fetchReplyLoopPost} from '../api'

export default function EditLoop(props){
    
    const [stagedLoop, setStagedLoop] = useState({
        title: "My Loop",
        status: "public",
        keySig: "Cmaj/Amin",
        jottings: "",
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
    const [error, setError] = useState({message: "Loading... This may take a few minutes if the server hasn't been used recently."});
    const {loopId, secondaryLoopId, mode} = useParams();
    const [keyIsChanging, setKeyIsChanging] = useState(null);
    const [submitError, setSubmitError] = useState({message: null});
    const [feErrors, setFeErrors] = useState(['Title must be filled out before submitting.']);
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [submitName, setSubmitName] = useState('disabledLoopSubmit');
    const [isLoopBank, setIsLoopBank] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        let currentErrors=[];

        if (stagedLoop.title && stagedLoop.title.length == 0){
            currentErrors = ['Title must be filled out before submitting.'];
        }

        if (stagedLoop.title && stagedLoop.title.length > 20){
            currentErrors.push('Title must be 20 characters or fewer.');
        }

        if (stagedLoop.jottings && stagedLoop.jottings.length > 100){
            currentErrors.push('Jottings must be 100 characters or fewer.');
        }

        if(currentErrors.length > 0){
            setSubmitDisabled(true);
            setSubmitName('disabledLoopSubmit');
        } else {
            setSubmitDisabled(false);
            setSubmitName('editPageSubmitButton');
        }

        setFeErrors([...currentErrors]);

    }, [stagedLoop]);

    async function thrulineGet(token, loopId, secondaryLoopId){
        const potentialThruline = await fetchThrulineGet(token, loopId);
        const currentStagedLoop = stagedLoop;
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

            if (!updatingLoop.title){
                updatingLoop.title == "My Loop";
            }

            let status;
            let title;
            let jottings;

            if (mode == 'updateFromLoopBank'){
                const potentialThruline2 = await fetchThrulineGet(token, secondaryLoopId);
                if (potentialThruline2 && potentialThruline2.message){
                    setError(potentialThruline2);
                } else if (potentialThruline2){
                    setError({message: null});
                    const updatingLoop2 = potentialThruline2[potentialThruline2.length - 1];
                    if (updatingLoop2.status == 'loopBank'){
                        setIsLoopBank(true);
                    }
                    status = updatingLoop2.status;
                    title = updatingLoop2.title;
                    if (updatingLoop2.jottings == null){
                        jottings = '';
                    } else {
                        jottings = updatingLoop2.jottings
                    }
                }
            } else {
                if (updatingLoop.status == 'loopBank' && mode != 'newFromLoopBank'){
                    setIsLoopBank(true);
                }
                status = updatingLoop.status;
                title = updatingLoop.title;
                if (updatingLoop.jottings == null){
                    jottings = '';
                } else {
                    jottings = updatingLoop.jottings
                }
            }

            if (mode=='copy'){
                setIsLoopBank(false);
            }

            setStagedLoop({
                ...currentStagedLoop,
                title,
                status,
                keySig: updatingLoop.keysig,
                chords,
                jottings
            })
        } else {
            setError({message: "Unable to fetch data."})
        }
    }

    useEffect(()=>{
        if(mode == 'replyTo'){
            setError({message: null});
            setStagedLoop({ 
                title: null,
                status: null,
                keySig: "Cmaj/Amin",
                jottings: "",
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
        } else if (mode == 'new'){
            setError({message: null});
            setStagedLoop({ 
                title: "My Loop",
                status: "public",
                keySig: "Cmaj/Amin",
                jottings: "",
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
        } else if (mode == 'updateFromLoopBank'){
            thrulineGet(props.token, loopId, secondaryLoopId)
        } else {
            thrulineGet(props.token, loopId);
        }
    }, [loopId, secondaryLoopId, mode])

    function getChordFromName(relativeChordName, keySig){
        const relativeRootSymbol = getRelativeFromName(relativeChordName);
        let chord = {
            quality: getQualityFromName(relativeChordName),
            relativeRootSymbol,
            absoluteRootSymbol: getAbsoluteFromRelative(relativeRootSymbol, keySig)
        }

        return chord;

    }

    function handleAllSubmit(event){
        event.preventDefault();
        if (mode == 'new' || mode == 'copy' || mode == 'newFromLoopBank'){
            handleNewSubmit(props.token, stagedLoop);
        } else if (mode == 'update'){
            handleUpdateSubmit(props.token, stagedLoop, loopId);
        } else if (mode == 'updateFromLoopBank'){
            handleUpdateSubmit(props.token, stagedLoop, secondaryLoopId);
        } else if (mode == 'replyTo'){
            handleReplyToSubmit(props.token, stagedLoop, loopId);
        } else if (mode == 'replyFromLoopBank'){
            handleReplyToSubmit(props.token, stagedLoop, secondaryLoopId);
        }
       
    }

    async function handleNewSubmit(token, stagedLoop){

        const relativeChordNames = stagedLoop.chords.map((chord)=>{
            return getNameFromChord(chord);
        })

        const startLoopData = {
            title: stagedLoop.title,
            status: stagedLoop.status,
            keySig: stagedLoop.keySig,
            relativeChordNames,
            jottings: stagedLoop.jottings
        }

        const potentialSubmit = await fetchStartLoopPost(startLoopData, token);
        if (!potentialSubmit){
            setSubmitError({message: "Failed to fetch."});
        } else if (!potentialSubmit.message) {
            setSubmitError({message: null});
            if (stagedLoop.status == 'loopBank'){
                navigate(`/users/${props.accountId}`);
            } else {
                navigate(`/loops/${potentialSubmit.id}`)
            }
        } else {
            setSubmitError(potentialSubmit);
        }

    }

    async function handleUpdateSubmit(token, stagedLoop, loopId){

        const relativeChordNames = stagedLoop.chords.map((chord)=>{
            return getNameFromChord(chord);
        })

        let patchLoopData;
        if (stagedLoop.status == 'reply'){
            patchLoopData = {
                title: null,
                status: null,
                keySig: stagedLoop.keySig,
                relativeChordNames,
                jottings: stagedLoop.jottings
            }
        } else if (isLoopBank){
            patchLoopData = {
                title: stagedLoop.title,
                keySig: stagedLoop.keySig,
                relativeChordNames,
                jottings: stagedLoop.jottings
            }
        }else {
            patchLoopData = {
                title: stagedLoop.title,
                status: stagedLoop.status,
                keySig: stagedLoop.keySig,
                relativeChordNames,
                jottings: stagedLoop.jottings
            }
        }

        const potentialSubmit = await fetchLoopPatch(patchLoopData, token, loopId, mode);
        if (!potentialSubmit){
            setSubmitError({message: "Failed to fetch."});
        } else if (!potentialSubmit.message) {
            setSubmitError({message: null});
            if (stagedLoop.status == 'loopBank'){
                navigate(`/users/${props.accountId}`);
            } else {
                navigate(`/thruline/${potentialSubmit.id}`)
            }
        } else {
            setSubmitError(potentialSubmit);
        }

    }

    async function handleReplyToSubmit(token, stagedLoop, loopId){

        const relativeChordNames = stagedLoop.chords.map((chord)=>{
            return getNameFromChord(chord);
        })

        const replyLoopData = {
            keySig: stagedLoop.keySig,
            relativeChordNames,
            jottings: stagedLoop.jottings
        }

        const potentialSubmit = await fetchReplyLoopPost(replyLoopData, token, loopId);
        if (!potentialSubmit){
            setSubmitError({message: "Failed to fetch."});
        } else if (!potentialSubmit.message) {
            setSubmitError({message: null});
            navigate(`/thruline/${potentialSubmit.id}`)
        } else {
            setSubmitError(potentialSubmit);
        }

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
            let nameArr = name.split('');
            if (nameArr[name.length-1] == 'm'){
                let unsuffixedNameArr = nameArr.splice(0, nameArr.length-3);
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
        <div className='editLoopMaster'>
            <p className='loopEditorTitle'>Loop Editor</p>
            {(!props.token) ?
            <div className='loginRedirect'>
                <p>You cannot access this page without being logged in.</p>
                <button className="editLogIn" type='button' onClick={()=> navigate('/login')}>Log In</button>
                <p>or</p>
                <button className="editSignUp" type='button' onClick={()=> navigate('/register')}>Sign Up</button>
            </div>
            :
                    <>
                    {error.message ?
                        <p className='errorMessage'>{error.message}</p>
                    :
                    <>
                    {keyIsChanging ?
                        <div className='keyChangeButtons'>
                            <button className='keyChangeButton' onClick={()=>{
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
                            <button className='keyChangeButton'onClick={()=>{
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
                        </div>
                    :
                    <form className="editForm" onSubmit={(event)=>handleAllSubmit(event, loopId)}>
                    <div className='editEntries'>
                         {(mode == 'new' && props.token || mode == 'newFromLoopBank') && <Link className='editPageGrabFromLoopBank'to={`/loopBankGrab/new`}>Grab from loop bank</Link>}
                         {(mode == 'copy') && <Link className='editPageGrabFromLoopBank'to={`/loopBankGrab/new`}>Grab from loop bank</Link>}
                         {(mode == 'update' || mode =='updateFromLoopBank') && <Link className='editPageGrabFromLoopBank'to={`/loopBankGrab/update/${secondaryLoopId}`}>Grab from loop bank</Link>}
                         {(mode == 'replyTo' || mode == 'replyFromLoopBank') && <Link className='editPageGrabFromLoopBank'to={`/loopBankGrab/replyTo/${secondaryLoopId}`}>Grab from loop bank</Link>}
                    <div className='onTheSide'>
                        {(mode == 'new' || mode == 'copy' || mode == 'newFromLoopBank' || (mode =='update' || mode == 'updateFromLoopBank') && stagedLoop.status != 'reply') &&
                            <>
                                    <div className='titleWithCharCount'>
                                        <label className='editTitle'>
                                        Title: <input className='editInput' type= 'text' value= {stagedLoop.title} onChange= {(e) => {
                                        const currentStagedLoop = stagedLoop;
                                        setStagedLoop({...currentStagedLoop, title: e.target.value});
                                        }}/>
                                        </label>
                                        <p className={stagedLoop.title.length > 20 ? 'titleCharCountRed' : 'titleCharCount'}>{stagedLoop.title.length}/20</p>
                                    </div>
                                    {!isLoopBank &&
                                    <label className='editStatus'>
                                             Status: 
                                             <select className='editSelect' value={stagedLoop.status} onChange={(e) => {
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
                                    }
                                   
                            </>
                        }
                        <div className='jottingsWithCharCount'>
                            <label className='editJottings'>
                                        Jottings: <textarea className='jottingsInput' rows='3' type= 'text' value= {stagedLoop.jottings} onChange= {(e) => {
                                        const currentStagedLoop = stagedLoop;
                                        setStagedLoop({...currentStagedLoop, jottings: e.target.value});
                                        }}/>
                            </label>
                            <p className={stagedLoop.jottings.length > 100 ? 'jottingsCharCountRed' : 'jottingsCharCount'}>{stagedLoop.jottings.length}/100</p>
                        </div>
                        <label className='editKeySig'>
                        Key Signature: 
                            <select className='editSelect'value={stagedLoop.keySig} onChange={(e) => {
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
                        </div>
                        <label className='editChords'>
                        Chords:
                            {stagedLoop.chords.map((chord, index)=>{
                                return (
                                            <div className="eachChord" key={index}>
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
                                                <button className='minus'type='button' onClick={()=>handleMinus(index)}>-</button>
                                            }
                                            </div>
                                )
                            })}
                         {stagedLoop.chords.length < 4 && 
                            <button className="plus" type='button' onClick={()=>handlePlus()}>+</button>
                        }
                        </label>
                    </div>
                        {props.token ? 
                            <div className="editPageSubmit">
                                  {feErrors.length > 0 &&
                                    <div className='mappedLoopErrors'>
                                    {feErrors.map((error) =>{
                                        return <p key={error}>{error}</p>;
                                    })}
                                    </div>
                                 }
                                <button disabled={submitDisabled} className={submitName} id='submit' onClick={handleAllSubmit}>Submit</button>
                                {submitError.message && <p>{submitError.message}</p>}
                            </div>
                            :
                            <div className="editPageLoginToSubmit">
                                <p>To Submit: </p>
                                <button className="editLogIn"type='button' onClick={()=> navigate('/login')}>Log In</button>
                                <p className='or'>or</p>
                                <button className="editSignUp" type='button' onClick={()=> navigate('/register')}>Sign Up</button>
                            </div>
                        }
                    </form>
                    }
                    </>
                    
                    }
                </>
            }
        </div>
    )
}