import {Link} from 'react-router-dom'

export default function UserCard(props){

    return (
        <>
            {props.user &&
            <>
                <Link to={`/users/${props.user.id}`}>{props.user.username}</Link>
                {props.user.admin == true && <p>Status: Admin</p>}
                {props.user.admin == false && <p>Status: User</p>}
                {props.user.email && <p>{props.user.email}</p>}
            </>
            }
        </>
    )
}