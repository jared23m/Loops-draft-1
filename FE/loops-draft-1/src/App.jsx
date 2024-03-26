
import './App.css'
import {useEffect, useState} from 'react'
import {Route, Routes} from 'react-router-dom'
import CreateLoop from './components/CreateLoop'
import EditLoop from './components/EditLoop'
import Login from './components/Login'
import Register from './components/Register'
import SingleUser from './components/SingleUser'
import AllUsers from './components/AllUsers'
import SingleLoop from './components/SingleLoop'
import AllLoops from './components/AllLoops'
import Thruline from './components/Thruline'
import NavBar from './components/NavBar'

function App() {

  const [token, setToken] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [accountUsername, setAccountUsername] = useState(null);
  const [admin, setAdmin] = useState(false);

  useEffect(()=>{
    console.log(accountId);
  }, [accountId]);

  return (
    <>
    <NavBar accountId={accountId}/>
    <Routes>
    <Route
      path="/"
      element={<CreateLoop/>}
      ></Route>
    <Route
      path="/edit/:loopId"
      element={<EditLoop/>}
      ></Route>
    <Route
      path="/login"
      element={<Login 
                setToken={setToken}
                setAccountId={setAccountId}
                setAccountUsername={setAccountUsername}
                setAdmin={setAdmin}/>}
      ></Route>
    <Route
      path="/register"
      element={<Register
                setToken={setToken}
                setAccountId={setAccountId}
                setAccountUsername={setAccountUsername}
                 setAdmin={setAdmin}/>}
      ></Route>
    <Route
      path="/users/:userId"
      element={<SingleUser/>}
      ></Route>
    <Route
      path="/users"
      element={<AllUsers/>}
      ></Route>
    <Route
      path="/loops/:loopId"
      element={<SingleLoop/>}
      ></Route>
     <Route
      path="/loops"
      element={<AllLoops token={token}/>}
      ></Route>
    <Route
      path="/thruline/:loopId"
      element={<Thruline/>}
      ></Route>
    </Routes>
    </>
  )
}

export default App
