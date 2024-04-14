import {useEffect, useState} from 'react'
import { fetchRegisterPost } from '../api';
import { useNavigate } from 'react-router-dom';
import { lettersAndNumbers } from '../musicTheory/index';

export default function Register(props){
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState({message: null});
    const [feErrors, setFeErrors] = useState(['Fields must be filled out before submitting.']);
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [submitName, setSubmitName] = useState('disabledRegisterSubmit');
    const navigate = useNavigate();

    useEffect(()=>{
        let currentErrors=[];
        if (registerData.username == '' || registerData.email=='' || registerData.password==''){
            currentErrors = ['Fields must be filled out before submitting.'];
        } 
            if (registerData.username.length > 8){
                currentErrors.push('Username length must be 8 characters or fewer.');
            }

            if(!lettersAndNumbers(registerData.username)){
                currentErrors.push('Username must only have letters and numbers.');
            }

            if(registerData.password.length > 0 && (registerData.password.length < 8 || registerData.password.length > 15)){
                currentErrors.push('Password must be 8-15 characters.');
            }

            if(registerData.email.length > 30){
                currentErrors.push('Email must be 30 characters or fewer.');
            }

            if(registerData.email.length > 0 && !registerData.email.includes('@')){
                currentErrors.push('Email must include an @ symbol.');
            }

            if (registerData.password != registerData.confirmPassword){
                currentErrors.push('Password and confirm password must match.');
            }

        if(currentErrors.length > 0){
            setSubmitDisabled(true);
            setSubmitName('disabledRegisterSubmit');
        } else {
            setSubmitDisabled(false);
            setSubmitName('registerSubmitButton');
        }

        setFeErrors([...currentErrors]);

    }, [registerData])


    async function handleRegisterSubmit(event){
        event.preventDefault();
        setError({message: "Loading... This may take a few minutes if the server hasn't been used recently."});
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
                        <div className='registerUsernameAndCharCount'>
                        <label className='registerUsernameLabel'>
                            Username: <input className='registerInput' type= 'text' value= {registerData.username} onChange= {(e) => {
                                    const currentRegisterData = registerData;
                                    setRegisterData({...currentRegisterData, username: e.target.value});
                                    }}/>
                            </label>
                            <p className={(registerData.username.length > 8 || registerData.username.length == 0) ? 'usernameCharCountRed' : 'usernameCharCount'}>{registerData.username.length}/8</p>
                        </div>
                        <label className='registerLabel'>
                        Email: <input className='registerInput' type= 'email' value= {registerData.email} onChange= {(e) => {
                                const currentRegisterData = registerData;
                                setRegisterData({...currentRegisterData, email: e.target.value});
                                }}/>
                        </label>
                        <div className='registerPasswordAndCharCount'>
                            <label className='registerPasswordLabel'>
                            Password: <input className='registerInput' type= 'password' value= {registerData.password} onChange= {(e) => {
                                    const currentRegisterData = registerData;
                                    setRegisterData({...currentRegisterData, password: e.target.value});
                                    }}/>
                            </label>
                            <p className={(registerData.password.length < 8 || registerData.password.length > 15)  ? 'passwordCharCountRed' : 'passwordCharCount'}>8/{registerData.password.length}/15</p>
                        </div>
                        <label className='registerLabel'>
                        Confirm Password: <input className='registerInput' type= 'password' value= {registerData.confirmPassword} onChange= {(e) => {
                                const currentRegisterData = registerData;
                                setRegisterData({...currentRegisterData, confirmPassword: e.target.value});
                                }}/>
                        </label>
                    </div>
                        {feErrors.length > 0 &&
                            <div className='mappedRegisterErrors'>
                            {feErrors.map((error) =>{
                                return <p key={error}>{error}</p>;
                            })}
                            </div>
                        }
                        <button disabled={submitDisabled}className={submitName} id='submit'>Submit</button>
                        {error.message && <p className='registerErrMess'>{error.message}</p>}
                </form>
                </div>
            }
        </div>
    )
}