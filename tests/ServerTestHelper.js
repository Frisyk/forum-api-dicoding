/* istanbul ignore file */
class ServerTestHelper {
    constructor(server) {
      this._server = server;
    }
  
    async getAccessTokenAndUserId(payload = {
      username: 'Llyod',
      password: 'apaitupassword',
      fullname: 'Llyod Frontera',
    }) {
      const registerResponse = await this._server.inject({
        method: 'POST',
        url: '/users',
        payload,
      });
  
      const loginResponse = await this._server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: payload.username,
          password: payload.password,
        },
      });      
  
      return {
        accessToken: JSON.parse(loginResponse.payload).data.accessToken,
        userId: JSON.parse(registerResponse.payload).data.addedUser.id, 
      };
    }
  }
  
  module.exports = ServerTestHelper;