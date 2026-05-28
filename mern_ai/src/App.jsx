import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SideBar from './component/SideBar/SideBar'
import {Routes,Route} from 'react-router-dom';
import Dashboard from './component/Dashboard/Dashboard'
import History from './component/History/History'
import Admin from './component/Admin/Admin'
import Login from './component/Login/Login'
import ScreeningPage from './component/Screening/ScreeningPage'
import ScreeningHistoryPage from './component/Screening/ScreeningHistoryPage'
import ScreeningResultsPage from './component/Screening/ScreeningResultsPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <SideBar />
      <Routes>
        <Route path='/' element={<Login />}/>
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/history' element={<History />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/screen' element={<ScreeningPage />} />
        <Route path='/screen/history' element={<ScreeningHistoryPage />} />
        <Route path='/screen/results/:sessionId' element={<ScreeningResultsPage />} />

      </Routes>
    </div>
  )
}

export default App
