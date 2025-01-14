const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddCommentReplyUseCase = require('../AddCommentReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Nah Bro!',
    };

    const userId = 'user-123';
    const threadId = 'thread-123'
    const commentId = 'comment-123'

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: userId,
    });

    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()

    // Mocking
    mockThreadRepository.checkThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));

    const addCommentReplyUseCase = new AddCommentReplyUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository
    });

    // Action
    const addedReply = await addCommentReplyUseCase.execute(userId, threadId, commentId, useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: userId,
    }));

    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(threadId);
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith(threadId, commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(userId, commentId, new NewReply({
      content: useCasePayload.content,
    }));
  });
});
