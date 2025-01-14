const LikeOrUnLikeCommentUseCase = require('../../../../Applications/use_case/LikeOrUnLikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;

    const likeOrUnLikeCommentUseCase = this._container.getInstance(
      LikeOrUnLikeCommentUseCase.name,
    );

    await likeOrUnLikeCommentUseCase.execute(userId, request.params);

    const response = h.response({
      status: 'success',
    });

    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;