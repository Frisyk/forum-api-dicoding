const GetDetailsThreadUseCase = require('../GetDetailsThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailsThread = require('../../../Domains/threads/entities/DetailsThread');
const DetailsComment = require('../../../Domains/comments/entities/DetailsComment');
const DetailsReply = require('../../../Domains/replies/entities/DetailsReply');

describe('GetDetailsThreadUseCase', () => {
  it('should orchestrate the get thread details action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThreadDetails = {
      id: 'thread-123',
      title: 'First Thread',
      body: 'Lorem ipsum dolor sir amet',
      date: '2025-01-01T00:00:00.000Z',
      username: 'Llyod',
    };

    const mockThreadComments = [
      {
        id: 'comment-123',
        content: 'what a good thread!',
        date: '2025-01-02T00:00:00.000Z',
        username: 'javier',
        is_delete: false,
      },
      {
        id: 'comment-124',
        content: 'thats crazy bro!',
        date: '2025-01-03T00:00:00.000Z',
        username: 'magentano',
        is_delete: true,
      },
    ];

    const mockCommentsReplies = [
      {
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'Nah, bro!',
        date: '2025-01-04T00:00:00.000Z',
        username: 'Zach',
        is_delete: false,
        owner: 'user-1245'
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Mocking
    mockThreadRepository.getThreadDetailsById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'First Thread',
        body: 'Lorem ipsum dolor sir amet',
        date: '2025-01-01T00:00:00.000Z',
        username: 'Llyod',
      }));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          content: 'what a good thread!',
          date: '2025-01-02T00:00:00.000Z',
          username: 'javier',
          is_delete: false,
        },
        {
          id: 'comment-124',
          content: 'thats crazy bro!',
          date: '2025-01-03T00:00:00.000Z',
          username: 'magentano',
          is_delete: true,
        },
      ]));

    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-123',
          comment_id: 'comment-123',
          content: 'Nah, bro!',
          date: '2025-01-04T00:00:00.000Z',
          username: 'Zach',
          is_delete: false,
          owner: 'user-1245',
        },
      ]));

    // Create use case instance
    const getDetailsThreadUseCase = new GetDetailsThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Expected Result
    const expectedDetailsThread = new DetailsThread({
      ...mockThreadDetails,
      comments: [
        new DetailsComment({
          ...mockThreadComments[0],
          replies: [
            new DetailsReply({
              ...mockCommentsReplies[0],
            }),
          ],
        }),
        new DetailsComment({
          ...mockThreadComments[1],
          replies: [],
        }),
      ],
    });
    
    // Action
    const result = await getDetailsThreadUseCase.execute(threadId);
    
    // Assert
    expect(mockThreadRepository.getThreadDetailsById)
      .toBeCalledWith(threadId);

    expect(mockCommentRepository.getCommentsByThreadId)
      .toBeCalledWith(threadId);

    expect(mockReplyRepository.getRepliesByThreadId)
      .toBeCalledWith(threadId);

    expect(result).toStrictEqual(expectedDetailsThread);
  });
});


