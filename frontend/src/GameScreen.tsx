import { useState, useEffect } from 'react';
import storyDataRaw from './story.json';
import ChromaVideo from './ChromaVideo';

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
  video?: string;
  texto: string;
  opcoes: Opcao[];
}

interface Historia {
  id: string;
  titulo: string;
  tema: string;
  descricao: string;
  imagem_capa?: string; // Pode ser video_capa
  cenas: Cena[];
}

const storyData = storyDataRaw as { historias: Historia[] };

const GameScreen = () => {
  const [historiaAtual, setHistoriaAtual] = useState<Historia | null>(null);
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
  const [mascoteState, setMascoteState] = useState<'neutro' | 'feliz' | 'triste' | 'tutorial'>('tutorial');
  
  // Controle para animação de fade
  const [fade, setFade] = useState(false);
  
  // Controle dos painéis de anúncios laterais
  const [adIndices, setAdIndices] = useState([0, 1]); // [leftIndex, rightIndex]
  
  const ADS_LIST = [
    '/assets/ads/ad_1.jpg',
    '/assets/ads/ad_2.jpg',
    '/assets/ads/ad_3.jpg',
    '/assets/ads/ad_4.jpg'
  ];

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    setFade(true);
  }, []);

  // Sorteia novos anúncios toda vez que a cena mudar
  useEffect(() => {
    if (cenaAtual) {
      let left = Math.floor(Math.random() * ADS_LIST.length);
      let right = Math.floor(Math.random() * ADS_LIST.length);
      while (right === left) {
        right = Math.floor(Math.random() * ADS_LIST.length);
      }
      setAdIndices([left, right]);
    }
  }, [cenaAtual]);

  const iniciarHistoria = (historia: Historia) => {
    setFade(false);
    setTimeout(() => {
      setHistoriaAtual(historia);
      const inicial = historia.cenas.find(c => c.id === 'cena_1');
      if (inicial) {
        setCenaAtual(inicial);
      }
      // Reseta status do mascote
      setMascoteState('neutro');
      setSimbolos({
        redeDeApoio: 0, justica: 0, conhecimento: 0, respeito: 0, autonomia: 0
      });
      setFinalizado(false);
      setFade(true);
    }, 500);
  };

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

      if (historiaAtual) {
        const proxima = historiaAtual.cenas.find(c => c.id === opcao.proximaCenaId);
        if (proxima) {
          setCenaAtual(proxima);
          if (proxima.opcoes.length === 0) {
            setFinalizado(true);
          }
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

  // TELA DE MENU INICIAL
  if (!historiaAtual || !cenaAtual) {
    return (
      <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Background Animado Genérico ou Vídeo de Capa */}
        <div className="absolute inset-0 bg-slate-950 z-0 opacity-80"></div>
        
        <div className={`relative z-10 w-full max-w-5xl transition-all duration-1000 transform ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4 drop-shadow-lg">
              Caminhos de Respeito
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Escolha uma história para jogar. Cada decisão pode ajudar a quebrar o ciclo da violência e construir um novo caminho.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {storyData.historias.map(historia => (
              <div 
                key={historia.id} 
                className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 hover:border-pink-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] flex-1 flex flex-col group"
              >
                <div className="h-40 bg-slate-700 rounded-xl mb-4 overflow-hidden relative">
                  {/* Placeholder de Imagem/Video Capa */}
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm font-bold uppercase tracking-widest bg-slate-800">
                    <video src={historia.imagem_capa || ''} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{historia.titulo}</h2>
                <span className="inline-block px-3 py-1 bg-pink-600/30 text-pink-400 rounded-full text-xs font-bold uppercase mb-4 w-max">
                  {historia.tema}
                </span>
                <p className="text-slate-400 text-sm mb-6 flex-1">
                  {historia.descricao}
                </p>
                <button 
                  onClick={() => iniciarHistoria(historia)}
                  className="w-full py-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition-colors shadow-lg"
                >
                  Jogar História
                </button>
              </div>
            ))}
          </div>

          {/* Coelho Mascote Explicando o Menu */}
          <div className="mt-12 flex justify-center items-center gap-4">
             <div className="w-24 h-24 rounded-full border-2 border-pink-500 overflow-hidden bg-slate-800">
                <ChromaVideo src="/assets/coelho_tutorial.mp4" className="w-full h-full" />
             </div>
             <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 max-w-sm">
                <p className="text-sm text-slate-300 italic">"Olá! Eu serei seu guia. Escolha uma das histórias acima para começar a nossa jornada interativa."</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // TELA DO JOGO (História Rodando)
  return (
    <div className="min-h-screen relative flex flex-col justify-between p-4 md:p-8 overflow-hidden bg-slate-900">
      
      {/* BACKGROUND COM ANÚNCIOS LATERAIS (PC) E VÍDEO CENTRAL */}
      <div className="absolute inset-0 z-0 flex bg-black">
        
        {/* Painel Esquerdo (Anúncio) - Oculto no mobile */}
        <div className="hidden md:block flex-1 h-full relative overflow-hidden group">
          <img 
            src={ADS_LIST[adIndices[0]]} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-1000" 
            alt="Conscientização"
          />
          {/* Gradiente para mesclar com o centro */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-transparent to-slate-950/90 pointer-events-none"></div>
        </div>

        {/* Vídeo da História Central (Forçado em 9:16 no Desktop) */}
        <div className="w-full h-full md:w-auto md:aspect-[9/16] bg-black relative shrink-0 shadow-[0_0_50px_rgba(0,0,0,1)] z-10">
          <video 
            key={cenaAtual.video} 
            src={cenaAtual.video}
            autoPlay 
            loop 
            muted 
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-1000 ${fade ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* Overlay escuro para dar contraste ao texto */}
          <div className="absolute inset-0 bg-slate-950/60 z-10 transition-opacity duration-1000"></div>
        </div>

        {/* Painel Direito (Anúncio) - Oculto no mobile */}
        <div className="hidden md:block flex-1 h-full relative overflow-hidden group">
          <img 
            src={ADS_LIST[adIndices[1]]} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-1000" 
            alt="Conscientização"
          />
          {/* Gradiente para mesclar com o centro */}
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/40 via-transparent to-slate-950/90 pointer-events-none"></div>
        </div>
      </div>

      {/* HUD de Símbolos */}
      <div className="relative z-20 w-full md:max-w-md mx-auto bg-slate-900/60 backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-700/50 flex flex-wrap gap-3 justify-between text-xs md:text-sm mb-2">
        <button 
          onClick={() => setHistoriaAtual(null)}
          className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-md text-[10px] font-bold uppercase border border-slate-600 text-slate-300 transition-colors"
        >
          ← Menu
        </button>
        <div className="flex gap-4 mx-auto md:mx-0">
          <div className="flex flex-col items-center">
            <span className="text-pink-400 font-bold uppercase text-[9px] tracking-wider">Apoio</span>
            <span className="text-base md:text-lg font-black text-white">{simbolos.redeDeApoio}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-blue-400 font-bold uppercase text-[9px] tracking-wider">Justiça</span>
            <span className="text-base md:text-lg font-black text-white">{simbolos.justica}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-yellow-400 font-bold uppercase text-[9px] tracking-wider">Saber</span>
            <span className="text-base md:text-lg font-black text-white">{simbolos.conhecimento}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-green-400 font-bold uppercase text-[9px] tracking-wider">Respeito</span>
            <span className="text-base md:text-lg font-black text-white">{simbolos.respeito}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-purple-400 font-bold uppercase text-[9px] tracking-wider">Auto</span>
            <span className="text-base md:text-lg font-black text-white">{simbolos.autonomia}</span>
          </div>
        </div>
      </div>

      {/* Área da História e Mascote (O React) */}
      <div className={`relative z-20 w-full md:max-w-[500px] mx-auto mt-auto flex flex-col md:flex-row items-end gap-3 transition-all duration-500 transform ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Mascote (Avatar com Vídeo Chroma Key) */}
        <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-full border-2 border-pink-500 overflow-hidden shadow-[0_0_20px_rgba(236,72,153,0.3)] bg-slate-800 transition-transform hover:scale-105 duration-300 relative self-center md:self-end">
           <ChromaVideo 
             key={`coelho_${mascoteState}`} 
             src={`/assets/coelho_${mascoteState}.mp4`} 
             className="w-full h-full"
           />
        </div>

        {/* Caixa de Diálogo */}
        <div className="flex-1 w-full bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-xl border border-slate-600/40 flex flex-col">
          <div className="mb-2">
            <span className="px-2 py-1 bg-pink-600/80 rounded-md text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
              {cenaAtual.tipo}
            </span>
          </div>
          
          <p className="text-sm leading-relaxed mb-4 text-slate-100 font-medium">
            {cenaAtual.texto}
          </p>

          {!finalizado ? (
            <div className="flex flex-col gap-2 mt-auto">
              {cenaAtual.opcoes.map((opcao, index) => (
                <button
                  key={index}
                  onClick={() => handleEscolha(opcao)}
                  className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-pink-600/90 hover:text-white transition-all duration-300 border border-slate-600/50 hover:border-pink-400 focus:outline-none shadow-sm text-xs text-slate-200"
                >
                  {opcao.texto}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-auto flex flex-col items-center bg-slate-800/50 p-4 rounded-xl border border-slate-600/50">
              <h2 className="text-xl font-black mb-1 text-white text-center">Jornada Concluída!</h2>
              <p className="mb-4 text-xs text-slate-300 text-center">
                Você acumulou <span className="font-bold text-pink-400">{calcularTotal()}</span> Símbolos.
              </p>
              
              <div className="w-full flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Seu nome" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-900/80 border border-slate-500 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
                  maxLength={20}
                />
                <button 
                  onClick={salvarRanking}
                  disabled={loadingReq}
                  className="w-full p-3 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-bold transition-colors shadow-md"
                >
                  {loadingReq ? 'Salvando...' : 'Salvar Ranking'}
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
