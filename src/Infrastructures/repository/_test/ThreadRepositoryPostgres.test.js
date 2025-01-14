const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const newThread = new NewThread({
        title: 'First Thread',
        body: 'Lorem ipsum dolor sir amet.',
      });
      await UsersTableTestHelper.addUser({ id: userId, username: 'Llyod Frontera' });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(userId, newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.getThreadDetailsById('thread-123');
      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: newThread.title,
        owner: userId,
      }));
    });
  });

  describe('getThreadDetailsById function', () => {
    it('should return thread details when thread exists', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'Llyod Frontera' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'Thread Title',
        body: 'Lorem ipsum dolor sir amet',
        date: new Date().toISOString(),
        owner: userId,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threadDetails = await threadRepositoryPostgres.getThreadDetailsById(threadId);

      // Assert
      expect(threadDetails).toEqual({
        id: threadId,
        title: 'Thread Title',
        body: 'Lorem ipsum dolor sir amet',
        date: expect.any(String),
        username: 'Llyod Frontera',
      });
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadDetailsById('nonexistent-thread'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('checkThreadAvailability function', () => {
    it('should not throw NotFoundError when thread exists', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({ id: userId });

      // Add a thread
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkThreadAvailability(threadId))
        .resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkThreadAvailability('nonexistent-thread'))
        .rejects.toThrowError(NotFoundError);
    });
  });
});
