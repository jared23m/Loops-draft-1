import { useEffect, useState } from "react"
import { fetchThrulineGet } from "../api"
import LoopCard from "./LoopCard"
import { useParams } from "react-router-dom";

export default function Thruline(props){

    const [error, setError] = useState(null);
    const [thruline, setThruline] = useState([]);
    const [refresh, setRefresh] = useState(0);

    const {loopId} = useParams();

    useEffect(()=>{
        async function thrulineGet(token, loopId){
            const potentialThruline = await fetchThrulineGet(token, loopId);
            if (potentialThruline && potentialThruline.message){
                console.log('a');
                setError(potentialThruline);
            } else if (potentialThruline){
                console.log('b');
                setThruline(potentialThruline);
            } else {
                console.log('c');
                setError({message: "Unable to fetch data."})
            }
        }
        thrulineGet(props.token, loopId);
    }, [refresh]);

    useEffect(()=>{
        console.log(error);
    }, [error]);


    return (
        <>
        {error ?
            <p>{error.message}</p>
        :
            <>
            {thruline.map((loop)=>{
                return <LoopCard key={loop.id} loop={loop} token={props.token} admin={props.admin} accountId={props.accountId} refresh={refresh} setRefresh={setRefresh}/>
             })}
            </>
        }
        </>
    )
}