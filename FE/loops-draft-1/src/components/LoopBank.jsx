import { useEffect, useState } from "react"
import {useParams ,useNavigate} from 'react-router-dom'
import { fetchLoopBankGet} from "../api"
import TinyLoopCard from "./TinyLoopCard";

export default function LoopBank(props){

    const [error, setError] = useState({message: "Loading..."});
    const [loopBank, setLoopBank] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const [visibleLoops, setVisibleLoops] = useState([]);
    const [searchData, setSearchData] = useState({
        query: ''
    });

    const {mode, secondaryLoopId} = useParams();
    const navigate = useNavigate();


    useEffect(()=>{
        async function loopBankGet(token){
            const potentialLoopBank = await fetchLoopBankGet(token);
            if (potentialLoopBank && potentialLoopBank.message){
                setError(potentialLoopBank);
            } else if (potentialLoopBank){
                setLoopBank(potentialLoopBank);
                setError({message: null});
            } else {
                setError({message: "Unable to fetch data."})
            }
        }
        loopBankGet(props.token);
    }, [refresh, secondaryLoopId]);

    function renderLoopBankSearchForm(){
        return (
            <div>
                <label>
                Search By Loop Title: <input className='loopBankSearchInput' type= 'text' value= {searchData.query} onChange= {(e) => {
                            const currentSearchData = searchData;
                            setSearchData({...currentSearchData, query: e.target.value});
                            }}/>
                </label>     
            </div>
        )
    }

    useEffect(()=>{
        if (loopBank){
            let currentVisibleLoops = loopBank;

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

            setVisibleLoops(currentVisibleLoops);
        }
    }, [loopBank, searchData]);

    function handleReverseOrder(){
        const currentLoopBank = loopBank;
        const reversedLoopBank = currentLoopBank.reverse();
        setLoopBank([...reversedLoopBank]);
    }

    return (
        <>
            {!props.token ?
            <>
                <p>You cannot access this page without being logged in.</p>
                <button type='button' onClick={()=> navigate('/login')}>Log In</button>
                <p>or</p>
                <button type='button' onClick={()=> navigate('/register')}>Sign Up</button>
            </>
            :
                <>
                {error.message ?
                    <p>{error.message}</p>
                :
                <>
                {renderLoopBankSearchForm()}
                {(visibleLoops && visibleLoops.length > 0) ?
                        <>
                        <button onClick={handleReverseOrder}>Reverse Order</button>
                        {visibleLoops.map((loop)=>{
                            return <TinyLoopCard key={loop.id} loop={loop} token={props.token} admin={props.admin} accountId={props.accountId} refresh={refresh} setRefresh={setRefresh}
                                    parentComp={mode} secondaryLoopId={secondaryLoopId}/>
                        })}
                        <button onClick={handleReverseOrder}>Reverse Order</button>
                        </>
                :
                <>
                    <p>No loops to display.</p>
                </>
                }
                </>
                }
                </>
            }
        </>
        
    )
}