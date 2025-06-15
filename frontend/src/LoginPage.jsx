// PARTE 1: Importações
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// PARTE 2: O Coração do Componente
function LoginPage() {
  const [password, setPassword] = useState(''); // "Memória" para a senha
  const navigate = useNavigate(); // Ferramenta para mudar de página

  // PARTE 3: A Lógica do Login
  const handleLogin = () => {
    if (password === 'admin123') { // Se a senha estiver correta...
      localStorage.setItem('isLoggedIn', 'true'); //...marcamos como logado no navegador...
      navigate('/admin'); //...e redirecionamos para a página de admin.
    } else {
      alert('Senha incorreta.'); // Se estiver errada, mostramos um alerta.
    }
  };

  // PARTE 4: A Estrutura Visual
  return (
    // O Container Principal (fundo escuro)
    <div className="min-h-screen flex flex-col items-center p-4 font-sans">
      {/* O Cartão de Login (branco) */}
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-sm">
        {/* O Título */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Acesso Restrito</h2>
        {/* O Texto de Instrução */}
        <p className="text-gray-700 mb-4 text-center">Por favor, insira a senha para acessar o painel do administrador.</p>
        
        {/* O Campo de Senha */}
        <div className="mb-4">
          <label htmlFor="senha" className="block text-gray-700 text-sm font-bold mb-2">
            Senha:
          </label>
          <input
            type="password"
            id="senha"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* O Botão de Entrar */}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          type="button"
          onClick={handleLogin}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}

export default LoginPage;