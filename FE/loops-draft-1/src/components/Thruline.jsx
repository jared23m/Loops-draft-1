import { useEffect, useState } from "react"
import { fetchThrulineGet } from "../api"
import TinyLoopCard from "./TinyLoopCard"
import { useParams } from "react-router-dom";

export default function Thruline(props){

    const [error, setError] = useState({message: "Loading..."});
    const [thruline, setThruline] = useState([]);
    const [refresh, setRefresh] = useState(0);

    const {loopId} = useParams();

    useEffect(()=>{
        async function thrulineGet(token, loopId){
            const potentialThruline = await fetchThrulineGet(token, loopId);
            if (potentialThruline && potentialThruline.message){
                setError(potentialThruline);
            } else if (potentialThruline){
                setThruline(potentialThruline);
                setError({message: null});
            } else {
                setError({message: "Unable to fetch data."})
            }
        }
        thrulineGet(props.token, loopId);
    }, [refresh, loopId]);

    function handleReverseOrder(){
        const currentThruline = thruline;
        const reversedThruline = currentThruline.reverse();
        setThruline([...reversedThruline]);
    }
  
    return (
        <div className='thrulineMaster'>
        {error.message ?
            <p>{error.message}</p>
        :
            <div className='loopList'>
                <button className='reverseOrderButton'onClick={handleReverseOrder}>Reverse Order</button>
                {thruline.map((loop)=>{
                    return <TinyLoopCard key={loop.id} loop={loop} token={props.token} admin={props.admin} accountId={props.accountId} refresh={refresh} setRefresh={setRefresh}/>
                })}
                <button className='reverseOrderButton'onClick={handleReverseOrder}>Reverse Order</button>
            </div>
        }
       </div>
    )
}