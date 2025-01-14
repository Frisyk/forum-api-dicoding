const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../../Infrastructures/database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableHelper');

const userId = 'user-123';
const threadId = 'thread-123';

describe('CommentRepositoryPostgres', () => {

    beforeEach(async () => {
        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
    })

    afterEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

  describe('addComment function', () => {
    it('should persist a new comment and return added comment correctly', async () => {
      // Arrange
      const comment = { content: 'This is a comment' };

      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepository.addComment(userId, threadId, comment);

      // Assert
      const persistedComment = await CommentsTableTestHelper.getCommentById('comment-123');
      expect(persistedComment).toHaveLength(1);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'This is a comment',
        owner: userId,
      }));
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments for the given thread id', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';

      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId, owner: userId });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepository.getCommentsByThreadId(threadId);

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe('comment-123');
      expect(comments[0].username).toBe('dicoding');
      expect(comments[0].content).toBe('First Comment');
      expect(comments[0].date).toBeTruthy();
      expect(comments[1]).toBeUndefined();
    });
  });

  describe('deleteComment function', () => {
    it('should mark the comment as deleted', async () => {
      // Arrange
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepository.deleteComment(commentId);

      // Assert
      const deletedComment = await CommentsTableTestHelper.getCommentById(commentId);
      expect(deletedComment[0].is_delete).toBe(true);
    });
  });

  describe('checkCommentAvailability function', () => {
    it('should throw NotFoundError when comment does not exist', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.checkCommentAvailability('thread-123', 'comment-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment is deleted', async () => {
      // Arrange
      const userId = 'user-12';
      const threadId = 'thread-12';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: userId, username: 'kisanak' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
        isDelete: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.checkCommentAvailability(threadId, commentId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment does not belong to the thread', async () => {
      // Arrange
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: 'thread-456', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId: 'thread-456' });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.checkCommentAvailability('thread-123', commentId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw error when comment is available and belongs to the thread', async () => {
      // Arrange
      const commentId = 'comment-123';
      const threadId = 'thread-123';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.checkCommentAvailability(threadId, commentId))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when the user is not the owner', async () => {
      // Arrange
      const commentId = 'comment-123';
      const ownerId = 'user-123';
      await CommentsTableTestHelper.addComment({ id: commentId, owner: ownerId });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.verifyCommentOwner(commentId, 'user-456'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw error when the user is the owner', async () => {
      // Arrange
      const commentId = 'comment-123';
      const ownerId = 'user-123';
      await CommentsTableTestHelper.addComment({ id: commentId, owner: ownerId });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.verifyCommentOwner(commentId, ownerId))
        .resolves
        .not.toThrowError(AuthorizationError);
    });
  });
});
