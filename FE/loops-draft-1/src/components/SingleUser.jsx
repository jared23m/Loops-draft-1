import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchSingleUserGet , fetchUserPatch} from "../api"
import TinyLoopCard from "./TinyLoopCard"
import { lettersAndNumbers } from "../musicTheory"

export default function SingleUser(props){

    const navigate = useNavigate();
    const [error, setError] = useState({message: "Loading... This may take a few minutes if the server hasn't been used recently."});
    const [singleUser, setSingleUser] = useState({});
    const [loopList, setLoopList] = useState([]);
    const [visibleLoops, setVisibleLoops] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const {userId} = useParams();
    const [updateProfile, setUpdateProfile] = useState(false);
    const [updateData, setUpdateData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        admin: false,
        isActive: true
    });
    const [updateSubmitError, setUpdateSubmitError] = useState({message: null});
    const [feErrors, setFeErrors] = useState([]);
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [submitName, setSubmitName] = useState('disabledUpdateSubmit');
    const [searchData, setSearchData] = useState({
        query: '',
        jottingsQuery: '',
        startLoops: true,
        replyLoops: true,
        originalLoops: true,
        forkedLoops: true
    })
    const [privateSearchData, setPrivateSearchData] = useState({
        publicLoops: true,
        privateLoops: true,
        loopBankLoops: true,
        savedLoops: true,
        unsavedLoops: true,
        myLoops: true,
        othersLoops: true
    })

    useEffect(()=>{
        let currentErrors=[];

            if (updateData.username.length > 8){
                currentErrors.push('Username length must be 8 characters or fewer.');
            }

            if(updateData.username.length > 0 & !lettersAndNumbers(updateData.username)){
                currentErrors.push('Username must only have letters and numbers.');
            }

            if(updateData.password.length > 0 && (updateData.password.length < 8 || updateData.password.length > 15)){
                currentErrors.push('Password must be 8-15 characters.');
            }

            if(updateData.email.length > 30){
                currentErrors.push('Email must be 30 characters or fewer.');
            }

            if(updateData.email.length > 0 && !updateData.email.includes('@')){
                currentErrors.push('Email must include an @ symbol.');
            }

            if (updateData.password != updateData.confirmPassword){
                currentErrors.push('Password and confirm password must match.');
            }

        if(currentErrors.length > 0){
            setSubmitDisabled(true);
            setSubmitName('disabledUpdateSubmit');
        } else {
            setSubmitDisabled(false);
            setSubmitName('updateProfileSubmitButton');
        }

        setFeErrors([...currentErrors]);

    }, [updateData]);

    useEffect(()=>{
        async function singleUserGet(token, userId){
            const potentialSingleUser= await fetchSingleUserGet(token, userId);
            if (potentialSingleUser && potentialSingleUser.message){
                setError(potentialSingleUser);
            } else if (potentialSingleUser){
                let initializeLoops = potentialSingleUser.loops;

                if (potentialSingleUser.savedLoops){
                    let initializeSavedLoops = potentialSingleUser.savedLoops;
                    initializeSavedLoops.forEach((loop)=>{
                        loop['savedByMe'] = true;
                    })
                    initializeLoops.forEach((loop, index)=>{
                        const matchingIndex = initializeSavedLoops.findIndex((savedLoop) =>{
                            return savedLoop.id == loop.id;
                        })

                        if(matchingIndex != (-1)){
                            initializeLoops[index]['savedByMe'] = true;
                            initializeSavedLoops.splice(matchingIndex, 1);
                        }

                    })

                    let initializeAccessedLoops = potentialSingleUser.accessedLoops;
                    initializeAccessedLoops.forEach((loop)=>{
                        loop['accessedByMe'] = true;
                    })
                    initializeAccessedLoops.forEach((loop, index)=>{
                        const matchingIndex = initializeSavedLoops.findIndex((savedLoop) =>{
                            return savedLoop.id == loop.id;
                        })

                        if(matchingIndex != (-1)){
                            initializeAccessedLoops[index]['savedByMe'] = true;
                            initializeSavedLoops.splice(matchingIndex, 1);
                        }

                    })
                    setSingleUser({...potentialSingleUser, savedLoops: true});
                    const potentialLoopList = [...initializeLoops, ...initializeSavedLoops, ...initializeAccessedLoops];
                    console.log(potentialLoopList);
                    const sortedLoopList = potentialLoopList.sort((a, b) => a.id - b.id);
                    sortedLoopList.reverse();
                    setLoopList([...sortedLoopList]);
                } else {
                    setSingleUser({...potentialSingleUser, savedLoops: false});
                    setLoopList([...initializeLoops])
                }

                setError({message: null});
            } else {
                setError({message: "Unable to fetch data."});
            }
        }
        singleUserGet(props.token, userId);
    }, [refresh, userId]);

    function handleReverseOrder(){
        const currentLoopList = loopList
        const reversedLoops = currentLoopList.reverse();
        setLoopList([...reversedLoops]);
    }


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
        if (!currentUpdateData.username || currentUpdateData.username == ''){
            delete currentUpdateData.username;
        }
        if (!currentUpdateData.email || currentUpdateData.email == ''){
            delete currentUpdateData.email;
        }
        if (!currentUpdateData.password || currentUpdateData.password == ''){
            delete currentUpdateData.password;
        }
        if (!props.admin || props.admin && userId == props.accountId){
            delete currentUpdateData.admin;
        }
        if (props.admin && userId == props.accountId){
            delete currentUpdateData.isActive;
        }

        const potentialSubmit = await fetchUserPatch(currentUpdateData, props.token, userId);
        if (!potentialSubmit){
            setUpdateSubmitError({message: "Failed to fetch."});
        } else if (!potentialSubmit.message) {
            if (potentialSubmit.isactive == false){
                props.setToken(null);
                props.setAccountId(null);
                props.setAccountUsername(null);
                props.setAdmin(false);
                navigate('/');
            } else {
                setUpdateProfile(false);
                setRefresh(refresh + 1);
            }
        } else {
            setUpdateSubmitError(potentialSubmit);
        }
  
    }

    function handleUncheckAll(){
        const currentSearchData = searchData;
        setSearchData({
            ...currentSearchData,
            startLoops: false,
            replyLoops: false,
            originalLoops: false,
            forkedLoops: false
        })

        if(singleUser.savedLoops){
            setPrivateSearchData({
                publicLoops: false,
                privateLoops: false,
                loopBankLoops: false,
                savedLoops: false,
                unsavedLoops: false,
                myLoops: false,
                othersLoops: false
            })
        }
        
    }

    function handleCheckAll(){
        const currentSearchData = searchData;
        setSearchData({
            ...currentSearchData,
            startLoops: true,
            replyLoops: true,
            originalLoops: true,
            forkedLoops: true
        })

        if(singleUser.savedLoops){
            setPrivateSearchData({
                publicLoops: true,
                privateLoops: true,
                loopBankLoops: true,
                savedLoops: true,
                unsavedLoops: true,
                myLoops: true,
                othersLoops: true
            })
        }
        
    }

    function renderUserSearchForm(){
        return (
            <div className='searchForm'>
                <label className='searchByStartTitle'>
                Search By Start Loop Title: <input className='singleUserSearchInput' type= 'text' value= {searchData.query} onChange= {(e) => {
                            const currentSearchData = searchData;
                            setSearchData({...currentSearchData, query: e.target.value});
                            }}/>
                </label>
                <label className='searchByJottings'>
                Search By Jottings: <input className='allLoopsSearchInput' type= 'text' value= {searchData.jottingsQuery} onChange= {(e) => {
                            const currentSearchData = searchData;
                            setSearchData({...currentSearchData, jottingsQuery: e.target.value});
                            }}/>
                </label>  
                <div className="checkAllUncheckAll">
                    <button className='checkAllButton' onClick={handleCheckAll}>Check All</button>
                    <button className='uncheckAllButton'onClick={handleUncheckAll}>Uncheck All</button>
                </div>
                <div className="checkBoxes">
                    <label className='searchCheck'>
                        <input type="checkbox" value="startLoops" checked={searchData.startLoops} onChange={()=>{
                            const currentSearchData = searchData;
                            const currentStartLoops = currentSearchData.startLoops;
                            setSearchData({...currentSearchData, startLoops: !currentStartLoops});
                        }}/>
                        Start Loops
                    </label>
                    <label className='searchCheck'>
                        <input type="checkbox" value="replyLoops" checked={searchData.replyLoops} onChange={()=>{
                            const currentSearchData = searchData;
                            const currentReplyLoops = currentSearchData.replyLoops;
                            setSearchData({...currentSearchData, replyLoops: !currentReplyLoops});
                        }}/>
                        Reply Loops
                    </label>
                    <label className='searchCheck'>
                        <input type="checkbox" value="originalLoops" checked={searchData.originalLoops} onChange={()=>{
                            const currentSearchData = searchData;
                            const currentOriginalLoops = currentSearchData.originalLoops;
                            setSearchData({...currentSearchData, originalLoops: !currentOriginalLoops});
                        }}/>
                        Original Loops
                    </label>
                    <label className='searchCheck'>
                        <input type="checkbox" value="forkedLoops" checked={searchData.forkedLoops} onChange={()=>{
                            const currentSearchData = searchData;
                            const currentForkedLoops = currentSearchData.forkedLoops;
                            setSearchData({...currentSearchData, forkedLoops: !currentForkedLoops});
                        }}/>
                        Forked Loops
                    </label>
                    {singleUser.savedLoops &&
                    <>
                        <label className='searchCheck'>
                        <input type="checkbox" value="publicLoops" checked={privateSearchData.publicLoops} onChange={()=>{
                            const currentPrivateSearchData = privateSearchData;
                            const currentPublicLoops = currentPrivateSearchData.publicLoops;
                            setPrivateSearchData({...currentPrivateSearchData, publicLoops: !currentPublicLoops});
                        }}/>
                        Public Loops
                        </label>
                        <label className='searchCheck'>
                        <input type="checkbox" value="privateLoops" checked={privateSearchData.privateLoops} onChange={()=>{
                            const currentPrivateSearchData = privateSearchData;
                            const currentPrivateLoops = currentPrivateSearchData.privateLoops;
                            setPrivateSearchData({...currentPrivateSearchData, privateLoops: !currentPrivateLoops});
                        }}/>
                        Private Loops
                        </label>
                        <label className='searchCheck'>
                        <input type="checkbox" value="loopBankLoops" checked={privateSearchData.loopBankLoops} onChange={()=>{
                            const currentPrivateSearchData = privateSearchData;
                            const currentLoopBankLoops = currentPrivateSearchData.loopBankLoops;
                            setPrivateSearchData({...currentPrivateSearchData, loopBankLoops: !currentLoopBankLoops});
                        }}/>
                        LoopBank Loops
                        </label>
                        <label className='searchCheck'>
                        <input type="checkbox" value="savedLoops" checked={privateSearchData.savedLoops} onChange={()=>{
                            const currentPrivateSearchData = privateSearchData;
                            const currentSavedLoops = currentPrivateSearchData.savedLoops;
                            setPrivateSearchData({...currentPrivateSearchData, savedLoops: !currentSavedLoops});
                        }}/>
                        Saved Loops
                        </label>
                        <label className='searchCheck'>
                        <input type="checkbox" value="unsavedLoops" checked={privateSearchData.unsavedLoops} onChange={()=>{
                            const currentPrivateSearchData = privateSearchData;
                            const currentUnsavedLoops = currentPrivateSearchData.unsavedLoops;
                            setPrivateSearchData({...currentPrivateSearchData, unsavedLoops: !currentUnsavedLoops});
                        }}/>
                        Unsaved Loops
                        </label>
                        <label className='searchCheck'>
                        <input type="checkbox" value="myLoops" checked={privateSearchData.myLoops} onChange={()=>{
                            const currentPrivateSearchData = privateSearchData;
                            const currentMyLoops = currentPrivateSearchData.myLoops;
                            setPrivateSearchData({...currentPrivateSearchData, myLoops: !currentMyLoops});
                        }}/>
                        My Loops
                        </label>
                        <label className='searchCheck'>
                        <input type="checkbox" value="othersLoops" checked={privateSearchData.othersLoops} onChange={()=>{
                            const currentPrivateSearchData = privateSearchData;
                            const currentOthersLoops = currentPrivateSearchData.othersLoops;
                            setPrivateSearchData({...currentPrivateSearchData, othersLoops: !currentOthersLoops});
                        }}/>
                        Others' Loops
                        </label>
                    </>
                    }
                </div>
            </div>
        )
    }

    useEffect(()=>{
        if (loopList){
            let currentVisibleLoops = loopList;

            if (!searchData.query == ''){
                const startIncludesQuery = currentVisibleLoops.filter((loop)=>{
                    if (loop.startLoop){
                        return false;
                    } else {
                        return loop.title.toLowerCase().includes(searchData.query.toLowerCase());
                    }
                })

                const replyIncludesQuery = currentVisibleLoops.filter((loop)=>{
                    if (loop.startLoop){
                        return loop.startLoop.title.toLowerCase().includes(searchData.query.toLowerCase());
                    } else {
                        return false;
                    }
                })

                const includesQuery = [...startIncludesQuery, ...replyIncludesQuery];

                const startStartsWithQuery = includesQuery.filter((loop)=>{
                    if (loop.startLoop){
                        return false;
                    } else {
                        return loop.title.toLowerCase().startsWith(searchData.query.toLowerCase());
                    }
                })

                const replyStartsWithQuery = includesQuery.filter((loop)=>{
                    if (loop.startLoop){
                        return loop.startLoop.title.toLowerCase().startsWith(searchData.query.toLowerCase());
                    } else {
                        return false;
                    }
                })

                const startsWithQuery = [...startStartsWithQuery, ...replyStartsWithQuery];

                const includesButDoesNotStartWith = includesQuery.filter((includesLoop) =>{
                    const found = startsWithQuery.find((startsWithLoop) => {
                        return includesLoop.id == startsWithLoop.id;
                    })

                    return !found;
                })

                currentVisibleLoops = [...startsWithQuery, ...includesButDoesNotStartWith];
            }

            if (!searchData.jottingsQuery == ''){
                const includesQuery = currentVisibleLoops.filter((loop)=>{
                    if (!loop.jottings){
                        return false;
                    } else {
                        return loop.jottings.toLowerCase().includes(searchData.jottingsQuery.toLowerCase());
                    }
                })

                const startsWithQuery = includesQuery.filter((loop)=>{
                    if (!loop.jottings){
                        return false;
                    } else {
                        return loop.jottings.toLowerCase().startsWith(searchData.jottingsQuery.toLowerCase());
                    }
                })

                const includesButDoesNotStartWith = includesQuery.filter((includesLoop) =>{
                    const found = startsWithQuery.find((startsWithLoop) => {
                        return includesLoop.id == startsWithLoop.id;
                    })

                    return !found;
                })

                currentVisibleLoops = [...startsWithQuery, ...includesButDoesNotStartWith];
            }

            if (!searchData.startLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return (loop.title == null || (loop.status == 'loopBank'));
                })
            }

            if (!searchData.replyLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return loop.parentloopid == null;
                })
            }

            if (!searchData.originalLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return loop.originalloopid != null;
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
                    return !loop.savedByMe;
                })
            }

            if (!privateSearchData.unsavedLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return loop.savedByMe;
                })
            }

            if (!privateSearchData.myLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return loop.userid != userId;
                })
            }

            if (!privateSearchData.othersLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return loop.userid == userId;
                })
            }

            setVisibleLoops(currentVisibleLoops);
        }
    }, [loopList, searchData, privateSearchData]);

    return (
        <div className="singleUserMaster">
        {error.message ?
            <p className='errorMessage'>{error.message}</p>
        :
            <>
            <p className="userPageName">{singleUser.username}</p>
            {singleUser.admin ?
                    <p className="userPageStatus">Status: Admin</p>
                :
                    <p className="userPageStatus">Status: User</p>
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
                                <label className='updateEmail'>
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
                                        <select className='selectBool'value={updateData.admin} onChange={(e) => {
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
                                Deactivate Account Permanently:
                                        <select className='selectBool'value={updateData.isActive} onChange={(e) => {
                                            const currentUpdateData = updateData;
                                            setUpdateData({...currentUpdateData, isActive: e.target.value});
                                        }}>
                                        <option value={true} onChange={(e) => {
                                            const currentUpdateData = updateData;
                                            setUpdateData({...currentUpdateData, isActive: e.target.value});
                                        }}>Don't deactivate</option>
                                        <option value={false} onChange={(e) => {
                                            const currentUpdateData = updateData;
                                            setUpdateData({...currentUpdateData, isActive: e.target.value});
                                        }}>Deactivate</option>
                                        </select>
                                 </label>
                                }
                            </div>
                            {feErrors.length > 0 &&
                                    <div className='mappedUpdateErrors'>
                                    {feErrors.map((error) =>{
                                        return <p key={error}>{error}</p>;
                                    })}
                                    </div>
                            }
                                <button disabled={submitDisabled}className={submitName}id='submit'>Submit</button>
                                <button className='updateProfileCancelButton'onClick={()=>setUpdateProfile(false)}>Cancel</button>
                                {updateSubmitError.message && <p className='updateProfileErrMess'>{updateSubmitError.message}</p>}
                            </form>
                            </>
                            :
                            <>
                                <button className='updateProfileButton'onClick={()=>setUpdateProfile(true)}>Update Profile</button>
                            </>
                            }
            </>
            } 
            {renderUserSearchForm()}
            <div className="loopList">
                {(visibleLoops && visibleLoops.length > 0) ?
                <>
                    <button className="reverseOrderButton"onClick={handleReverseOrder}>Reverse Order</button>
                    {visibleLoops.map((loop)=>{
                    return <TinyLoopCard key={loop.id} loop={loop} token={props.token} admin={props.admin} accountId={props.accountId} refresh={refresh} setRefresh={setRefresh}/>
                    })}
                    <button className="reverseOrderButton"onClick={handleReverseOrder}>Reverse Order</button>
                </>
                :
                <>
                    <p>No loops to display.</p>
                </>
                }
        </div>  
            </>
        }
        </div>
    )
}