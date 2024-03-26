import { useEffect, useState } from "react"
import { fetchAllLoopsGet } from "../api"
import LoopCard from "./LoopCard"

export default function AllLoops(props){

    const [error, setError] = useState(null);
    const [allLoops, setAllLoops] = useState([]);

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
    }, []);


    return (
        <>
        {error || allLoops.length == 0 ?
            <p>{error}</p>
        :
            <>
            {allLoops.map((loop)=>{
                return <LoopCard key={loop.id} loop={loop}/>
             })}
            </>
        }
        </>
    )
}