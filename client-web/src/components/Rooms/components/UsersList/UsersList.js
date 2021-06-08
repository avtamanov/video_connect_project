import React from 'react';

const UsersList = ({users}) => {
    return <div className='users-list'>
        <p>Participants ({users && users.length})</p>
        {users && users.map(user => <p key={user.nickname}>{user.nickname}</p>)}
    </div>
}

export default UsersList;