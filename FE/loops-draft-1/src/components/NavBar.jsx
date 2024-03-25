import {Link} from 'react-router-dom'

export default function NavBar(props){
    return (
    <>
        <Link to="/">Create Loop</Link>
        <Link to="/loops">Loops</Link>
        <Link to="/users">Users</Link>
        {props.accountId ? 
        <Link to={`/users/${props.accountId}`}>Account</Link>
        :
        <>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
        </>
        }
    </>
    )
}

