// frontend/src/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Verifica na "memória" do navegador se o usuário está logado
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, mostra o conteúdo que ele está tentando acessar (a página de admin)
  return children;
}

export default ProtectedRoute;