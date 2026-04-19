import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { errorHandler, notFoundHandler } from './middleware/error.middleware';

import authRouter from './routes/auth.routes';
import usersRouter from './routes/users.routes';
import jobsRouter from './routes/jobs.routes';
import searchRouter from './routes/search.routes';
import applicationsRouter from './routes/applications.routes';
import interviewsRouter from './routes/interviews.routes';
import bookmarksRouter from './routes/bookmarks.routes';
import recommendationsRouter from './routes/recommendations.routes';
import reportsRouter from './routes/reports.routes';
import verificationsRouter from './routes/verifications.routes';
import paymentsRouter from './routes/payments.routes';
import chatRouter from './routes/chat.routes';
import conferenceRouter from './routes/conference.routes';
import invitationsRouter from './routes/invitations.routes';

const app = express();
app.set('trust proxy', 1);
// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',   // Next.js frontend local
      'http://localhost:8080',   // Flutter web local
      'http://10.0.2.2:4000',   // Android emulator
    ];

    // Allow any Codespace URL (*.app.github.dev)
    const isCodespace = origin.endsWith('.app.github.dev');

    if (allowedOrigins.includes(origin) || isCodespace) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/users', usersRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/search', searchRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/verifications', verificationsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/conference', conferenceRouter);
app.use('/api/invitations', invitationsRouter);

// 404 & error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
