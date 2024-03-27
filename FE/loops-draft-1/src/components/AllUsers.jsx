import { useEffect, useState } from "react"
import { fetchAllUsersGet } from "../api"
import UserCard from "./UserCard"

export default function AllUsers(props){

    const [error, setError] = useState({message: "Loading..."});
    const [allUsers, setAllUsers] = useState([]);

    useEffect(()=>{
        async function allUsersGet(token){
            const potentialAllUsers = await fetchAllUsersGet(token);
            if (potentialAllUsers && potentialAllUsers.message){
                setError(potentialAllUsers);
            } else if (potentialAllUsers){
                setAllUsers(potentialAllUsers);
                setError({message: null});
            } else {
                setError({message: "Unable to fetch data."})
            }
        }
        allUsersGet(props.token);
    }, []);

    return (
        <>
        {error.message ?
            <p>{error.message}</p>
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