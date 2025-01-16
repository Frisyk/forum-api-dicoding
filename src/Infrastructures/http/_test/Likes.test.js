const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/likes endpoint', () => {
  let server;

  beforeEach(async () => {
    server = await createServer(container);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    const thread = {
      id: 'thread-123',
      title: 'A New Thread',
      body: 'Thread body',
      date: new Date().toISOString(),
    };

    const comment = {
      id: 'comment-123',
      content: 'A comment',
      date: new Date().toISOString(),
      thread: thread.id,
      isDelete: false,
    };

    it('should response 200 and like the comment', async () => {
      const serverTestHelper = new ServerTestHelper(server);
  
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${comment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await LikesTableTestHelper.getLikeByCommentIdAndUserId(
        comment.id,
        userId,
      );
      expect(likes).toHaveLength(1);
    });

    it('should response 200 and unlike the comment when already liked', async () => {
      const serverTestHelper = new ServerTestHelper(server);
  
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });
      await LikesTableTestHelper.addLike({ commentId: comment.id, owner: userId });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${comment.id}/likes`,
        headers: { Authorization: `${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await LikesTableTestHelper.getLikeByCommentIdAndUserId(
        comment.id,
        userId,
      );
      expect(likes).toHaveLength(0);
    });

    it('should response 404 when the comment does not exist in the thread', async () => {
      const serverTestHelper = new ServerTestHelper(server);
  
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/nonexistent-thread/comments/${comment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when the comment is deleted', async () => {
      const serverTestHelper = new ServerTestHelper(server);
  
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });

      await server.inject({
        method: 'DELETE',
        url: `/threads/${thread.id}/comments/${comment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${comment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar telah dihapus');
    });

    it('should response 401 when authorization is missing', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      expect(response.statusCode).toEqual(401);
    });
  });
});
