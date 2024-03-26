import { useEffect, useState } from "react"
import { fetchAllUsersGet } from "../api"
import UserCard from "./UserCard"

export default function AllUsers(props){

    const [error, setError] = useState(null);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(()=>{
        async function allUsersGet(token){
            const potentialAllUsers = await fetchAllUsersGet(token);
            if (potentialAllUsers && potentialAllUsers.message){
                setError(potentialAllUsers);
            } else if (potentialAllUsers){
                setAllUsers(potentialAllUsers);
            } else {
                setError("Unable to fetch data.")
            }
        }
        allUsersGet(props.token);
    }, []);

    return (
        <>
        {error || allUsers.length == 0 ?
            <p>{error}</p>
        :
            <>
            {allUsers.map((user)=>{
                return <UserCard key={user.id} user={user}/>
             })}
            </>
        }
        </>
    )
}