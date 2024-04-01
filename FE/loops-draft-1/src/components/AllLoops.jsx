import { useEffect, useState } from "react"
import { fetchAllLoopsGet } from "../api"
import TinyLoopCard from "./TinyLoopCard";

export default function AllLoops(props){

    const [error, setError] = useState({message: "Loading..."});
    const [allLoops, setAllLoops] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const [visibleLoops, setVisibleLoops] = useState([]);

    useEffect(()=>{
        async function allLoopsGet(token){
            const potentialAllLoops = await fetchAllLoopsGet(token);
            if (potentialAllLoops && potentialAllLoops.message){
                setError(potentialAllLoops);
            } else if (potentialAllLoops){
                setAllLoops(potentialAllLoops);
                setError({message: null});
            } else {
                setError({message: "Unable to fetch data."})
            }
        }
        allLoopsGet(props.token);
    }, [refresh]);

    useEffect(()=>{
        if (allLoops){
            setVisibleLoops(allLoops);
        }
    }, [allLoops]);


    return (
        <>
        {error.message ?
            <p>{error.message}</p>
        :
        <>
            {(visibleLoops && visibleLoops.length > 0) ?
                <>
                {visibleLoops.map((loop)=>{
                    return <TinyLoopCard key={loop.id} loop={loop} token={props.token} admin={props.admin} accountId={props.accountId} refresh={refresh} setRefresh={setRefresh}/>
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
    )
}