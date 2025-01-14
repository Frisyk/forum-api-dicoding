const DetailsComment = require('../../Domains/comments/entities/DetailsComment');
const DetailsReply = require('../../Domains/replies/entities/DetailsReply');
const DetailsThread = require('../../Domains/threads/entities/DetailsThread');

class GetDetailsThreadUseCase{
    constructor({
        threadRepository,
        commentRepository,
        replyRepository,
    }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }

    async execute(threadId) {
        const threadDetails = await this._threadRepository.getThreadDetailsById(threadId);
        const threadComments = await this._commentRepository.getCommentsByThreadId(threadId);
        const commentsReplies = await this._replyRepository.getRepliesByThreadId(threadId);
    
        threadDetails.comments = threadComments.map((comment) => new DetailsComment({
          ...comment,
          replies: comment.is_delete
            ? []
            : commentsReplies
                .filter((reply) => reply.comment_id === comment.id)
                .map((reply) => new DetailsReply(reply)),
        }));
    
        return new DetailsThread(threadDetails);
      }
}

module.exports = GetDetailsThreadUseCase;