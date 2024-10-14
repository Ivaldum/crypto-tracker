import './app.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Favorites from './components/Favorites';
import Panel from './components/Panel';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import { AuthProvider } from './context/AuthContext';
import CryptoDetails from './components/CryptoDetails';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/panel"
            element={
              <ProtectedRoute>
                <Panel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
           <Route 
              path="/crypto/:id" 
              element={
                <ProtectedRoute>
                  <CryptoDetails />
                </ProtectedRoute>
              }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;