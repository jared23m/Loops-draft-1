
import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import {useState} from 'react'
import { fetchLoopDelete, fetchSaveLoopPost} from '../api';
import LoopCard from './LoopCard';


export default function TinyLoopCard(props){
    const [open, setOpen] = useState(false);

    return (
        <>
            {props.loop &&
            <>
                {open ?
                <>
                    <LoopCard key={props.loop.id} 
                    loop={props.loop} 
                    token={props.token} 
                    admin={props.admin} 
                    accountId={props.accountId} 
                    refresh={props.refresh} 
                    setRefresh={props.setRefresh}/>
                    <button onClick={()=>setOpen(false)}>Close Details</button>
                </>
                :
                <>
                    {props.loop.title && <Link to={`/loops/${props.loop.id}`}>{props.loop.title}</Link>}
                    {props.loop.relativeChords.map((chord) => {
                         return <div key={chord.id}>
                                    <p>{chord.name}</p>
                                </div>
                     })}
                    <button onClick={()=>setOpen(true)}>Open Details</button>
                </>
                }
            </>
            }
        </>
    )
}