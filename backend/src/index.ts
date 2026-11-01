
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PatientController, AppointmentController, TreatmentController, TreatmentCatalogController, AttentionController } from './controllers/core.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration: specifically allow all origins and methods to eliminate browser blocks
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dental Clinic API is running' });
});

// API Routes
app.get('/api/patients', PatientController.getAll);
app.post('/api/patients', PatientController.create);

app.get('/api/appointments', AppointmentController.getAll);
app.post('/api/appointments', AppointmentController.create);
app.patch('/api/appointments/:id', AppointmentController.updateStatus);

app.get('/api/treatments', TreatmentController.getAll);
app.patch('/api/treatments/:id', TreatmentController.updateProgress);
app.get('/api/treatment-types', TreatmentCatalogController.getAll);

app.get('/api/attention', AttentionController.getRequiredAttention);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
