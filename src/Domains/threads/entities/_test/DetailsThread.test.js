const DetailsThread = require('../DetailsThread');

describe('DetailsThread entities', () => {
  it('should throw error when payload does not contain needed properties', () => {
    // Arrange
    const payload = {
      id: 'thread-j12ojak',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'Llyod Frontera',
    };

    // Action and Assert
    expect(() => new DetailsThread(payload)).toThrowError('DETAILS_THREAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'Llyod Frontera',
      comments: 'not an array',
    };

    // Action and Assert
    expect(() => new DetailsThread(payload)).toThrowError('DETAILS_THREAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailsThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-j12ojak',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'Llyod Frontera',
      comments: [
        {
          id: 'comment-elkaka',
          username: 'javier',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
        },
      ],
    };

    // Action
    const detailsThread = new DetailsThread(payload);

    // Assert
    expect(detailsThread).toBeInstanceOf(DetailsThread);
    expect(detailsThread.id).toEqual(payload.id);
    expect(detailsThread.title).toEqual(payload.title);
    expect(detailsThread.body).toEqual(payload.body);
    expect(detailsThread.date).toEqual(payload.date);
    expect(detailsThread.username).toEqual(payload.username);
    expect(detailsThread.comments).toHaveLength(1);
  });
});
