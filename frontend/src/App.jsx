import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AppointmentForm from './AppointmentForm';
import AdminPage from './AdminPage';
import LoginPage from './LoginPage';
import ProtectedRoute from './ProtectedRoute';
import EditAppointmentPage from './EditAppointmentPage';
import './index.css';

function App() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <div>
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg">
        <div>
          <Link to="/" className="p-2 hover:bg-gray-700 rounded-md text-lg font-semibold">Agendamento</Link>
          <Link to="/admin" className="p-2 ml-4 hover:bg-gray-700 rounded-md text-lg font-semibold">Painel do Admin</Link>
        </div>
        {isLoggedIn && (
          <button onClick={handleLogout} className="p-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-bold">
            Sair (Logout)
          </button>
        )}
      </nav>
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AppointmentForm />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit/:id" 
          element={
            <ProtectedRoute>
              <EditAppointmentPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;