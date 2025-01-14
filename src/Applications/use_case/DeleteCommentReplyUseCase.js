class DeleteCommentReplyUseCase {
    constructor({
        replyRepository,
        commentRepository,
        threadRepository,
      }) {
        this._replyRepository = replyRepository;
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
      }
    
      async execute(userId, threadId, commentId, replyId) {
        await this._threadRepository.checkThreadAvailability(threadId);
        await this._commentRepository.checkCommentAvailability(threadId, commentId);
        await this._replyRepository.checkReplyAvailability(replyId, commentId);
        await this._replyRepository.verifyReplyOwner(replyId, userId);
    
        return this._replyRepository.deleteReply(replyId);
      }
  }
  
  module.exports = DeleteCommentReplyUseCase;
