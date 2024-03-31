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
        admin: null,
        isActive: null
    });
    const [updateSubmitError, setUpdateSubmitError] = useState({message: null});

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
        if (singleUser){
            setVisibleLoops(singleUser.loops);
        }
    }, [singleUser]);

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

    async function handleUpdateProfileSubmit(event){
        event.preventDefault();
        const currentUpdateData = updateData;
        if (!currentUpdateData.username || updateData.username == ''){
            delete currentUpdateData.username;
        }
        if (!currentUpdateData.email || updateData.email == ''){
            delete currentUpdateData.email;
        }
        if (!currentUpdateData.password || updateData.password == ''){
            delete currentUpdateData.password;
        }
        if (currentUpdateData.admin == null){
            delete currentUpdateData.admin;
        }
        if (currentUpdateData.isActive == null){
            delete currentUpdateData.isActive;
        }

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
                                        setUpdateData({...currentUpdateData, username: e.target.value});
                                        }}/>
                                </label>
                                <label className='updatePassword'>
                                New Password: <input className='updateProfileInput' type= 'password' value= {updateData.password} onChange= {(e) => {
                                        const currentUpdateData = updateData;
                                        setUpdateData({...currentUpdateData, password: e.target.value});
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