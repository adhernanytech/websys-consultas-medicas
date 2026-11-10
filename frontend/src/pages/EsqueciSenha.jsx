// src/pages/EsqueciSenha.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppIcon from '../components/ui/AppIcon';

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
    <div className="min-h-screen flex items-center justify-center bg-fundo py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 border border-borda bg-white p-8 rounded-2xl shadow-lg shadow-slate-900/5">
        <div>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primaria/10 text-primaria"><AppIcon name="shield" size={26} /></span>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-texto">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-sm leading-6 text-texto-secundario">
            Insira o seu email associado à conta.
          </p>
        </div>
        
        {mensagem && <div className="bg-green-50 text-sucesso p-3 rounded-xl">{mensagem}</div>}
        {erro && <div className="bg-red-50 text-erro p-3 rounded-xl">{erro}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded-xl block w-full px-4 py-3 border border-borda placeholder:text-texto-suave text-texto focus:outline-none focus:ring-2 focus:ring-primaria/20 focus:border-primaria sm:text-sm"
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
                 border border-transparent text-sm font-medium rounded-xl 
                 text-white 
                 ${loading ? 'bg-primaria/60' : 'bg-primaria hover:bg-primaria-hover'} 
                 focus:outline-none focus:ring-2 focus:ring-offset-2 
                 focus:ring-primaria`
              }
            >
              {loading ? 'A processar...' : 'Enviar Link de Recuperação'}
            </button>
          </div>
          <div className="text-center mt-4">
            <Link to="/login" className="font-semibold text-primaria hover:text-primaria-hover">
              Voltar ao Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EsqueciSenha;