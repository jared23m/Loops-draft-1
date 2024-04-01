import { useEffect, useState } from "react"
import {useParams ,useNavigate} from 'react-router-dom'
import { fetchLoopBankGet} from "../api"
import TinyLoopCard from "./TinyLoopCard";

export default function LoopBank(props){

    const [error, setError] = useState({message: "Loading..."});
    const [loopBank, setLoopBank] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const [visibleLoops, setVisibleLoops] = useState([]);

    const {mode, secondaryLoopId} = useParams();
    const navigate = useNavigate();


    useEffect(()=>{
        async function loopBankGet(token){
            const potentialLoopBank = await fetchLoopBankGet(token);
            if (potentialLoopBank && potentialLoopBank.message){
                setError(potentialLoopBank);
            } else if (potentialLoopBank){
                setLoopBank(potentialLoopBank);
                setError({message: null});
            } else {
                setError({message: "Unable to fetch data."})
            }
        }
        loopBankGet(props.token);
    }, [refresh]);

    useEffect(()=>{
        if (loopBank){
            setVisibleLoops(loopBank);
        }
    }, [loopBank]);


    return (
        <>
            {!props.token ?
            <>
                <p>You cannot access this page without being logged in.</p>
                <button type='button' onClick={()=> navigate('/login')}>Log In</button>
                <p>or</p>
                <button type='button' onClick={()=> navigate('/register')}>Sign Up</button>
            </>
            :
                <>
                {error.message ?
                    <p>{error.message}</p>
                :
                <>
                {(visibleLoops && visibleLoops.length > 0) ?
                        <>
                        {visibleLoops.map((loop)=>{
                            return <TinyLoopCard key={loop.id} loop={loop} token={props.token} admin={props.admin} accountId={props.accountId} refresh={refresh} setRefresh={setRefresh}
                                    parentComp={mode} secondaryLoopId={secondaryLoopId}/>
                        })}
                        </>
                :
                <>
                    <p>No loops to display.</p>
                </>
                }
                </>
                }
                </>
            }
        </>
        
    )
}