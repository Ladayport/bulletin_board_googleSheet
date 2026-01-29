import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                {/* 階段三會再實作 /login 與 /admin */}
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
