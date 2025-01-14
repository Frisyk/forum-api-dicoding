const AddCommentReplyUseCase = require('../../../../Applications/use_case/AddCommentReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteCommentReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
  }

  async postCommentReplyHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    
    const addReplyUseCase = this._container.getInstance(AddCommentReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute(userId, threadId, commentId, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute(userId, threadId, commentId, replyId);

    return { status: 'success' };
  }
}

module.exports = RepliesHandler;