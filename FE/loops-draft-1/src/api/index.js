const API_URL = 'http://localhost:3000/api/';

//USERS

export async function fetchAllUsersGet(token){
    let headers = {
        'Content-Type': 'application/json'
    }

    if (token){
        headers['Authorization'] = `Bearer ${token}`;
    }

    try{
        const response = await fetch(`${API_URL}users`, 
        { 
            method: "GET",
            headers
        })
        const json = await response.json();
        return json;
    } catch (error) {
        return error;
    }
}

export async function fetchSingleUserGet(token, userId){
    let headers = {
        'Content-Type': 'application/json'
    }

    if (token){
        headers['Authorization'] = `Bearer ${token}`;
    }

    try{
        const response = await fetch(`${API_URL}users/${userId}`, 
        { 
            method: "GET",
            headers
        })
        const json = await response.json();
        return json;
    } catch (error) {
        return error;
    }
}

export async function fetchLoginPost(loginData){
    try{
            const response = await fetch(`${API_URL}users/login`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: loginData.username,
                    password: loginData.password
                })
            });
            const json = await response.json();
            return json;
    } catch (error){
            return (error);
    }
}

export async function fetchRegisterPost(registerData){
    try{
            const response = await fetch(`${API_URL}users/register`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: registerData.username,
                    email: registerData.email,
                    password: registerData.password

                })
            });
            const json = await response.json();
            return json;
    } catch (error){
            return (error);
    }
}

export async function fetchUserPatch(patchUserData, token, userId){
    try{

            const input = {
                username: patchUserData.username,
                    password: patchUserData.password,
                    email: patchUserData.email,
                    admin: patchUserData.admin,
                    isActive: patchUserData.isActive
            }

            if (!input.username){
                delete input.username;
            }

            if (!input.password){
                delete input.password;
            }

            if (!input.email){
                delete input.email;
            }

            if (!input.admin){
                delete input.admin;
            }

            if (!input.isActive){
                delete input.isActive;
            }
            const response = await fetch(`${API_URL}users/${userId}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(input)
            });
            const json = await response.json();
            return json;
    } catch (error){
            return (error);
    }
}

export async function fetchUserDelete(token, userId){
    try{
            const response = await fetch(`${API_URL}users/${userId}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const json = await response.json();
            return json;
    } catch (error){
            return (error);
    }
}

export async function fetchLoopBankGet(token){
    try{
        const response = await fetch(`${API_URL}users/loopBank`, 
        { 
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        const json = await response.json();
        return json;
    } catch (error) {
        return error;
    }
}

//LOOPS

export async function fetchAllLoopsGet(token){
    let headers = {
        'Content-Type': 'application/json'
    }

    if (token){
        headers['Authorization'] = `Bearer ${token}`;
    }

    try{
        const response = await fetch(`${API_URL}loops`, 
        { 
            method: "GET",
            headers
        })
        const json = await response.json();
        return json;
    } catch (error) {
        return error;
    }
}

export async function fetchSingleLoopGet(token, loopId){
    let headers = {
        'Content-Type': 'application/json'
    }

    if (token){
        headers['Authorization'] = `Bearer ${token}`;
    }

    try{
        const response = await fetch(`${API_URL}loops/${loopId}`, 
        { 
            method: "GET",
            headers
        })
        const json = await response.json();
        return json;
    } catch (error) {
        return error;
    }
}

export async function fetchThrulineGet(token, loopId){
    let headers = {
        'Content-Type': 'application/json'
    }

    if (token){
        headers['Authorization'] = `Bearer ${token}`;
    }

    try{
        const response = await fetch(`${API_URL}/loops/thruline/${loopId}`, 
        { 
            method: "GET",
            headers
        })
        const json = await response.json();
        return json;
    } catch (error) {
        return error;
    }
}

export async function fetchStartLoopPost(startLoopData, token){
    try{
            const response = await fetch(`${API_URL}loops`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: startLoopData.title,
                    status: startLoopData.status,
                    keySig: startLoopData.keySig,
                    relativeChordNames: startLoopData.relativeChordNames,
                    jottings: startLoopData.jottings
                })
            });
            const json = await response.json();
            return json;
    } catch (error){
            return (error);
    }
}

export async function fetchReplyLoopPost(replyLoopData, token, parentLoopId){
    try{
            const response = await fetch(`${API_URL}loops/${parentLoopId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    keySig: replyLoopData.keySig,
                    relativeChordNames: replyLoopData.relativeChordNames,
                    jottings: replyLoopData.jottings
                })
            });
            const json = await response.json();
            return json;
    } catch (error){
            return (error);
    }
}

export async function fetchForkLoopPost(forkLoopData, token, forkedFromLoopId){
    try{
            const response = await fetch(`${API_URL}loops/fork/${forkedFromLoopId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: forkLoopData.title,
                    status: forkLoopData.status,
                })
            });
            const json = await response.json();
            return json;
    } catch (error){
            return (error);
    }
}

export async function fetchLoopPatch(patchLoopData, token, loopId, mode){
    try{
            let objectBody = {
                title: patchLoopData.title,
                status: patchLoopData.status,
                keySig: patchLoopData.keySig,
                relativeChordNames: patchLoopData.relativeChordNames,
                jottings: patchLoopData.jottings
            }
            if (mode=='reply'){
                delete objectBody.title;
                delete objectBody.status;
            }
            let body = JSON.stringify(objectBody);
            const response = await fetch(`${API_URL}loops/${loopId}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body
            });
            const json = await response.json();
            return json;
    } catch (error){
            return (error);
    }
}

export async function fetchLoopDelete(token, loopId){
    try{
            const response = await fetch(`${API_URL}loops/${loopId}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const json = await response.json();
            return json;
    } catch (error){
            return (error);
    }
}


//SAVES

export async function fetchSaveLoopPost(token, loopId){
    try{
            const response = await fetch(`${API_URL}saves/${loopId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const json = await response.json();
            return json;
    } catch (error){
            return (error);
    }
}





