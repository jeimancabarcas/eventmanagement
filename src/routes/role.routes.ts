import express from 'express';
import { CreateRole, DeleteRole, GetAllRoles, GetByIdRole, UpdateRole } from '../controllers/role.controller';


export const RoleRoutes = express.Router();

const prefix = '/api/v1/roles';
RoleRoutes.post(`${prefix}/create`, CreateRole);
RoleRoutes.get(`${prefix}/getall`, GetAllRoles);
RoleRoutes.put(`${prefix}/update/:id`, UpdateRole);
RoleRoutes.get(`${prefix}/getById/:id`, GetByIdRole);
RoleRoutes.delete(`${prefix}/delete/:id`, DeleteRole);