const LikeRepository = require('../../../Domains/likes/LikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const Like = require('../../../Domains/likes/entities/Like');
const LikeOrUnLikeCommentUseCase = require('../LikeorUnLikeCommentUseCase');

describe('LikeOrLikeCommentUseCase', () => {
  it('should orchestrating the like comment action correctly if comment is not liked', async () => {
    // Arrange
    const like = new Like({
      commentId: 'comment-123',
      owner: 'user-123',
    });

    // creating dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    // mocking needed function
    mockThreadRepository.checkThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyUserLike = jest.fn(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());

    // creating use case instance
    const likeOrUnLikeCommentUseCase = new LikeOrUnLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeOrUnLikeCommentUseCase.execute(
      'user-123',
      {
        threadId: 'thread-123',
        commentId: 'comment-123',
      },
    );

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith('thread-123', 'comment-123');
    expect(mockLikeRepository.verifyUserLike).toBeCalledWith(like);
    expect(mockLikeRepository.addLike).toBeCalledWith(like);
  });

  it('should orchestrating the unlike comment action correctly if comment is liked', async () => {
    // Arrange
    const like = new Like({
      commentId: 'comment-123',
      owner: 'user-123',
    });

    // creating dependency of use case 
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    // mocking needed function 
    mockThreadRepository.checkThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyUserLike = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve());

    // creating use case instance 
    const likeOrLikeCommentUseCase = new LikeOrUnLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeOrLikeCommentUseCase.execute(
      'user-123',
      {
        threadId: 'thread-123',
        commentId: 'comment-123',
      },
    );

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith('thread-123', 'comment-123');
    expect(mockLikeRepository.verifyUserLike).toBeCalledWith(like);
    expect(mockLikeRepository.deleteLike).toBeCalledWith(like);
  });
});