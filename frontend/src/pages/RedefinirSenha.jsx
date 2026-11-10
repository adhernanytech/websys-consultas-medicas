// src/pages/RedefinirSenha.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppIcon from '../components/ui/AppIcon';

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
      <div className="min-h-[60vh] flex items-center justify-center bg-fundo px-5 py-12">
        <div className="max-w-lg rounded-2xl border border-borda bg-white p-8 text-center shadow-sm"><h2 className="text-xl font-bold text-erro">Link de recuperação inválido ou expirado.</h2><p className="mt-3 text-texto-secundario">Solicite um novo link de recuperação para continuar.</p><Link to="/esqueci-senha" className="mt-5 inline-flex rounded-xl bg-primaria px-5 py-3 font-semibold text-white hover:bg-primaria-hover">Pedir novo link</Link></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fundo py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-8 border border-borda bg-white p-8 rounded-2xl shadow-lg shadow-slate-900/5">
        <div>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primaria/10 text-primaria"><AppIcon name="shield" size={26} /></span>
          <h2 className="mt-5 text-center text-3xl font-extrabold text-texto">
            Criar Nova Senha
          </h2>
        </div>
        
        {erro && <div className="bg-red-100 text-red-700 p-3 rounded">{erro}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="password"
              required
              className="w-full rounded-xl border border-borda px-4 py-3 text-texto focus:outline-none focus:ring-2 focus:ring-primaria/20 focus:border-primaria"
              placeholder="Nova Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <input
              type="password"
              required
              className="w-full rounded-xl border border-borda px-4 py-3 text-texto focus:outline-none focus:ring-2 focus:ring-primaria/20 focus:border-primaria"
              placeholder="Confirmar Nova Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primaria hover:bg-primaria-hover transition"
          >
            Redefinir e Entrar
          </button>
        </form>
        <p className="text-center text-sm text-texto-secundario">Lembrou-se da palavra-passe? <Link to="/login" className="font-semibold text-primaria hover:underline">Voltar ao login</Link></p>
      </div>
    </div>
  );
};

export default RedefinirSenha;