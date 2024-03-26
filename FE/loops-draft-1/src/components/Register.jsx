import {useState} from 'react'
import { fetchRegisterPost } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Register(props){
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleRegisterSubmit(event){
        event.preventDefault();
        const potentialSubmit = await fetchRegisterPost(registerData);
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
    <div className='Register'>
     <form className="registerForm" onSubmit= {handleRegisterSubmit}>
            <div className='registerEntries'>
                <label className='registerUsername'>
                Username: <input className='registerInput' type= 'text' value= {registerData.username} onChange= {(e) => {
                        const currentRegisterData = registerData;
                        setRegisterData({...currentRegisterData, username: e.target.value});
                        }}/>
                </label>
                <label className='registerEmail'>
                Email: <input className='registerInput' type= 'email' value= {registerData.email} onChange= {(e) => {
                        const currentRegisterData = registerData;
                        setRegisterData({...currentRegisterData, email: e.target.value});
                        }}/>
                </label>
                <label className='registerPassword'>
                 Password: <input className='registerInput' type= 'password' value= {registerData.password} onChange= {(e) => {
                        const currentRegisterData = registerData;
                        setRegisterData({...currentRegisterData, password: e.target.value});
                        }}/>
                </label>
            </div>
                <button className="registerButton" id='submit'>Submit</button>
                {error && <p className='registerErrMess'>{error.message}</p>}
        </form>
    </div>
    )
}