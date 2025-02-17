
import express, { Request, Response } from 'express'
import { GetStaffDashboard, GetStats, GetUsersWithoutActiveEvents } from '../controllers/dashboard.controller';
export const DashboardRoutes = express.Router();

const prefix = '/api/v1/dashboard';
DashboardRoutes.get(`${prefix}/stats`, GetStats);
DashboardRoutes.get(`${prefix}/usersWithoutActiveEvents`, GetUsersWithoutActiveEvents);

DashboardRoutes.get(`${prefix}/staffDashboard`, GetStaffDashboard);

