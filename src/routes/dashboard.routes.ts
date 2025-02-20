
import express, { Request, Response } from 'express'
import { GetStaffDashboard, GetStats, GetUsersWithoutActiveEvents } from '../controllers/dashboard.controller';
import { checkRole, verifyToken } from '../middlewares/authorization'
export const DashboardRoutes = express.Router();

const prefix = '/api/v1/dashboard';
DashboardRoutes.get(`${prefix}/stats`, verifyToken, checkRole(["ADMIN"]), GetStats);
DashboardRoutes.get(`${prefix}/usersWithoutActiveEvents`,verifyToken, checkRole(["ADMIN"]), GetUsersWithoutActiveEvents);

DashboardRoutes.get(`${prefix}/staffDashboard`, verifyToken, checkRole(["ADMIN", "STAFF"]), GetStaffDashboard);

