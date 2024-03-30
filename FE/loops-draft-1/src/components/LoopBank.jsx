import { useEffect, useState } from "react"
import {useParams} from 'react-router-dom'
import { fetchLoopBankGet} from "../api"
import TinyLoopCard from "./TinyLoopCard";

export default function LoopBank(props){

    const [error, setError] = useState({message: "Loading..."});
    const [loopBank, setLoopBank] = useState([]);
    const [refresh, setRefresh] = useState(0);

    const {mode, secondaryLoopId} = useParams();


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


    return (
        <>
        {error.message ?
            <p>{error.message}</p>
        :
            <>
            {loopBank.map((loop)=>{
                return <TinyLoopCard key={loop.id} loop={loop} token={props.token} admin={props.admin} accountId={props.accountId} refresh={refresh} setRefresh={setRefresh}
                        parentComp={mode} secondaryLoopId={secondaryLoopId}/>
             })}
            </>
        }
        </>
    )
}