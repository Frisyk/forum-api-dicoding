const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const Like = require('../../../Domains/likes/entities/Like');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const userId = 'user-123';

  const thread = {
    id: 'thread-123',
    title: 'First Thread',
    body: 'Lorem Ipsum dolor sir amet',
    date: new Date().toISOString(),
  };

  const comment = {
    id: 'comment-123',
    content: 'what a content!',
    date: new Date().toISOString(),
    thread: thread.id,
    isDelete: false,
  };

  describe('addLike', () => {
    it('should add a like to the database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });

      const newLike = new Like({ commentId: comment.id, owner: userId });

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await likeRepositoryPostgres.addLike(newLike);

      // Assert
      const likes = await LikesTableTestHelper.getLikeByCommentIdAndUserId(
        comment.id,
        userId,
      );
      expect(likes[0]).toStrictEqual({
        id: 'like-123',
        comment_id: 'comment-123',
        owner: 'user-123',
      });
    });
  });

  describe('verifyUserLike', () => {
    it('should return true if a user has liked a comment', async () => {
      // Arrange
      const like = new Like({
        commentId: comment.id,
        owner: userId,
      });

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });
      await LikesTableTestHelper.addLike({ id: 'like-123', ...like });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLiked = await likeRepositoryPostgres.verifyUserLike(like);

      // Assert
      expect(isLiked).toBe(true);
    });

    it('should return false if a user has not liked a comment', async () => {
      // Arrange
      const like = new Like({
        commentId: comment.id,
        owner: userId,
      });

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLiked = await likeRepositoryPostgres.verifyUserLike(like);

      // Assert
      expect(isLiked).toBe(false);
    });
  });

  describe('getLikesByThreadId', () => {
    it('should return the likes for a thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, id: 'other-comment', owner: userId });
      // add likes
      await LikesTableTestHelper.addLike({
        id: 'like-1',
        commentId: comment.id,
        owner: userId,
      });
      await LikesTableTestHelper.addLike({
        id: 'like-2',
        commentId: 'other-comment',
        owner: userId,
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const threadLikes = await likeRepositoryPostgres.getLikesByThreadId(thread.id);

      // Assert
      expect(threadLikes).toHaveLength(2);
      expect(threadLikes[0].id).toStrictEqual('like-1');
      expect(threadLikes[0].comment_id).toStrictEqual(comment.id);
      expect(threadLikes[1].id).toStrictEqual('like-2');
      expect(threadLikes[1].comment_id).toStrictEqual('other-comment');
    });
  });

  describe('deleteLike', () => {
    it('should delete a like from the database', async () => {
      // Arrange
      const like = new Like({
        commentId: comment.id,
        owner: userId,
      });

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });
      await LikesTableTestHelper.addLike({ id: 'like-123', ...like });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.deleteLike(like);

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
    });
  });
});