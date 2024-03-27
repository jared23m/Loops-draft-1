import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { fetchSingleUserGet } from "../api"
import TinyLoopCard from "./TinyLoopCard"

export default function SingleUser(props){

    const [error, setError] = useState({message: "Loading..."});
    const [singleUser, setSingleUser] = useState({});
    const [visibleLoops, setVisibleLoops] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const {userId} = useParams();

    useEffect(()=>{
        async function singleUserGet(token, userId){
            const potentialSingleUser= await fetchSingleUserGet(token, userId);
            if (potentialSingleUser && potentialSingleUser.message){
                setError(potentialSingleUser);
            } else if (potentialSingleUser){
                setSingleUser(potentialSingleUser);
                setError({message: null});
            } else {
                setError({message: "Unable to fetch data."});
            }
        }
        singleUserGet(props.token, userId);
    }, [refresh]);

    useEffect(()=>{
        if (singleUser){
            setVisibleLoops(singleUser.loops);
        }
    }, [singleUser]);

    return (
        <>
        {error.message ?
            <p>{error.message}</p>
        :
            <>
            <p>{singleUser.username}</p>
            {singleUser.admin ?
                    <p>Status: Admin</p>
                :
                    <p>Status: User</p>
            }       
            <>
                {visibleLoops &&
                <>
                    {visibleLoops.map((loop)=>{
                    return <TinyLoopCard key={loop.id} loop={loop} token={props.token} admin={props.admin} accountId={props.accountId} refresh={refresh} setRefresh={setRefresh}/>
                    })}
                </>
                }
            </>   
            </>
        }
        </>
    )
}