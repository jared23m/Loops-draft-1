import {Link, useNavigate} from 'react-router-dom'

export default function NavBar(props){
    const navigate = useNavigate();

    return (
    <>
        <Link to="/edit/new">Create Loop</Link>
        <Link to="/loops">Loops</Link>
        <Link to="/users">Users</Link>
        {props.accountId ? 
        <>
            <Link to={`/users/${props.accountId}`}>Account</Link>
            <button onClick={()=>{
                props.setToken(null);
                props.setAccountId(null);
                props.setAccountUsername(null);
                props.setAdmin(false);
                navigate('/');
            }}>Log Out</button>
        </>
        
        :
        <>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
        </>
        }
    </>
    )
}

