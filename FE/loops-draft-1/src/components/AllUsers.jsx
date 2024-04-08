import { useEffect, useState } from "react"
import { fetchAllUsersGet } from "../api"
import UserCard from "./UserCard"

export default function AllUsers(props){

    const [error, setError] = useState({message: "Loading..."});
    const [allUsers, setAllUsers] = useState([]);
    const [searchData, setSearchData] = useState({
        query: '',
        admin: true,
        nonAdmin: true,
        active: true,
        notActive: true
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
                <label className='searchByStartLoop'>
                Search By Username: <input className='allUsersSearchInput' type= 'text' value= {searchData.query} onChange= {(e) => {
                            const currentSearchData = searchData;
                            setSearchData({...currentSearchData, query: e.target.value});
                            }}/>
                </label>
                <div className='checkBoxes'>
                    <label className='searchCheck'>
                        <input type="checkbox" value="admin" checked={searchData.admin} onChange={()=>{
                            const currentSearchData = searchData;
                            const currentAdmin = currentSearchData.admin;
                            setSearchData({...currentSearchData, admin: !currentAdmin});
                        }}/>
                        Admin
                    </label>
                    <label className='searchCheck'>
                        <input type="checkbox" value="nonAdmin" checked={searchData.nonAdmin} onChange={()=>{
                            const currentSearchData = searchData;
                            const currentNonAdmin = currentSearchData.nonAdmin;
                            setSearchData({...currentSearchData, nonAdmin: !currentNonAdmin});
                        }}/>
                        Non Admin
                    </label>
                    {props.admin &&
                    <>
                    <label className='searchCheck'>
                        <input type="checkbox" value="active" checked={searchData.active} onChange={()=>{
                            const currentSearchData = searchData;
                            const currentActive = currentSearchData.active;
                            setSearchData({...currentSearchData, active: !currentActive});
                        }}/>
                        Active
                    </label>
                    <label className='searchCheck'>
                        <input type="checkbox" value="notActive" checked={searchData.notActive} onChange={()=>{
                            const currentSearchData = searchData;
                            const currentNotActive = currentSearchData.notActive;
                            setSearchData({...currentSearchData, notActive: !currentNotActive});
                        }}/>
                        Not Active
                    </label>
                    </>
                    }
                </div>
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

            if (!searchData.active){
                currentVisibleUsers = currentVisibleUsers.filter((user)=>{
                    return user.isactive == false;
                })
            }

            if (!searchData.notActive){
                currentVisibleUsers = currentVisibleUsers.filter((user)=>{
                    return user.isactive == true;
                })
            }

            setVisibleUsers(currentVisibleUsers);
        }
    }, [allUsers, searchData]);

    function handleReverseOrder(){
        const currentAllUsers = allUsers;
        const reversedUsers = currentAllUsers.reverse();
        setAllUsers([...reversedUsers]);
    }

    return (
        <div className='allUsersMaster'>
            <p className='allUsersTitle'>All Users</p>
        {error.message ?
            <p>{error.message}</p>
        :
            <>
            {renderAllUsersSearchForm()}
            <div className='userList'>
                <button className='reverseOrderButton'onClick={handleReverseOrder}>Reverse Order</button>
                {visibleUsers.map((user)=>{
                    return <UserCard key={user.id} user={user}/>
                })}
                <button className='reverseOrderButton'onClick={handleReverseOrder}>Reverse Order</button>
            </div>
            </>
        }
        </div>
    )
}