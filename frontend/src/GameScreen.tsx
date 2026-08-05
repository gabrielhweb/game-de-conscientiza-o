import React, { useState, useEffect } from 'react';
import storyData from './story.json';

interface Simbolos {
  redeDeApoio: number;
  justica: number;
  conhecimento: number;
  respeito: number;
  autonomia: number;
}

interface Opcao {
  texto: string;
  proximaCenaId: string;
  efeito: Partial<Simbolos>;
}

interface Cena {
  id: string;
  tipo: 'situacao' | 'protecao' | 'alerta' | 'conhecimento';
  texto: string;
  opcoes: Opcao[];
}

const GameScreen: React.FC = () => {
  const [cenaAtual, setCenaAtual] = useState<Cena | null>(null);
  const [simbolos, setSimbolos] = useState<Simbolos>({
    redeDeApoio: 0,
    justica: 0,
    conhecimento: 0,
    respeito: 0,
    autonomia: 0,
  });
  const [nome, setNome] = useState('');
  const [finalizado, setFinalizado] = useState(false);
  const [loadingReq, setLoadingReq] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const cenas = storyData as Cena[];
    const inicial = cenas.find(c => c.id === 'cena_1');
    if (inicial) setCenaAtual(inicial);
  }, []);

  const handleEscolha = (opcao: Opcao) => {
    setSimbolos(prev => ({
      redeDeApoio: prev.redeDeApoio + (opcao.efeito.redeDeApoio || 0),
      justica: prev.justica + (opcao.efeito.justica || 0),
      conhecimento: prev.conhecimento + (opcao.efeito.conhecimento || 0),
      respeito: prev.respeito + (opcao.efeito.respeito || 0),
      autonomia: prev.autonomia + (opcao.efeito.autonomia || 0),
    }));

    const cenas = storyData as Cena[];
    const proxima = cenas.find(c => c.id === opcao.proximaCenaId);
    
    if (proxima) {
      setCenaAtual(proxima);
      if (proxima.opcoes.length === 0) {
        setFinalizado(true);
      }
    }
  };

  const calcularTotal = () => {
    return Object.values(simbolos).reduce((acc, val) => acc + val, 0);
  };

  const salvarRanking = async () => {
    if (!nome.trim()) {
      alert('Digite seu nome antes de salvar!');
      return;
    }
    
    setLoadingReq(true);
    try {
      const response = await fetch(`${API_URL}/ranking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, totalSimbolos: calcularTotal() })
      });
      
      if (response.ok) {
        alert('Resultado salvo no Ranking com sucesso!');
        setNome('');
      } else {
        alert('Erro ao salvar no servidor.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão com a API.');
    } finally {
      setLoadingReq(false);
    }
  };

  if (!cenaAtual) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-slate-800 rounded-xl p-4 mb-8 shadow-lg border border-slate-700 flex flex-wrap gap-4 justify-between text-sm md:text-base">
        <div className="flex flex-col items-center">
          <span className="text-pink-400 font-bold uppercase text-xs tracking-wider">Apoio</span>
          <span className="text-2xl font-black">{simbolos.redeDeApoio}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-blue-400 font-bold uppercase text-xs tracking-wider">Justiça</span>
          <span className="text-2xl font-black">{simbolos.justica}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-yellow-400 font-bold uppercase text-xs tracking-wider">Saber</span>
          <span className="text-2xl font-black">{simbolos.conhecimento}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-green-400 font-bold uppercase text-xs tracking-wider">Respeito</span>
          <span className="text-2xl font-black">{simbolos.respeito}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-purple-400 font-bold uppercase text-xs tracking-wider">Auto</span>
          <span className="text-2xl font-black">{simbolos.autonomia}</span>
        </div>
      </div>

      <div className="w-full max-w-3xl bg-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl border border-slate-700 transition-all">
        <div className="mb-6 flex items-center gap-3">
          <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold uppercase tracking-widest text-slate-300">
            {cenaAtual.tipo}
          </span>
        </div>
        
        <p className="text-lg md:text-xl leading-relaxed mb-10 text-slate-200">
          {cenaAtual.texto}
        </p>

        {!finalizado ? (
          <div className="flex flex-col gap-4">
            {cenaAtual.opcoes.map((opcao, index) => (
              <button
                key={index}
                onClick={() => handleEscolha(opcao)}
                className="w-full text-left p-5 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors border border-slate-600 hover:border-pink-500 focus:outline-none"
              >
                {opcao.texto}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center bg-slate-900/50 p-6 md:p-8 rounded-xl border border-slate-700">
            <h2 className="text-3xl font-black mb-2 text-white">Jornada Concluída!</h2>
            <p className="mb-8 text-slate-300 text-center">
              Você acumulou um total de <span className="text-2xl font-bold text-pink-500">{calcularTotal()}</span> Símbolos de Proteção.
            </p>
            
            <div className="w-full max-w-md flex flex-col gap-3">
              <label className="text-sm font-bold text-slate-400 ml-1">Salve sua pontuação:</label>
              <input 
                type="text" 
                placeholder="Seu nome ou apelido" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-4 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-pink-500 transition-colors"
                maxLength={20}
              />
              <button 
                onClick={salvarRanking}
                disabled={loadingReq}
                className="w-full p-4 mt-2 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-bold transition-colors"
              >
                {loadingReq ? 'Salvando...' : 'Salvar no Ranking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;
