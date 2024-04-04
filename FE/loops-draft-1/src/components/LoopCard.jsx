
import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import {useEffect, useState} from 'react'
import { fetchLoopDelete, fetchSaveLoopPost, fetchForkLoopPost} from '../api';
import { renderAbsoluteChords } from '../musicTheory';


export default function LoopCard(props){

    const navigate = useNavigate();
    const [replyIsOpen, setReplyIsOpen] = useState(false);
    const [areYouSureIsOpen, setAreYouSureIsOpen] = useState(false);
    const [editMenuOpen, setEditMenuOpen] = useState(false);
    const [forkMenuOpen, setForkMenuOpen] = useState(false);
    const [forkData, setForkData] = useState({title: "My Fork", status: "public"});

    const [deleteError, setDeleteError] = useState({message: null});
    const [saveError, setSaveError] = useState({message: null});
    const [forkError, setForkError] = useState({message: null});

    function renderReplyWindow(loopId){
        return(
            <>
                <button onClick={()=>navigate(`/loopBankGrab/replyTo/${loopId}`)}>Choose from loop bank</button>
                <button onClick={()=>navigate(`/edit/replyTo/${loopId}`)}>Create from scratch</button>
                <button onClick={()=> setReplyIsOpen(false)}>Cancel</button>
            </>

        )
    }

    function renderEditMenu(loopId){
        return(
            <>
                <button onClick={()=>navigate(`/loopBankGrab/update/${loopId}`)}>Replace from loop bank</button>
                <button onClick={()=>navigate(`/edit/update/${loopId}`)}>Edit in edit page</button>
                <button onClick={()=> setEditMenuOpen(false)}>Cancel</button>
            </>

        )
    }

    
    function renderForkMenu(loopId){
        return(
            <>
            <form className="forkForm" onSubmit={(event)=>handleForkSubmit(event, loopId)}>
            <div className='forkEntries'>
                <label className='forkTitle'>
                Title: <input className='forkInput' type= 'text' value= {forkData.title} onChange= {(e) => {
                        const currentForkData = forkData;
                        setForkData({...currentForkData, title: e.target.value});
                        }}/>
                </label>
                <label className='forkStatus'>
                 Status: 
                        <select value={forkData.status} onChange={(e) => {
                            const currentForkData = forkData;
                            setForkData({...currentForkData, status: e.target.value});
                        }}>
                        <option value="public" onChange={(e) => {
                            const currentForkData = forkData;
                            setForkData({...currentForkData, status: e.target.value});
                        }}>Public</option>
                        <option value="private" onChange={(e) => {
                            const currentForkData = forkData;
                            setForkData({...currentForkData, status: e.target.value});
                        }}>Private</option>
                        </select>
                </label>
            </div>
                <button className="forkButton" id='submit'>Submit</button>
            </form>
                <button onClick={()=> setForkMenuOpen(false)}>Cancel</button>
            </>

        )
    }

    async function handleForkSubmit(event, loopId){
        event.preventDefault();
        const potentialSubmit = await fetchForkLoopPost(forkData, props.token, loopId);
        if (!potentialSubmit){
            setForkError({message: "Failed to fetch."});
        } else if (potentialSubmit && potentialSubmit.id) {
            navigate(`/loops/${potentialSubmit.id}`);
        } else {
            setForkError(potentialSubmit);
        }
  
    }

    async function handleLoopDelete(token, loopId){
        const potentialSubmit = await fetchLoopDelete(token, loopId);
        if (!potentialSubmit){
            setDeleteError({message: "Failed to fetch."});
        } else if (potentialSubmit.message && potentialSubmit.message == "DeleteConfirmation") {
            props.setRefresh(props.refresh + 1);
        } else {
            setDeleteError(potentialSubmit);
        }
  
    }

    async function handleSaveLoop(token, loopId){
        const potentialSubmit = await fetchSaveLoopPost(token, loopId);
        if (!potentialSubmit){
            setSaveError({message: "Failed to fetch."});
        } else if (potentialSubmit.message && (potentialSubmit.message == "Loop saved." || potentialSubmit.message == "Loop unsaved.")) {
            props.setRefresh(props.refresh + 1);
        } else {
            setSaveError(potentialSubmit);
        }
  
    }

    return (
        <div className="loopCard">
            <div className='titleTimestamp'>
            {(props.loop.title && props.loop.status != 'loopBank') && <Link className='loopTitle' to={`/loops/${props.loop.id}`}>{props.loop.title}</Link>}
            {(props.loop.title && props.loop.status == 'loopBank') && <p className='loopTitle' >{props.loop.title}</p>}
            <p className='loopTimestamp'>@ {props.loop.timestamp}</p>
            </div>
            <div className="abAndRel">
                {renderAbsoluteChords(props.loop.relativeChords, props.loop.keysig)}
                <div className='relativeChords'>
                {props.loop.relativeChords.map((chord) => {
                    return <div className='relativeChord' key={chord.id}>
                        <p>{chord.name}</p>
                    </div>
                })}
                </div>
            </div>
            <p className='loopCardKeySig'>Key Signature: {props.loop.keysig}</p>
            {props.loop.saved == true &&
                <button onClick={()=>handleSaveLoop(props.token, props.loop.id)}>Unsave Loop</button>
            }
            {props.loop.saved == false &&
                <button onClick={()=>handleSaveLoop(props.token, props.loop.id)}>Save Loop</button>
            }
            {saveError.message && <p>{saveError.message}</p>}
            <div className='cbAndStatus'>
            <div className='createdByContainer'>
            <p>Created by:</p>
            <Link className='loopCardUserLink' to={`/users/${props.loop.userid}`}>{props.loop.user.username}</Link>
            </div>
            {props.loop.status != 'reply' ?
             <p className='loopCardStatus'>Status: {props.loop.status}</p>
            :

                <div className='replyToContainer'>
                    <p>Reply to:</p> 
                
                    <Link className="repliedFroms"to={`/users/${props.loop.parentUser.id}`}>{props.loop.parentUser.username}'s </Link>
                    <Link className="repliedFromsLoop"to={`/thruline/${props.loop.parentloopid}`}>Loop</Link>
                </div>
            }
            </div>
            
            {(props.loop.originalloopid && props.loop.originalUser) && 
            <div className='forkedFromContainer'>
                <p>Forked from:</p>
                <div className="forkedFromLinks">
                    <Link className="forkedFroms" to={`/users/${props.loop.originalUser.id}`}>{props.loop.originalUser.username}'s </Link>
                    <Link className="forkedFromsLoop" to={`/thruline/${props.loop.originalloopid}`}>Loop</Link>
                </div>
            </div>
            }
            <div class='TLAndSL'>
            {props.loop.status != 'loopBank' && <Link className='seeThruline'to={`/thruline/${props.loop.id}`}>See Thruline</Link>}
            {(props.loop.startLoop && (!props.loopIdParam)) &&
            <>
                <Link className='seeStartLoop'to={`/loops/${props.loop.startLoop.id}`}>See Start Loop</Link>
            </>
            }
            </div>
            {props.token ?
                <>
                    <button onClick={()=>navigate(`/edit/copy/${props.loop.id}`)}>Copy Loop</button>
                    {props.accountId == props.loop.userid && 
                    <>
                        {editMenuOpen ?
                            renderEditMenu(props.loop.id)
                        :
                            <button onClick={() => setEditMenuOpen(true)}>Edit Loop</button>
                        }
                    </>
                    }
                    {(props.admin || (props.accountId == props.loop.userid) && props.loop.isLonely) && 
                        <>  
                            {areYouSureIsOpen ?
                                <>
                                    <p>Are you sure you want to delete this loop?</p>
                                    <button onClick={()=>handleLoopDelete(props.token, props.loop.id)}>Yes</button>
                                    <button onClick={()=> setAreYouSureIsOpen(false)}>No</button>
                                </>
                            :
                                <button onClick={()=> setAreYouSureIsOpen(true)}>Delete Loop</button>
                            }
                            {deleteError.message && <p>{deleteError.message}</p>}
                        </>
                        
                    }
                    {props.loop.status != 'loopBank' &&
                    <>
                        {!replyIsOpen ?
                        <button onClick={()=> setReplyIsOpen(true)}>Reply to Loop</button>
                    :
                        renderReplyWindow(props.loop.id)
                    }
                    {!forkMenuOpen ?
                        <button onClick={()=> setForkMenuOpen(true)}>Fork from Loop</button>
                    :
                        renderForkMenu(props.loop.id)
                    }
                    {forkError.message && <p>{forkError.message}</p>}
                    </>
                    }
                </> 
            :
                <div className="toReplyContainer">
                    <p className="toReplyText">To Reply: </p>
                    <div className="loginOrSignUpContainer">
                        <button className="loopCardLogin"onClick={()=> navigate('/login')}>Log In</button>
                        <p>or</p>
                        <button className="loopCardSignUp"onClick={()=> navigate('/register')}>Sign Up</button>
                    </div>
                </div>
            }
        </div>
    )
}