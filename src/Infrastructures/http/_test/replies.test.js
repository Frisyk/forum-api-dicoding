const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  let server;

  beforeEach(async () => {
    server = await createServer(container);
  });
  
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and added reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is a reply',
      };

      const serverTestHelper = new ServerTestHelper(server);

      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Add thread, and comment

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
    });

    it('should response 400 if payload does not contain content', async () => {
      // Arrange
      const requestPayload = {};
      const userId = 'user-123'
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const serverTestHelper = new ServerTestHelper(server);
      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();
      await UsersTableTestHelper.addUser({id: userId})
      await ThreadsTableTestHelper.addThread({id: threadId, owner: userId})
      await CommentsTableTestHelper.addComment({id: commentId, owner: userId, threadId: threadId})

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('gagal menambahkan balasan karena kurangnya properti yang dibutuhkan');
    });

    it('should response 401 if headers not contain access token', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is a reply',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and success when reply is deleted', async () => {
      // Arrange
      const serverTestHelper = new ServerTestHelper(server);

      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
  
      // thread, comment, and reply

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({ id: replyId, content: 'This is a reply', commentId, owner: userId });
  
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });      
  
      // Assert
      expect(response.statusCode).toEqual(200);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('success');
    });
  
    it('should response 404 if reply does not exist', async () => {
      // Arrange
      const serverTestHelper = new ServerTestHelper(server);
  
      const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
  
      // Add thread, and comment      
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
  
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak ada balasan');
    });
  });
});


  