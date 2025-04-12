import './App.css'
import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="app-container">
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App
