
import express, { Request, Response } from 'express'
import { GetStaffDashboard, GetStats, GetUsersWithoutActiveEvents } from '../controllers/dashboard.controller';
import { verifyToken } from '../middlewares/authorization'
export const DashboardRoutes = express.Router();

const prefix = '/api/v1/dashboard';
DashboardRoutes.get(`${prefix}/stats`,verifyToken, GetStats);
DashboardRoutes.get(`${prefix}/usersWithoutActiveEvents`,verifyToken, GetUsersWithoutActiveEvents);

DashboardRoutes.get(`${prefix}/staffDashboard`, verifyToken, GetStaffDashboard);

