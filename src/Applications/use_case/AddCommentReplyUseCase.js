const NewReply = require('../../Domains/replies/entities/NewReply');

class AddCommentReplyUseCase {
  constructor({
    replyRepository,
    threadRepository,
    commentRepository
  }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(userId, threadId, commentId, useCasePayload) { 
    await this._threadRepository.checkThreadAvailability(threadId);
    await this._commentRepository.checkCommentAvailability(threadId, commentId);
    const newReply = new NewReply(useCasePayload)

    return this._replyRepository.addReply(userId, commentId, newReply);
  }
}

module.exports = AddCommentReplyUseCase;