// frontend/src/App.jsx

import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AppointmentForm from './AppointmentForm';
import AdminPage from './AdminPage';
import LoginPage from './LoginPage';
import ProtectedRoute from './ProtectedRoute';
import EditAppointmentPage from './EditAppointmentPage'; // Importamos a página de edição
import './index.css'; // Importa os estilos do Tailwind

function App() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn'); // Remove a marcação de login
    navigate('/login'); // Redireciona para a página de login
  };

  return (
    <div>
      <nav className="main-nav bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <Link to="/" className="p-2 hover:bg-gray-700 rounded">Agendamento</Link>
          <Link to="/admin" className="p-2 hover:bg-gray-700 rounded">Painel do Admin</Link>
        </div>
        {/* Mostra o botão de Logout apenas se o usuário estiver logado */}
        {isLoggedIn && (
          <button onClick={handleLogout} className="p-2 bg-red-600 hover:bg-red-700 rounded">
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

// ESTA É A LINHA CRUCIAL QUE PROVAVELMENTE ESTÁ FALTANDO
export default App;