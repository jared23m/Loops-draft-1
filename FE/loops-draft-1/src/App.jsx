
import './App.css'
import {useEffect, useState} from 'react'
import {Route, Routes} from 'react-router-dom'
import EditLoop from './components/EditLoop'
import Login from './components/Login'
import Register from './components/Register'
import SingleUser from './components/SingleUser'
import AllUsers from './components/AllUsers'
import SingleLoop from './components/SingleLoop'
import AllLoops from './components/AllLoops'
import Thruline from './components/Thruline'
import NavBar from './components/NavBar'
import LoopBank from './components/LoopBank'

function App() {

  const [token, setToken] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [accountUsername, setAccountUsername] = useState(null);
  const [admin, setAdmin] = useState(false);

  return (
    <>
    <NavBar accountId={accountId} setToken={setToken} setAccountId={setAccountId} setAccountUsername={setAccountUsername} setAdmin={setAdmin}/>
    <p></p>
    <Routes>
    <Route
      path="/edit/:mode/:loopId"
      element={<EditLoop token={token} accountId={accountId}/>}
      ></Route>
    <Route
      path="/edit/:mode/"
      element={<EditLoop token={token} accountId={accountId}/>}
      ></Route>
    <Route
      path="/edit/:mode/:loopId/:secondaryLoopId"
      element={<EditLoop token={token} accountId={accountId}/>}
    ></Route>
    <Route
      path="/login"
      element={<Login 
                token = {token}
                setToken={setToken}
                setAccountId={setAccountId}
                setAccountUsername={setAccountUsername}
                setAdmin={setAdmin}/>}
      ></Route>
    <Route
      path="/register"
      element={<Register
                token = {token}
                setToken={setToken}
                setAccountId={setAccountId}
                setAccountUsername={setAccountUsername}
                 setAdmin={setAdmin}/>}
      ></Route>
      <Route
      path="/loopBankGrab/:mode/:secondaryLoopId"
      element={<LoopBank token={token} admin={admin} accountId={accountId}/>}
      ></Route>
       <Route
      path="/loopBankGrab/:mode/"
      element={<LoopBank token={token} admin={admin} accountId={accountId}/>}
      ></Route>
    <Route
      path="/users/:userId"
      element={<SingleUser token={token} admin={admin} accountId={accountId}/>}
      ></Route>
    <Route
      path="/users"
      element={<AllUsers/>}
      ></Route>
    <Route
      path="/loops/:loopId"
      element={<SingleLoop token={token} admin={admin} accountId={accountId}/>}
      ></Route>
     <Route
      path="/loops"
      element={<AllLoops token={token} admin={admin} accountId={accountId}/>}
      ></Route>
    <Route
      path="/thruline/:loopId"
      element={<Thruline token={token} admin={admin} accountId={accountId}/>}
      ></Route>
    </Routes>
    </>
  )
}

export default App
