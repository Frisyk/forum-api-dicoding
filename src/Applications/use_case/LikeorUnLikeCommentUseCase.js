const Like = require('../../Domains/likes/entities/Like');

class LikeorUnLikeCommentUseCase {
  constructor({
    likeRepository,
    commentRepository,
    threadRepository,
  }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCaseParams) {
    const { threadId, commentId } = useCaseParams;
    await this._threadRepository.checkThreadAvailability(threadId);
    await this._commentRepository.checkCommentAvailability(threadId, commentId);

    const like = new Like({
      commentId,
      owner: userId,
    });

    const isCommentLiked = await this._likeRepository.verifyUserLike(like);

    return await isCommentLiked
      ? this._likeRepository.deleteLike(like)
      : this._likeRepository.addLike(like);
  }
}

module.exports = LikeorUnLikeCommentUseCase;