// src/pages/RedefinirSenha.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const RedefinirSenha = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Captura o token do URL ex: /redefinir-senha?token=123
  
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    if (senha !== confirmarSenha) {
      return setErro('As senhas não coincidem.');
    }
    if (senha.length < 6) {
      return setErro('A senha deve ter pelo menos 6 caracteres.');
    }

    // Aqui chamaremos a API enviando { token, novaSenha }
    alert('Senha redefinida com sucesso! Pode fazer login.');
    navigate('/login');
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h2 className="text-xl text-red-600">Link de recuperação inválido ou expirado.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Criar Nova Senha
          </h2>
        </div>
        
        {erro && <div className="bg-red-100 text-red-700 p-3 rounded">{erro}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nova Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirmar Nova Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Redefinir e Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default RedefinirSenha;