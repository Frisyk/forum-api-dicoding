class DeleteCommentUseCase {
    constructor({
        threadRepository,
        commentRepository,
    }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
    }
  
    async execute(userId, threadId, commentId) {
      await this._threadRepository.checkThreadAvailability(threadId);
      await this._commentRepository.checkCommentAvailability(threadId, commentId);
      await this._commentRepository.verifyCommentOwner(commentId, userId);
  
      return this._commentRepository.deleteComment(commentId);
    }
  }
  
  module.exports = DeleteCommentUseCase;