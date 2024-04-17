import { useParams, useNavigate } from "react-router-dom";
import { fetchAllUsersGet, fetchAccessGet, fetchAccessPost } from "../api";
import { useState, useEffect } from "react";

export default function Access(props){

    const [error, setError] = useState({message: "Loading... This may take a few minutes if the server hasn't been used recently."});
    const [allUsers, setAllUsers] = useState([]);
    const [visibleUsers, setVisibleUsers] = useState([]);
    const [accessList, setAccessList] = useState([]);
    const [fetched, setFetched] = useState(0);
    const {loopId} = useParams();
    const navigate = useNavigate();

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
                const self = currentAllUsers.findIndex((user)=>{
                    return user.id == props.accountId;
                })
                currentAllUsers.splice(self, 1);
                let potentialAccessList = [];
                currentAllUsers.forEach((user, index)=>{
                    const found = potentialAccessGet.find((id) =>{
                        return id == user.id
                    });

                    if (found){
                        const splicedIndex = currentAllUsers.splice(index, 1);
                        potentialAccessList.push(splicedIndex[0]);
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

    async function handleAccessSubmit(){
        setError({message: "Loading... This may take a few minutes if the server hasn't been used recently."});
        const userArr = accessList.map((user)=>{
            return user.id;
        })
        const potentialSubmit = await fetchAccessPost(props.token, loopId, userArr);
        if (!potentialSubmit){
            setError({message: "Failed to fetch."});
        } else if (potentialSubmit.message && potentialSubmit.message == "Access granted to users.") {
            navigate(`/users/${props.accountId}`);
        } else {
            setError(potentialSubmit);
        }
    }

    return (
        <div className='accessMaster'>
            <p className='accessTitle'>Allow Access</p>
        {error.message ?
            <p className='errorMessage'>{error.message}</p>
        :
            <>
            <button onClick={handleAccessSubmit}>Submit Changes</button>
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