import { useState, useEffect } from 'react';
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
  imagem?: string;
  texto: string;
  opcoes: Opcao[];
}

const GameScreen = () => {
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
  const [mascoteState, setMascoteState] = useState<'neutro' | 'feliz' | 'triste'>('neutro');
  
  // Controle para animação de fade
  const [fade, setFade] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const cenas = storyData as Cena[];
    const inicial = cenas.find(c => c.id === 'cena_1');
    if (inicial) {
      setCenaAtual(inicial);
      setFade(true);
    }
  }, []);

  const handleEscolha = (opcao: Opcao) => {
    setFade(false); // Inicia fade out

    setTimeout(() => {
      const ganhouTotal = 
        (opcao.efeito.redeDeApoio || 0) + 
        (opcao.efeito.justica || 0) + 
        (opcao.efeito.conhecimento || 0) + 
        (opcao.efeito.respeito || 0) + 
        (opcao.efeito.autonomia || 0);

      if (ganhouTotal > 0) {
        setMascoteState('feliz');
      } else if (ganhouTotal < 0) {
        setMascoteState('triste');
      } else {
        setMascoteState('neutro');
      }

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
      setFade(true); // Termina fade in
    }, 400); // tempo da animação
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
    <div 
      className="min-h-screen relative flex flex-col justify-between p-4 md:p-8 transition-all duration-1000 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: cenaAtual.imagem ? `url(${cenaAtual.imagem})` : 'none' }}
    >
      {/* Overlay escuro para dar contraste ao texto */}
      <div className="absolute inset-0 bg-slate-950/60 z-0 transition-opacity duration-1000"></div>

      {/* HUD de Símbolos */}
      <div className="relative z-10 w-full max-w-4xl mx-auto bg-slate-900/70 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-slate-700/50 flex flex-wrap gap-4 justify-between text-sm md:text-base">
        <div className="flex flex-col items-center">
          <span className="text-pink-400 font-bold uppercase text-xs tracking-wider">Apoio</span>
          <span className="text-2xl font-black text-white">{simbolos.redeDeApoio}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-blue-400 font-bold uppercase text-xs tracking-wider">Justiça</span>
          <span className="text-2xl font-black text-white">{simbolos.justica}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-yellow-400 font-bold uppercase text-xs tracking-wider">Saber</span>
          <span className="text-2xl font-black text-white">{simbolos.conhecimento}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-green-400 font-bold uppercase text-xs tracking-wider">Respeito</span>
          <span className="text-2xl font-black text-white">{simbolos.respeito}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-purple-400 font-bold uppercase text-xs tracking-wider">Auto</span>
          <span className="text-2xl font-black text-white">{simbolos.autonomia}</span>
        </div>
      </div>

      {/* Área da História e Mascote */}
      <div className={`relative z-10 w-full max-w-4xl mx-auto mt-auto flex flex-col md:flex-row items-center md:items-end gap-6 transition-all duration-500 transform ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Mascote (Avatar) */}
        <div className="w-28 h-28 md:w-40 md:h-40 shrink-0 rounded-full border-4 border-pink-500 overflow-hidden shadow-[0_0_20px_rgba(236,72,153,0.4)] bg-slate-800 transition-transform hover:scale-105 duration-300">
           <img 
             src={`/assets/coelho_${mascoteState}.jpg`} 
             alt="Mascote" 
             className="w-full h-full object-cover"
           />
        </div>

        {/* Caixa de Diálogo */}
        <div className="flex-1 w-full bg-slate-900/85 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-600/50 flex flex-col">
          <div className="mb-4">
            <span className="px-3 py-1 bg-pink-600/80 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-sm">
              {cenaAtual.tipo}
            </span>
          </div>
          
          <p className="text-lg md:text-xl leading-relaxed mb-8 text-slate-100 font-medium">
            {cenaAtual.texto}
          </p>

          {!finalizado ? (
            <div className="flex flex-col gap-3 mt-auto">
              {cenaAtual.opcoes.map((opcao, index) => (
                <button
                  key={index}
                  onClick={() => handleEscolha(opcao)}
                  className="w-full text-left p-4 rounded-xl bg-slate-800/80 hover:bg-pink-600/90 hover:text-white transition-all duration-300 border border-slate-600 hover:border-pink-400 focus:outline-none shadow-sm hover:shadow-md text-slate-200"
                >
                  {opcao.texto}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-auto flex flex-col items-center bg-slate-800/50 p-6 rounded-2xl border border-slate-600/50">
              <h2 className="text-3xl font-black mb-2 text-white text-center">Jornada Concluída!</h2>
              <p className="mb-6 text-slate-300 text-center">
                Você acumulou um total de <span className="text-2xl font-bold text-pink-400">{calcularTotal()}</span> Símbolos de Proteção.
              </p>
              
              <div className="w-full flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Seu nome ou apelido" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-900/90 border border-slate-500 text-white focus:outline-none focus:border-pink-500 transition-colors"
                  maxLength={20}
                />
                <button 
                  onClick={salvarRanking}
                  disabled={loadingReq}
                  className="w-full p-4 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold transition-colors shadow-lg"
                >
                  {loadingReq ? 'Salvando...' : 'Salvar no Ranking'}
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default GameScreen;
