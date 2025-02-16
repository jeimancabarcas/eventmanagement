
import express, { Request, Response } from 'express'
import { GetStats } from '../controllers/dashboard.controller';
export const DashboardRoutes = express.Router();

const prefix = '/api/v1/dashboard';
DashboardRoutes.get(`${prefix}/stats`, GetStats);

