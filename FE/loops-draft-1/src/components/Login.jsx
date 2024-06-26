import {useState} from 'react'
import { fetchLoginPost } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login(props){
    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState({message: null});
    const navigate = useNavigate();

    async function handleLoginSubmit(event){
        event.preventDefault();
        setError({message: "Loading... This may take a few minutes if the server hasn't been used recently."});
        const potentialSubmit = await fetchLoginPost(loginData);
        if (!potentialSubmit){
            setError({message: "Failed to fetch."});
        } else if (potentialSubmit.message && potentialSubmit.message == "Successfully logged in!") {
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
        <div className='loginMaster'>
            <p className='loginTitle'>Login</p>
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
            <div className='LoginFromContainer'>
            <form className="logInForm" onSubmit= {handleLoginSubmit}>
                <div className='logInEntries'>
                    <label className='logInLabel'>
                    Username: <input className='logInInput' type= 'text' value= {loginData.username} onChange= {(e) => {
                            const currentLoginData = loginData;
                            setLoginData({...currentLoginData, username: e.target.value});
                            }}/>
                    </label>
                    <label className='logInLabel'>
                     Password: <input className='logInInput' type= 'password' value= {loginData.password} onChange= {(e) => {
                            const currentLoginData = loginData;
                            setLoginData({...currentLoginData, password: e.target.value});
                            }}/>
                    </label>
                </div>
                    <button className="logInSubmitButton" id='submit'>Submit</button>
                    {error.message && <p className='logInErrMess'>{error.message}</p>}
            </form>
            </div>
            }
        </div>
    )
}