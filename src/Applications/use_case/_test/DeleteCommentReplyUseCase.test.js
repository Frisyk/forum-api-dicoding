const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteCommentReplyUseCase = require('../DeleteCommentReplyUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const threadId = 'thread-123'
    const commentId = 'comment-123'
    const replyId = 'reply-123'

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockReplyRepository = new ReplyRepository()

    // Mocking
    mockThreadRepository.checkThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.checkReplyAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteCommentReplyUseCase ({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository
    });

    // Action
    await deleteReplyUseCase.execute(userId, threadId, commentId, replyId);

    // Assert

    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(threadId);
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith(threadId, commentId);
    expect(mockReplyRepository.checkReplyAvailability).toBeCalledWith(replyId, commentId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(replyId, userId);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(replyId)
  });
});
