import { useParams } from "react-router-dom";
import { fetchAllUsersGet, fetchAccessGet } from "../api";
import { useState, useEffect } from "react";

export default function Access(props){

    const [error, setError] = useState({message: "Loading... This may take a few minutes if the server hasn't been used recently."});
    const [allUsers, setAllUsers] = useState([]);
    const [visibleUsers, setVisibleUsers] = useState([]);
    const [accessList, setAccessList] = useState([]);
    const [fetched, setFetched] = useState(0);
    const {loopId} = useParams();

    useEffect(()=>{
        async function allUsersGet(token){
            const potentialAllUsers = await fetchAllUsersGet(token);
            if (potentialAllUsers && potentialAllUsers.message){
                setError(potentialAllUsers);
            } else if (potentialAllUsers){
                setAllUsers(potentialAllUsers);
                setError({message: null});
                setFetched(fetched + 1);
            } else {
                setError({message: "Unable to fetch data."})
            }
        }
        allUsersGet(props.token);
    }, []);

    useEffect(()=>{
        async function accessGet(token, loopId){
            const potentialAccessGet = await fetchAccessGet(token, loopId);
            if (potentialAccessGet && potentialAccessGet.message){
                setError(potentialAccessGet);
            } else if (potentialAccessGet){
                let currentAllUsers = allUsers;
                let potentialAccessList = [];
                currentAllUsers.forEach((user, index)=>{
                    const found = potentialAccessGet.find((id) =>{
                        return id == user.id
                    });

                    if (found){
                        const splicedIndex = currentAllUsers.splice(index, 1);
                        potentialAccessList.push(splicedIndex);
                    }
                })
                setAllUsers(currentAllUsers);
                setAccessList(potentialAccessList);
                setError({message: null});
            } else {
                setError({message: "Unable to fetch data."})
            }
        }
        accessGet(props.token, loopId);
    }, [fetched])

    useEffect(()=>{
        if (allUsers){
            setVisibleUsers(allUsers);
        }
    }, [allUsers]);

    function handleReverseOrder(){
        const currentAllUsers = allUsers;
        const reversedUsers = currentAllUsers.reverse();
        setAllUsers([...reversedUsers]);
    }

    function handleGiveAccess(userId){
        let currentAllUsers = allUsers;
        let currentAccessList = accessList;

        const userIndex = currentAllUsers.findIndex((user)=>{
            return user.id == userId;
        })

        const splicedIndex = currentAllUsers.splice(userIndex, 1);
        currentAccessList.push(splicedIndex[0]);

        setAllUsers([...currentAllUsers]);
        setAccessList([...currentAccessList]);
    }

    function handleRemoveAccess(userId){
        let currentAllUsers = allUsers;
        let currentAccessList = accessList;

        const userIndex = currentAccessList.findIndex((user)=>{
            return user.id == userId;
        })

        const splicedIndex = currentAccessList.splice(userIndex, 1);
        currentAllUsers.push(splicedIndex[0]);

        const sortedAllUsers = currentAllUsers.sort((a, b) => a.id - b.id);

        setAllUsers([...sortedAllUsers]);
        setAccessList([...currentAccessList]);
    }

    return (
        <div className='accessMaster'>
            <p className='accessTitle'>Allow Access</p>
        {error.message ?
            <p className='errorMessage'>{error.message}</p>
        :
            <>
            <p>Allowing Access For:</p>
            {accessList.map((user)=>{
                return (
                    <div key={user.id}>
                        <p>{user.username}</p>
                        <button onClick={()=>handleRemoveAccess(user.id)}>Remove Access</button>
                    </div>
                )
            })}
            <div className='accessUserList'>
                <button className='reverseOrderButton'onClick={handleReverseOrder}>Reverse Order</button>
                {visibleUsers.map((user)=>{
                    return (
                        <div key={user.id}>
                            <p>{user.username}</p>
                            <button onClick={()=>handleGiveAccess(user.id)}>Give Access</button>
                        </div>
                    )
                })}
                <button className='reverseOrderButton'onClick={handleReverseOrder}>Reverse Order</button>
            </div>
            </>
        }
        </div>
    )
}