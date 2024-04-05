
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
        <div className='tinyLoopMaster'>
            {props.loop &&
            <div className='tinyLoopMaster2'>
                {open ?
                <>
                    <LoopCard key={props.loop.id} 
                    loop={props.loop} 
                    token={props.token} 
                    admin={props.admin} 
                    accountId={props.accountId} 
                    refresh={props.refresh} 
                    setRefresh={props.setRefresh}
                    loopIdParam={props.loopIdParam}
                    setOpen={setOpen}/>
                </>
                :
                <div className='tinyLoopCard'>
                    <div className='titleTimestamp'>
                        {(props.loop.title && props.loop.status != 'loopBank') && <Link className="loopTitle"to={`/loops/${props.loop.id}`}>{props.loop.title}</Link>}
                        {(props.loop.title && props.loop.status == 'loopBank') && <p className="loopTitle">{props.loop.title}</p>}
                        <p className="loopTimestamp">@ {props.loop.timestamp}</p>
                    </div>
                    {renderAbsoluteChords(props.loop.relativeChords, props.loop.keysig)}
                    <button className='openDetailsTinyLoopButton'onClick={()=>setOpen(true)}>Open Details</button>
                </div>
                }
                <>
                        {props.parentComp == 'update' &&
                            <Link className='loopBankSelectButton'to={`/edit/updateFromLoopBank/${props.loop.id}/${props.secondaryLoopId}`}>Select Loop</Link>
                        } 
                        {props.parentComp == 'replyTo' &&
                            <Link className='loopBankSelectButton'to={`/edit/replyFromLoopBank/${props.loop.id}/${props.secondaryLoopId}`}>Select Loop</Link>
                        } 
                        {props.parentComp == 'new' &&
                            <Link className='loopBankSelectButton'to={`/edit/newFromLoopBank/${props.loop.id}`}>Select Loop</Link>
                        } 
                </>
            </div>
            }
        </div>
    )
}