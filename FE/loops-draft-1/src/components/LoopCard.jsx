
import {Link} from 'react-router-dom'

export default function LoopCard(props){

    return (
        <>
        {props.loop &&
        <>
            {props.loop.title && <p>{props.loop.title}</p>}
            {props.loop.saved == true &&
                <button>Unsave Loop</button>
            }
            {props.loop.saved == false &&
                <button>Save Loop</button>
            }
            <p>@ {props.loop.timestamp}</p>
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
            {props.loop.originalloopid && 
            <>
                <p>Forked from:</p> 
                <Link to={`/loops/${props.loop.originalUser.id}`}>{props.loop.originalUser.username}'s </Link>
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
            <button>Reply to Loop</button>
            <button>Edit Loop</button>
            <button>Delete Loop</button>
            <button>Fork from Loop</button>
        </>
        }
        </>
    )
}