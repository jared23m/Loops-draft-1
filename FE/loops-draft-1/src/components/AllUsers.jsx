import { useEffect, useState } from "react"
import { fetchAllUsersGet } from "../api"
import UserCard from "./UserCard"

export default function AllUsers(props){

    const [error, setError] = useState({message: "Loading..."});
    const [allUsers, setAllUsers] = useState([]);
    const [searchData, setSearchData] = useState({
        query: '',
        admin: true,
        nonAdmin: true
    })
    const[visibleUsers, setVisibleUsers] = useState([]);

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

    function renderAllUsersSearchForm(){
        return (
            <div>
                <label>
                Search By Username: <input className='allUsersSearchInput' type= 'text' value= {searchData.query} onChange= {(e) => {
                            const currentSearchData = searchData;
                            setSearchData({...currentSearchData, query: e.target.value});
                            }}/>
                </label>
                <p></p>
                 <label>
                    <input type="checkbox" value="admin" checked={searchData.admin} onChange={()=>{
                        const currentSearchData = searchData;
                        const currentAdmin = currentSearchData.admin;
                        setSearchData({...currentSearchData, admin: !currentAdmin});
                    }}/>
                    Admin
                </label>
                <label>
                    <input type="checkbox" value="nonAdmin" checked={searchData.nonAdmin} onChange={()=>{
                        const currentSearchData = searchData;
                        const currentNonAdmin = currentSearchData.nonAdmin;
                        setSearchData({...currentSearchData, nonAdmin: !currentNonAdmin});
                    }}/>
                    Non Admin
                </label>
            </div>
        )
    }

    useEffect(()=>{
        if (allUsers){
            let currentVisibleUsers = allUsers;

            if (!searchData.query == ''){
                const includesQuery = currentVisibleUsers.filter((user)=>{
                    return user.username.toLowerCase().includes(searchData.query.toLowerCase());
                })

                const startsWithQuery = includesQuery.filter((user)=>{
                    return user.username.toLowerCase().startsWith(searchData.query.toLowerCase());
                })


                const includesButDoesNotStartWith = includesQuery.filter((includesUser) =>{
                    const found = startsWithQuery.find((startsWithUser) => {
                        return includesUser.id == startsWithUser.id;
                    })

                    return !found;
                })

                currentVisibleUsers = [...startsWithQuery, ...includesButDoesNotStartWith];
            }

            if (!searchData.admin){
                currentVisibleUsers = currentVisibleUsers.filter((user)=>{
                    return user.admin == false;
                })
            }

            if (!searchData.nonAdmin){
                currentVisibleUsers = currentVisibleUsers.filter((user)=>{
                    return user.admin == true;
                })
            }

            setVisibleUsers(currentVisibleUsers);
        }
    }, [allUsers, searchData]);

    return (
        <>
        {error.message ?
            <p>{error.message}</p>
        :
            <>
            {renderAllUsersSearchForm()}
            {visibleUsers.map((user)=>{
                return <UserCard key={user.id} user={user}/>
             })}
            </>
        }
        </>
    )
}