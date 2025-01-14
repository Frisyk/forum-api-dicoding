const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  let server;

  beforeEach(async () => {
    server = await createServer(container);
  });
  
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and added thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'First Thread',
        body: 'Lorem Ipsum dolor sit amet',
      };
      const serverTestHelper = new ServerTestHelper(server);

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();      

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });

    it('should response 400 if thread payload not contain needed property', async () => {
      // Arrange
      const requestPayload = { title: 'First Thread' };

      const serverTestHelper = new ServerTestHelper(server);

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('gagal menambahkan thread karena kurangnya properti yang dibutuhkan');
    });

    it('should response 400 if thread payload wrong data type', async () => {
      // Arrange
      const requestPayload = {
        title: 1122,
        body: 'Lorem Ipsum dolor sit amet',
      };

      const serverTestHelper = new ServerTestHelper(server);

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('gagal menambahkan thread karena tipe data tidak sesuai');
    });

    it('should response 401 if headers not contain access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'First Thread',
        body: 'Lorem Ipsum dolor sit amet',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and thread detail', async () => {
      // Arrange
      const thread = {
        id: 'thread-123',
        title: 'First Thread',
        body: 'Lorem ipsum dolor sir amet',
        date: new Date().toISOString(),
      };

      // add user
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      // add thread
      await ThreadsTableTestHelper.addThread({ ...thread, owner: 'user-123' });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${thread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeTruthy();
      expect(responseJson.data.thread.id).toStrictEqual(thread.id);
      expect(responseJson.data.thread.title).toStrictEqual(thread.title);
      expect(responseJson.data.thread.body).toStrictEqual(thread.body);
    });

    it('should response 404 if thread is not exist', async () => {
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-789',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});