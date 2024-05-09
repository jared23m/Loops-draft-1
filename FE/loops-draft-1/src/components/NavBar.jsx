import {Link, useNavigate} from 'react-router-dom'

export default function NavBar(props){
    const navigate = useNavigate();

    return (
    <div className="navBar">
        <h1 className='logo'>Loops</h1>
       
        <div className='navButtonContainer'>
            <Link className='navLink' id='homeAbout'to='/'>Home</Link>
            <Link className='navLink' id='allLoops'to="/loops">Loops</Link>
            <Link className='navLink' id='allUsers'to="/users">Users</Link>
            {props.accountId ? 
            <>
                <Link className='navLink' id='createLoop' to="/edit/new">Create</Link>
                <Link className='navLink' id='account' to={`/users/${props.accountId}`}>Account</Link>
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
                <Link className='navLink' id='login'to='/login'>Login</Link>
                <Link className='navLink' id='register'to='/register'>Register</Link>
            </>
            }
        </div>
    </div>
    )
}

