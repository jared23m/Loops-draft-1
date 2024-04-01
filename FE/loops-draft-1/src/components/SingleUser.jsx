import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { fetchSingleUserGet , fetchUserPatch} from "../api"
import TinyLoopCard from "./TinyLoopCard"

export default function SingleUser(props){

    const [error, setError] = useState({message: "Loading..."});
    const [singleUser, setSingleUser] = useState({});
    const [visibleLoops, setVisibleLoops] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const {userId} = useParams();
    const [updateProfile, setUpdateProfile] = useState(false);
    const [updateData, setUpdateData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        admin: null,
        isActive: null
    });
    const [updateSubmitError, setUpdateSubmitError] = useState({message: null});
    const [notAMatch, setNotAMatch] = useState(false);
    const [searchData, setSearchData] = useState({
        startLoops: true,
        replyLoops: true,
        forkedLoops: true
    })
    const [privateSearchData, setPrivateSearchData] = useState({
        publicLoops: true,
        privateLoops: true,
        loopBankLoops: true,
        savedLoops: true
    })

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
    }, [refresh, userId]);

    

    useEffect(()=>{
        if (updateProfile){
            let currentUpdateData = updateData;
            currentUpdateData.username = singleUser.username;
            currentUpdateData.email = singleUser.email;
            if (props.admin && singleUser.id != props.accountId){
                currentUpdateData.admin = singleUser.admin;
            }
            if ((props.admin && singleUser.id != props.accountId) || !props.admin){
                currentUpdateData.isActive = true;
            }

            setUpdateData({
                ...currentUpdateData
            })
        }
    }, [updateProfile])

    useEffect(()=>{
        if (updateData.password == updateData.confirmPassword){
            setNotAMatch(false);
        } else {
            setNotAMatch(true);
        }
    }, [updateData])

    async function handleUpdateProfileSubmit(event){
        event.preventDefault();
        const currentUpdateData = updateData;
        if (!currentUpdateData.username || currentUpdateData.username == ''){
            delete currentUpdateData.username;
        }
        if (!currentUpdateData.email || currentUpdateData.email == ''){
            delete currentUpdateData.email;
        }
        if (!currentUpdateData.password || currentUpdateData.password == ''){
            delete currentUpdateData.password;
        }
        if (currentUpdateData.admin == null){
            delete currentUpdateData.admin;
        }
        if (currentUpdateData.isActive == null){
            delete currentUpdateData.isActive;
        }
        delete currentUpdateData.confirmPassword;

        const potentialSubmit = await fetchUserPatch(currentUpdateData, props.token, userId);
        if (!potentialSubmit){
            setUpdateSubmitError({message: "Failed to fetch."});
        } else if (!potentialSubmit.message) {
            setUpdateProfile(false);
            setRefresh(refresh + 1);
        } else {
            setUpdateSubmitError(potentialSubmit);
        }
  
    }

    function renderUserSearchForm(){
        return (
            <div>
                 <label>
                    <input type="checkbox" value="startLoops" checked={searchData.startLoops} onChange={()=>{
                        const currentSearchData = searchData;
                        const currentStartLoops = currentSearchData.startLoops;
                        setSearchData({...currentSearchData, startLoops: !currentStartLoops});
                    }}/>
                    Start Loops
                </label>
                <label>
                    <input type="checkbox" value="replyLoops" checked={searchData.replyLoops} onChange={()=>{
                        const currentSearchData = searchData;
                        const currentReplyLoops = currentSearchData.replyLoops;
                        setSearchData({...currentSearchData, replyLoops: !currentReplyLoops});
                    }}/>
                    Reply Loops
                </label>
                <label>
                    <input type="checkbox" value="forkedLoops" checked={searchData.forkedLoops} onChange={()=>{
                        const currentSearchData = searchData;
                        const currentForkedLoops = currentSearchData.forkedLoops;
                        setSearchData({...currentSearchData, forkedLoops: !currentForkedLoops});
                    }}/>
                    Forked Loops
                </label>
                {singleUser.savedLoops &&
                <>
                    <label>
                    <input type="checkbox" value="publicLoops" checked={privateSearchData.publicLoops} onChange={()=>{
                        const currentPrivateSearchData = privateSearchData;
                        const currentPublicLoops = currentPrivateSearchData.publicLoops;
                        setPrivateSearchData({...currentPrivateSearchData, publicLoops: !currentPublicLoops});
                    }}/>
                    Public Loops
                    </label>
                    <label>
                    <input type="checkbox" value="privateLoops" checked={privateSearchData.privateLoops} onChange={()=>{
                        const currentPrivateSearchData = privateSearchData;
                        const currentPrivateLoops = currentPrivateSearchData.privateLoops;
                        setPrivateSearchData({...currentPrivateSearchData, privateLoops: !currentPrivateLoops});
                    }}/>
                    Private Loops
                    </label>
                    <label>
                    <input type="checkbox" value="loopBankLoops" checked={privateSearchData.loopBankLoops} onChange={()=>{
                        const currentPrivateSearchData = privateSearchData;
                        const currentLoopBankLoops = currentPrivateSearchData.loopBankLoops;
                        setPrivateSearchData({...currentPrivateSearchData, loopBankLoops: !currentLoopBankLoops});
                    }}/>
                    LoopBank Loops
                    </label>
                    <label>
                    <input type="checkbox" value="savedLoops" checked={privateSearchData.savedLoops} onChange={()=>{
                        const currentPrivateSearchData = privateSearchData;
                        const currentSavedLoops = currentPrivateSearchData.savedLoops;
                        setPrivateSearchData({...currentPrivateSearchData, savedLoops: !currentSavedLoops});
                    }}/>
                    Saved Loops
                    </label>
                </>
                }
            </div>
        )
    }

    useEffect(()=>{
        if (singleUser){
            console.log(singleUser);
            let currentVisibleLoops = visibleLoops;
            if (singleUser.savedLoops){
                let savedLoops = singleUser.savedLoops;
                savedLoops.forEach((loop)=>{
                    loop['saved'] = true;
                })
                currentVisibleLoops = [...singleUser.loops, ...savedLoops];
            } else {
                currentVisibleLoops = singleUser.loops;
            }

            if (!searchData.startLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return loop.title == null;
                })
            }

            if (!searchData.replyLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return loop.parentloopid == null;
                })
            }

            if (!searchData.forkedLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return loop.originalloopid == null;
                })
            }

            if (!privateSearchData.publicLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    if (loop.startLoop){
                        return loop.startLoop.status != 'public';
                    } else {
                        return loop.status != 'public';
                    }
                })
            }

            if (!privateSearchData.privateLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    if (loop.startLoop){
                        return loop.startLoop.status != 'private';
                    } else {
                        return loop.status != 'private';
                    }
                })
            }

            if (!privateSearchData.loopBankLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return loop.status != 'loopBank';
                })
            }

            if (!privateSearchData.savedLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return !loop.saved;
                })
            }

            setVisibleLoops(currentVisibleLoops);
        }
    }, [singleUser, searchData, privateSearchData]);

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
            {(singleUser.id == props.accountId || props.admin) &&
            <>
                    {updateProfile ?
                            <>
                            <form className="updateProfileForm" onSubmit= {handleUpdateProfileSubmit}>
                            <div className='updateProfileEntries'>
                                <label className='updateUsername'>
                                Username: <input className='updateProfileInput' type= 'text' value= {updateData.username} onChange= {(e) => {
                                        const currentUpdateData = updateData;
                                        setUpdateData({...currentUpdateData, username: e.target.value});
                                        }}/>
                                </label>
                                <label className='updateUsername'>
                                Email: <input className='updateProfileInput' type= 'email' value= {updateData.email} onChange= {(e) => {
                                        const currentUpdateData = updateData;
                                        setUpdateData({...currentUpdateData, email: e.target.value});
                                        }}/>
                                </label>
                                <label className='updatePassword'>
                                New Password: <input className='updateProfileInput' type= 'password' value= {updateData.password} onChange= {(e) => {
                                        const currentUpdateData = updateData;
                                        setUpdateData({...currentUpdateData, password: e.target.value});
                                        }}/>
                                </label>
                                <label className='updateConfirmPassword'>
                                Confirm New Password: <input className='updateProfileInput' type= 'password' value= {updateData.confirmPassword} onChange= {(e) => {
                                        const currentUpdateData = updateData;
                                        setUpdateData({...currentUpdateData, confirmPassword: e.target.value});
                                        }}/>
                                </label>
                                {(props.admin && singleUser.id != props.accountId) &&
                                <label className='updateAdmin'>
                                Admin: 
                                        <select value={updateData.admin} onChange={(e) => {
                                            const currentUpdateData = updateData;
                                            setUpdateData({...currentUpdateData, admin: e.target.value});
                                        }}>
                                        <option value={true} onChange={(e) => {
                                            const currentUpdateData = updateData;
                                            setUpdateData({...currentUpdateData, admin: e.target.value});
                                        }}>True</option>
                                        <option value={false} onChange={(e) => {
                                            const currentUpdateData = updateData;
                                            setUpdateData({...currentUpdateData, admin: e.target.value});
                                        }}>False</option>
                                        </select>
                                 </label>
                                }
                                {((props.admin && singleUser.id != props.accountId) || !props.admin) &&
                                <label className='updateIsActive'>
                                Delete account forever: 
                                        <select value={updateData.isActive} onChange={(e) => {
                                            const currentUpdateData = updateData;
                                            setUpdateData({...currentUpdateData, isActive: e.target.value});
                                        }}>
                                        <option value={true} onChange={(e) => {
                                            const currentUpdateData = updateData;
                                            setUpdateData({...currentUpdateData, isActive: e.target.value});
                                        }}>False</option>
                                        <option value={false} onChange={(e) => {
                                            const currentUpdateData = updateData;
                                            setUpdateData({...currentUpdateData, isActive: e.target.value});
                                        }}>True</option>
                                        </select>
                                 </label>
                                }
                            </div>
                                {notAMatch && <p>Password and Confirm Password must match.</p>}
                                <button className="updateProfileButton" id='submit'>Submit</button>
                                <button onClick={()=>setUpdateProfile(false)}>Cancel</button>
                                {updateSubmitError.message && <p className='updateProfileErrMess'>{updateSubmitError.message}</p>}
                            </form>
                            </>
                            :
                            <>
                                <button onClick={()=>setUpdateProfile(true)}>Update Profile</button>
                            </>
                            }
            </>
            } 
            {renderUserSearchForm()}
            <>
                {(visibleLoops && visibleLoops.length > 0) ?
                <>
                    {visibleLoops.map((loop)=>{
                    return <TinyLoopCard key={loop.id} loop={loop} token={props.token} admin={props.admin} accountId={props.accountId} refresh={refresh} setRefresh={setRefresh}/>
                    })}
                </>
                :
                <>
                    <p>No loops to display.</p>
                </>
                }
            </>   
            </>
        }
        </>
    )
}