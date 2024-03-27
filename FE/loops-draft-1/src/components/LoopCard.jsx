
import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import {useState} from 'react'
import { fetchLoopDelete, fetchSaveLoopPost} from '../api';


export default function LoopCard(props){

    const navigate = useNavigate();
    const [replyIsOpen, setReplyIsOpen] = useState(false);
    const [areYouSureIsOpen, setAreYouSureIsOpen] = useState(false);
    const [editMenuOpen, setEditMenuOpen] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [saveError, setSaveError] = useState(null);

    function renderReplyWindow(loopId){
        return(
            <>
                <button onClick={()=>navigate(`/loopBank/${loopId}`)}>Choose from loop bank</button>
                <button onClick={()=>navigate(`/${loopId}`)}>Create from scratch</button>
                <button onClick={()=> setReplyIsOpen(false)}>Cancel</button>
            </>

        )
    }

    function renderEditMenu(loopId){
        return(
            <>
                <button onClick={()=>navigate(`/edit/loopBank/${loopId}`)}>Replace from loop bank</button>
                <button onClick={()=>navigate(`/edit/${loopId}`)}>Edit in edit page</button>
                <button onClick={()=> setEditMenuOpen(false)}>Cancel</button>
            </>

        )
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
        <>
        {props.loop &&
        <>
            {props.loop.title && <Link to={`/loops/${props.loop.id}`}>{props.loop.title}</Link>}
            <p>@ {props.loop.timestamp}</p>
            {props.loop.saved == true &&
                <button onClick={()=>handleSaveLoop(props.token, props.loop.id)}>Unsave Loop</button>
            }
            {props.loop.saved == false &&
                <button onClick={()=>handleSaveLoop(props.token, props.loop.id)}>Save Loop</button>
            }
            {saveError && <p>{saveError.message}</p>}
            <p>Created by:</p>
            <Link to={`/users/${props.loop.userid}`}>{props.loop.user.username}</Link>
            {props.loop.status != 'reply' && <p>Status: {props.loop.status}</p>}
            {props.loop.parentloopid && 
            <>
                <p>Reply to:</p> 
                <Link to={`/users/${props.loop.parentUser.id}`}>{props.loop.parentUser.username}'s </Link>
                <Link to={`/thruline/${props.loop.parentloopid}`}>Loop</Link>
            </>
            }
            {(props.loop.originalloopid && props.loop.originalUser) && 
            <>
                <p>Forked from:</p> 
                <Link to={`/users/${props.loop.originalUser.id}`}>{props.loop.originalUser.username}'s </Link>
                <Link to={`/thruline/${props.loop.originalloopid}`}>Loop</Link>
            </>
            }
            <p>Key Signature: {props.loop.keysig}</p>
            <p>Chords:</p>
            {props.loop.relativeChords.map((chord) => {
                return <div key={chord.id}>
                    <p>{chord.name}</p>
                </div>
            })}
            <Link to={`/thruline/${props.loop.id}`}>See Thruline</Link>
            {props.loop.startLoop && <Link to={`/loops/${props.loop.startLoop.id}`}>See Start Loop</Link>}
            {props.token ?
                <>
                    {!replyIsOpen ?
                        <button onClick={()=> setReplyIsOpen(true)}>Reply to Loop</button>
                    :
                        renderReplyWindow(props.loop.id)
                    }
                    <button onClick={()=>navigate(`/fork/${props.loop.id}`)}>Fork from Loop</button>
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
                            {deleteError && <p>{deleteError.message}</p>}
                        </>
                        
                    }
                </> 
            :
                <>
                    <button onClick={()=> navigate('/login')}>Log In</button>
                    <button onClick={()=> navigate('/register')}>Sign Up</button>
                </>
            }
           
        </>
        }
        </>
    )
}