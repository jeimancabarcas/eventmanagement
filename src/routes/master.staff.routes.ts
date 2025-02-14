import express from 'express';
import { CreateMasterStaff, DeleteMasterStaff, GetAllMasterLogistics, GetByIdMasterStaff, UpdateMasterStaff } from '../controllers/master.staff.controller';

export const MasterStaffRoutes = express.Router();

const prefix = '/api/v1/masterstaff';
MasterStaffRoutes.post(`${prefix}/create/`, CreateMasterStaff);
MasterStaffRoutes.get(`${prefix}/getall`, GetAllMasterLogistics);
MasterStaffRoutes.put(`${prefix}/update/:id`, UpdateMasterStaff);
MasterStaffRoutes.get(`${prefix}/getById`, GetByIdMasterStaff);
MasterStaffRoutes.delete(`${prefix}/delete/:id`, DeleteMasterStaff);