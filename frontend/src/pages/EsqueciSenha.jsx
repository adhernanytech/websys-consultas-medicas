// src/pages/EsqueciSenha.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setMensagem('');

    // Simulação do backend
    setTimeout(() => {
      if (email.includes('@')) {
        setMensagem('Se este email estiver registado, receberá um link de recuperação em breves instantes.');
      } else {
        setErro('Por favor, insira um email válido.');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Insira o seu email associado à conta.
          </p>
        </div>
        
        {mensagem && <div className="bg-green-100 text-green-700 p-3 rounded">{mensagem}</div>}
        {erro && <div className="bg-red-100 text-red-700 p-3 rounded">{erro}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="O seu endereço de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={
                `group relative w-full flex justify-center py-2 px-4
                 border border-transparent text-sm font-medium rounded-md 
                 text-white 
                 ${loading ? 'bg-primaira-suave' : 'bg-primaria hover:bg-primaria-hover'} 
                 focus:outline-none focus:ring-2 focus:ring-offset-2 
                 focus:ring-blue-500`
              }
            >
              {loading ? 'A processar...' : 'Enviar Link de Recuperação'}
            </button>
          </div>
          <div className="text-center mt-4">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Voltar ao Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EsqueciSenha;