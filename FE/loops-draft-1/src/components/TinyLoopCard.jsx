
import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import {useEffect, useState} from 'react'
import { fetchLoopDelete, fetchSaveLoopPost} from '../api';
import LoopCard from './LoopCard'
import {renderAbsoluteChords} from '../musicTheory/index'


export default function TinyLoopCard(props){
    const [open, setOpen] = useState(false);

    useEffect(()=>{
        setOpen(false);
    }, [props.parentComp, props.secondaryLoopId])

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
                    setRefresh={props.setRefresh}
                    loopIdParam={props.loopIdParam}/>
                    <button onClick={()=>setOpen(false)}>Close Details</button>
                </>
                :
                <>
                    {(props.loop.title && props.loop.status != 'loopBank') && <Link to={`/loops/${props.loop.id}`}>{props.loop.title}</Link>}
                    {(props.loop.title && props.loop.status == 'loopBank') && <p>{props.loop.title}</p>}
                    <p>@ {props.loop.timestamp}</p>
                    {renderAbsoluteChords(props.loop.relativeChords, props.loop.keysig)}
                    <button onClick={()=>setOpen(true)}>Open Details</button>
                </>
                }
                <>
                        {props.parentComp == 'update' &&
                            <Link to={`/edit/updateFromLoopBank/${props.loop.id}/${props.secondaryLoopId}`}>Select Loop</Link>
                        } 
                        {props.parentComp == 'replyTo' &&
                            <Link to={`/edit/replyFromLoopBank/${props.loop.id}/${props.secondaryLoopId}`}>Select Loop</Link>
                        } 
                        {props.parentComp == 'new' &&
                            <Link to={`/edit/newFromLoopBank/${props.loop.id}`}>Select Loop</Link>
                        } 
                </>
            </>
            }
        </>
    )
}