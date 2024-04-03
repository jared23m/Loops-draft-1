import {Link, useNavigate} from 'react-router-dom'

export default function NavBar(props){
    const navigate = useNavigate();

    return (
    <div className="navBar">
        <h1 className='logo'>Loops</h1>
        <Link className='navButton' id='homeAbout'to='/'>Home/About</Link>
        <Link className='navButton' id='createLoop' to="/edit/new">Create Loop</Link>
        <Link className='navButton' id='allLoops'to="/loops">Loops</Link>
        <Link className='navButton' id='allUsers'to="/users">Users</Link>
        {props.accountId ? 
        <>
            <Link className='navButton' id='account' to={`/users/${props.accountId}`}>Account</Link>
            <button className='navButton' id='logOut'onClick={()=>{
                props.setToken(null);
                props.setAccountId(null);
                props.setAccountUsername(null);
                props.setAdmin(false);
                navigate('/');
            }}>Log Out</button>
        </>
        
        :
        <>
            <Link className='navButton' id='login'to='/login'>Login</Link>
            <Link className='navButton' id='register'to='/register'>Register</Link>
        </>
        }
    </div>
    )
}

