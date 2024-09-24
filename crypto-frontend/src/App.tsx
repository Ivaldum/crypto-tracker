import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
// import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route
          path="/panel"
          //element={<ProtectedRoute element={<Panel />} redirectTo="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;