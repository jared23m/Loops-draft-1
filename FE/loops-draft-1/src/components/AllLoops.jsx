import { useEffect, useState } from "react"
import { fetchAllLoopsGet } from "../api"
import TinyLoopCard from "./TinyLoopCard";

export default function AllLoops(props){

    const [error, setError] = useState({message: "Loading..."});
    const [allLoops, setAllLoops] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const [visibleLoops, setVisibleLoops] = useState([]);
    const [searchData, setSearchData] = useState({
        query: '',
        startLoops: true,
        replyLoops: true,
        forkedLoops: true
    })

    useEffect(()=>{
        async function allLoopsGet(token){
            const potentialAllLoops = await fetchAllLoopsGet(token);
            if (potentialAllLoops && potentialAllLoops.message){
                setError(potentialAllLoops);
            } else if (potentialAllLoops){
                let initializeLoops = potentialAllLoops;
                initializeLoops.reverse();
                setAllLoops(initializeLoops);
                setError({message: null});
            } else {
                setError({message: "Unable to fetch data."})
            }
        }
        allLoopsGet(props.token);
    }, [refresh]);

    useEffect(()=>{
        if (allLoops){
            setVisibleLoops(allLoops);
        }
    }, [allLoops]);

    function renderAllLoopsSearchForm(){
        return (
            <div>
                <label>
                Search By Start Loop Title: <input className='allLoopsSearchInput' type= 'text' value= {searchData.query} onChange= {(e) => {
                            const currentSearchData = searchData;
                            setSearchData({...currentSearchData, query: e.target.value});
                            }}/>
                </label>
                <p></p>
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
            </div>
        )
    }

    useEffect(()=>{
        if (allLoops){
            let currentVisibleLoops = allLoops;

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

            if (!searchData.forkedLoops){
                currentVisibleLoops = currentVisibleLoops.filter((loop)=>{
                    return loop.originalloopid == null;
                })
            }

            setVisibleLoops(currentVisibleLoops);
        }
    }, [allLoops, searchData]);



    return (
        <>
        {error.message ?
            <p>{error.message}</p>
        :
        <>
            {renderAllLoopsSearchForm()}
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
        }
        </>
    )
}