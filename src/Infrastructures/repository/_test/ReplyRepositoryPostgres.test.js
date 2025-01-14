const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../../Infrastructures/database/postgres/pool');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist a new reply and return added reply correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyPayload = { content: 'nah bro!' };

      // Tambahkan user, thread, dan comment terlebih dahulu
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const fakeIdGenerator = () => '123'; // Stub ID generator
      const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepository.addReply(userId, commentId, replyPayload);

      // Assert
      const persistedReply = await RepliesTableTestHelper.getReplyById('reply-123');
      expect(persistedReply).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'nah bro!',
        owner: userId,
      }));
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return replies for the given comment id', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      // Tambahkan user, thread, dan comment terlebih dahulu
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'First Reply',
        commentId,
        owner: userId,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepository.getRepliesByCommentId(commentId);      

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toBe(replyId);
      expect(replies[0].username).toBe('dicoding');
      expect(replies[0].is_delete).toBe(false);
      expect(replies[0].content).toBe('First Reply');
      expect(replies[0].date).toBeTruthy();
      expect(replies[1]).toBeUndefined();
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return replies for the given thread id', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId1 = 'comment-123';
      const commentId2 = 'comment-124';
      const replyId1 = 'reply-1234';
      const replyId2 = 'reply-1244';

      // Tambahkan user, thread, dan comments terlebih dahulu
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId1, threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId2, threadId, owner: userId });

      // Tambahkan replies
      await RepliesTableTestHelper.addReply({
        id: replyId1,
        content: 'First Reply',
        date: '11-1-2025',
        commentId: commentId1,
        owner: userId,
      });

      await RepliesTableTestHelper.addReply({
        id: replyId2,
        content: 'Second Reply',
        date: '11-1-2025',
        commentId: commentId1,
        owner: userId,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepository.getRepliesByThreadId(threadId);      

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toBe(replyId1);
      expect(replies[1].id).toBe(replyId2);
      expect(replies[0].comment_id).toBe(commentId1);
      expect(replies[1].comment_id).toBe(commentId1);
      expect(replies[0].username).toBe('dicoding');
      expect(replies[1].username).toBe('dicoding');
      expect(replies[0].owner).toBe(userId);
      expect(replies[1].owner).toBe(userId);
      expect(replies[0].is_delete).toBe(false);
      expect(replies[1].is_delete).toBe(false);
      expect(replies[0].content).toBe('First Reply');
      expect(replies[1].content).toBe('Second Reply');
      expect(replies[0].date).toBeTruthy();
      expect(replies[1].date).toBeTruthy();
      expect(replies[2]).toBeUndefined();
    });
  });

  describe('deleteReply function', () => {
    it('should mark the reply as deleted', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      // Tambahkan user, thread, comment, dan reply terlebih dahulu
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId });

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepository.deleteReply(replyId);

      // Assert
      const deletedReply = await RepliesTableTestHelper.getReplyById(replyId);
      expect(deletedReply[0].is_delete).toBe(true);
    });
  });

  describe('checkReplyAvailability function', () => {
    it('should throw NotFoundError when reply does not exist', async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.checkReplyAvailability('reply-123', 'comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply does not belong to the comment', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId1 = 'comment-123';
      const commentId2 = 'comment-124';
      const replyId = 'reply-123';

      // Tambahkan user, thread, dan comments terlebih dahulu
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId1, threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId2, threadId, owner: userId });

      // Tambahkan reply ke commentId1
      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'nah bro!',
        commentId: commentId1,
        owner: userId,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.checkReplyAvailability(replyId, commentId2))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply is deleted', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      // Tambahkan user, thread, comment, dan reply terlebih dahulu
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'nah bro!',
        commentId,
        owner: userId,
        isDelete: true,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.checkReplyAvailability(replyId, commentId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply is available and belongs to the comment', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      // Tambahkan user, thread, comment, dan reply terlebih dahulu
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'nah bro!',
        commentId,
        owner: userId,
        isDelete: false,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.checkReplyAvailability(replyId, commentId))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when the user is not the owner', async () => {
      // Arrange
      const userId = 'user-123';
      const otherUserId = 'user-456';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      // Tambahkan user, thread, comment, dan reply terlebih dahulu
      await UsersTableTestHelper.addUser({ id: userId });
      await UsersTableTestHelper.addUser({ id: otherUserId, username: 'Llyod' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'nah bro!',
        commentId,
        owner: userId,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.verifyReplyOwner(replyId, otherUserId))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error when the user is the owner', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      // Tambahkan user, thread, comment, dan reply terlebih dahulu
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'nah bro!',
        commentId,
        owner: userId,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.verifyReplyOwner(replyId, userId))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });
});
