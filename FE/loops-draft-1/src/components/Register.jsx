import {useEffect, useState} from 'react'
import { fetchRegisterPost } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Register(props){
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState({message: null});
    const [notAMatch, setNotAMatch] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        if (registerData.password == registerData.confirmPassword){
            setNotAMatch(false);
        } else {
            setNotAMatch(true);
        }
    }, [registerData])


    async function handleRegisterSubmit(event){
        event.preventDefault();
        const currentData = registerData;
        const potentialSubmit = await fetchRegisterPost(currentData);
        if (!potentialSubmit){
            setError({message: "Failed to fetch."});
        } else if (potentialSubmit.message && potentialSubmit.message == "Thank you for signing up!") {
            props.setToken(potentialSubmit.token);
            props.setAccountId(potentialSubmit.accountId);
            props.setAccountUsername(potentialSubmit.username);
            props.setAdmin(potentialSubmit.admin);
            navigate(`/users/${potentialSubmit.accountId}`);
        } else {
            setError(potentialSubmit);
        }
  
    }

    return (
        <div className='registerMaster'>
            <p className='registerTitle'>Register</p>
            <p className='disclaimer'>This website uses JSON Web Tokens and Bcrypt. Unhashed passwords are never stored in the database. However, 
                it is still recommended to use a unique password for any website.
            </p>
            {props.token ?
                <>
                    <p>You cannot access this page while being logged in.</p>
                    <button onClick={()=>{
                    props.setToken(null);
                    props.setAccountId(null);
                    props.setAccountUsername(null);
                    props.setAdmin(false);
                    navigate('/');
                    }}>Log Out</button>
                </>
            :
                    <div className='Register'>
                    <form className="registerForm" onSubmit= {handleRegisterSubmit}>
                    <div className='registerEntries'>
                        <label className='registerLabel'>
                        Username: <input className='registerInput' type= 'text' value= {registerData.username} onChange= {(e) => {
                                const currentRegisterData = registerData;
                                setRegisterData({...currentRegisterData, username: e.target.value});
                                }}/>
                        </label>
                        <label className='registerLabel'>
                        Email: <input className='registerInput' type= 'email' value= {registerData.email} onChange= {(e) => {
                                const currentRegisterData = registerData;
                                setRegisterData({...currentRegisterData, email: e.target.value});
                                }}/>
                        </label>
                        <label className='registerLabel'>
                        Password: <input className='registerInput' type= 'password' value= {registerData.password} onChange= {(e) => {
                                const currentRegisterData = registerData;
                                setRegisterData({...currentRegisterData, password: e.target.value});
                                }}/>
                        </label>
                        <label className='registerLabel'>
                        Confirm Password: <input className='registerInput' type= 'password' value= {registerData.confirmPassword} onChange= {(e) => {
                                const currentRegisterData = registerData;
                                setRegisterData({...currentRegisterData, confirmPassword: e.target.value});
                                }}/>
                        </label>
                    </div>
                        {notAMatch && <p className='notAMatch'>Password and Confirm Password must match.</p>}
                        <button disabled={notAMatch}className="registerSubmitButton" id='submit'>Submit</button>
                        {error.message && <p className='registerErrMess'>{error.message}</p>}
                </form>
                </div>
            }
        </div>
    )
}