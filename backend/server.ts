import express, { Request, Response } from 'express';
import mongoose, { Document, Schema } from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/caminhos_da_protecao';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// ==========================================
// SCHEMAS E MODELS
// ==========================================

// 1. Schema de User/Session
interface ISession extends Document {
  cenaAtualId: string;
  simbolos: {
    redeDeApoio: number;
    justica: number;
    conhecimento: number;
    respeito: number;
    autonomia: number;
  };
}

const SessionSchema = new Schema<ISession>({
  cenaAtualId: { type: String, required: true },
  simbolos: {
    redeDeApoio: { type: Number, default: 0 },
    justica: { type: Number, default: 0 },
    conhecimento: { type: Number, default: 0 },
    respeito: { type: Number, default: 0 },
    autonomia: { type: Number, default: 0 }
  }
}, { timestamps: true });

// 2. Schema de Ranking/Historico
interface IRanking extends Document {
  nome: string;
  totalSimbolos: number;
}

const RankingSchema = new Schema<IRanking>({
  nome: { type: String, required: true },
  totalSimbolos: { type: Number, required: true }
}, { timestamps: true });

const Session = mongoose.model<ISession>('Session', SessionSchema);
const Ranking = mongoose.model<IRanking>('Ranking', RankingSchema);

// ==========================================
// ROTAS DA API
// ==========================================

app.post('/api/session', async (req: Request, res: Response) => {
  try {
    const { cenaAtualId, simbolos } = req.body;
    const session = new Session({ cenaAtualId, simbolos });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar sessão.' });
  }
});

app.post('/api/ranking', async (req: Request, res: Response) => {
  try {
    const { nome, totalSimbolos } = req.body;
    const ranking = new Ranking({ nome, totalSimbolos });
    await ranking.save();
    res.status(201).json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar ranking.' });
  }
});

app.get('/api/ranking', async (req: Request, res: Response) => {
  try {
    const topRanking = await Ranking.find().sort({ totalSimbolos: -1 }).limit(10);
    res.status(200).json(topRanking);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ranking.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
