import { useEffect, useState } from "react"
import { fetchAllLoopsGet } from "../api"
import TinyLoopCard from "./TinyLoopCard";

export default function AllLoops(props){

    const [error, setError] = useState(null);
    const [allLoops, setAllLoops] = useState([]);
    const [refresh, setRefresh] = useState(0);

    useEffect(()=>{
        async function allLoopsGet(token){
            const potentialAllLoops = await fetchAllLoopsGet(token);
            if (potentialAllLoops && potentialAllLoops.message){
                setError(potentialAllLoops);
            } else if (potentialAllLoops){
                setAllLoops(potentialAllLoops);
            } else {
                setError("Unable to fetch data.")
            }
        }
        allLoopsGet(props.token);
    }, [refresh]);


    return (
        <>
        {error || allLoops.length == 0 ?
            <p>{error}</p>
        :
            <>
            {allLoops.map((loop)=>{
                return <TinyLoopCard key={loop.id} loop={loop} token={props.token} admin={props.admin} accountId={props.accountId} refresh={refresh} setRefresh={setRefresh}/>
             })}
            </>
        }
        </>
    )
}