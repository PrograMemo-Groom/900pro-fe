import './App.css'
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ApiTest from './pages/ApiTest'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<ApiTest />} />
        </Routes>
    </Router>
    </>
  )
}

export default App
