import { Request, Response } from 'express';
import { UserController } from '../controllers/user';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { ValidationError } from '../exceptions/core';


jest.mock('../data-source');
jest.mock('../queues/email');

describe('UserController', () => {
  describe('all', () => {
    it('should return all users', async () => {
      const req = { query: { search: '', is_email_verified: false, page: 1 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const totalCount = 10;
      const users = Array(totalCount).fill(new User());
      jest.spyOn(AppDataSource.getRepository(User), 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(totalCount),
        getMany: jest.fn().mockResolvedValue(users),
      } as any);

      await UserController.all(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        users,
        total: totalCount,
        page: 1,
        lastPage: 1,
      });
    });

    it('should handle errors', async () => {
      const req = { query: { search: '', is_email_verified: false, page: 1 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource.getRepository(User), 'createQueryBuilder').mockRejectedValue(new Error('Database error'));

      await UserController.all(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'internal server error' });
    });
  });

  describe('get', () => {
    it('should return a user by ID', async () => {
      const req = { params: { userID: 1 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const user = new User();
      jest.spyOn(AppDataSource.getRepository(User), 'findOne').mockResolvedValue(user);

      await UserController.get(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should handle user not found', async () => {
      const req = { params: { userID: 1 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource.getRepository(User), 'findOne').mockResolvedValue(undefined);

      await UserController.get(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'user not found' });
    });

    it('should handle errors', async () => {
      const req = { params: { userID: 1 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource.getRepository(User), 'findOne').mockRejectedValue(new Error('Database error'));

      await UserController.get(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'internal server error' });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const req = { body: { email: 'test@example.com', password1: 'password' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const serializedUserObj = { id: 1, email: 'test@example.com' };
      jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({ findOne: jest.fn().mockResolvedValueOnce(undefined), save: jest.fn().mockResolvedValue(serializedUserObj) } as any);

      await UserController.create(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(serializedUserObj);
    });

    it('should handle validation errors', async () => {
      const req = { body: {} } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const errorMessage = 'Validation error message';
      jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({ findOne: jest.fn().mockResolvedValueOnce(undefined), save: jest.fn().mockRejectedValue(new ValidationError(undefined, errorMessage)) } as any);

      await UserController.create(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });

    it('should handle errors', async () => {
      const req = { body: { email: 'test@example.com', password1: 'password' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource, 'getRepository').mockRejectedValue(new Error('Database error'));

      await UserController.create(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'internal server error' });
    });
  });

  // Additional test cases for update, destroy, confirmEmail, login, getAuthToken, decodeRefreshToken, isRefreshTokenValid, forgotPassword, changePassword, authenticateToken, changeEmail, confirmChangeEmail, requestReconfirmEmail, getProfile, addUserToRequestIfAuthenticated can be added similarly.
});
