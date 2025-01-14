const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailsThreadUseCase = require('../../../../Applications/use_case/GetDetailsThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(userId, request.payload);
    
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getDetailsThreadHandler(request) {
    const { threadId } = request.params;
    const getDetailsThreadUseCase = this._container.getInstance(GetDetailsThreadUseCase.name);
    const thread = await getDetailsThreadUseCase.execute(threadId);

    return {
      status: 'success',
      data: {
        thread,
      },
    };
  }
}

module.exports = ThreadsHandler;
