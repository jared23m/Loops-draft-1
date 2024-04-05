import {Link} from 'react-router-dom'

export default function UserCard(props){

    return (
        <div className='userCard'>
                <Link className='userCardName'to={`/users/${props.user.id}`}>{props.user.username}</Link>
                {props.user.admin == true && <p className='userCardStatus'>Status: Admin</p>}
                {props.user.admin == false && <p className='userCardStatus'>Status: User</p>}
                {props.user.email && <p className='userCardEmail'>{props.user.email}</p>}
        </div>
    )
}