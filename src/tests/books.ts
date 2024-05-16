import { Request, Response } from 'express';
import { BookController } from '../controllers/index';
import { AppDataSource } from '../data-source';
import { Book } from '../entity/Book';
import { User } from '../entity/User';
import jest from 'jest';


jest.mock('../data-source');

describe('BookController', () => {
  describe('getAll', () => {
    it('should return all books', async () => {
      const req = { query: { page: 1 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const totalCount = 10;
      const books = Array(totalCount).fill(new Book());
      jest.spyOn(AppDataSource.getRepository(Book), 'createQueryBuilder').mockReturnValue({
        getCount: jest.fn().mockResolvedValue(totalCount),
        getMany: jest.fn().mockResolvedValue(books),
      } as any);

      await BookController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        books, 
        total: totalCount,
        page: 1,
        lastPage: 1,
      });
    });

    it('should handle errors', async () => {
      const req = { query: { page: 1 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource.getRepository(Book), 'createQueryBuilder').mockRejectedValue(new Error('Database error'));

      await BookController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'internal server error' });
    });
  });

  describe('get', () => {
    it('should return a book by ID', async () => {
      const req = { params: { bookID: 1 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const book = new Book();
      jest.spyOn(AppDataSource.getRepository(Book), 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(book),
      } as any);

      await BookController.get(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(book);
    });

    it('should handle book not found', async () => {
      const req = { params: { bookID: 1 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource.getRepository(Book), 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      } as any);

      await BookController.get(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ detail: 'Book not found' });
    });

    it('should handle internal server errors', async () => {
      const req = { params: { bookID: 1 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource.getRepository(Book), 'createQueryBuilder').mockRejectedValue(new Error('Database error'));

      await BookController.get(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'internal server error' });
    });
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const req = { 
        body: {
          name: 'Book Name',
          description: 'Book Description',
          price: '10.99',
          contactId: 1,
          categoryNames: ['Fiction'],
          images: ['image1.jpg']
        },
        user: { id: 1 }
      } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({ findOne: jest.fn().mockResolvedValueOnce(new User()), count: jest.fn().mockResolvedValue(0), save: jest.fn() } as any);

      await BookController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle book creation errors', async () => {
      const req = { body: {}, user: { id: 1 } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({ findOne: jest.fn().mockRejectedValue(new Error('Database error')) } as any);

      await BookController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith('Internal server error');
    });
  });

  describe('upload', () => {
    it('should upload book images', async () => {
      const req = { files: { images: [{ name: 'image1.jpg', mv: jest.fn() }] } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({} as any);

      await BookController.upload(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle image upload errors', async () => {
      const req = { files: { images: [{ name: 'image1.jpg', mv: jest.fn().mockRejectedValue(new Error('Upload error')) }] } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;

      await BookController.upload(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Internal Server Error');
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const req = { 
        params: { bookID: 1 },
        body: {
          name: 'New Book Name',
          description: 'New Book Description',
          price: '20.99',
          contactId: 2,
          categoryNames: ['Non-fiction'],
          images: ['newimage.jpg']
        },
        user: { id: 1 }
      } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({ findOne: jest.fn().mockResolvedValueOnce(new Book()), save: jest.fn() } as any);

      await BookController.update(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle book update errors', async () => {
      const req = { params: { bookID: 1 }, body: {}, user: { id: 1 } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({ findOne: jest.fn().mockRejectedValue(new Error('Database error')) } as any);

      await BookController.update(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith('Internal server error');
    });
  });

  describe('delete', () => {
    it('should delete a book', async () => {
      const req = { params: { bookID: 1 }, user: { id: 1 } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({ findOne: jest.fn().mockResolvedValueOnce(new Book()), save: jest.fn() } as any);

      await BookController.delete(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('should handle book deletion errors', async () => {
      const req = { params: { bookID: 1 }, user: { id: 1 } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({ findOne: jest.fn().mockRejectedValue(new Error('Database error')) } as any);

      await BookController.delete(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith('Internal server error');
    });
  });

  describe('getMyBooks', () => {
    it('should return books of the current user', async () => {
      const req = { user: { id: 1 }, query: { page: 1 } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const totalCount = 5;
      const books = Array(totalCount).fill(new Book());
      jest.spyOn(AppDataSource.getRepository(Book), 'createQueryBuilder').mockReturnValue({
        getCount: jest.fn().mockResolvedValue(totalCount),
        getMany: jest.fn().mockResolvedValue(books),
      } as any);

      await BookController.getMyBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        books,
        total: totalCount,
        page: 1,
        lastPage: 1,
      });
    });

    it('should handle errors', async () => {
      const req = { user: { id: 1 }, query: { page: 1 } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource.getRepository(Book), 'createQueryBuilder').mockRejectedValue(new Error('Database error'));

      await BookController.getMyBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'internal server error' });
    });
  });

  describe('sold', () => {
    it('should mark a book as sold', async () => {
      const req = { params: { bookID: 1 }, user: { id: 1 } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({ findOne: jest.fn().mockResolvedValueOnce(new Book()), save: jest.fn() } as any);

      await BookController.sold(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('should handle book sold errors', async () => {
      const req = { params: { bookID: 1 }, user: { id: 1 } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({ findOne: jest.fn().mockRejectedValue(new Error('Database error')) } as any);

      await BookController.sold(req, res, jest.fn() as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith('Internal server error');
    });
  });
});
