const DetailsComment = require('../DetailsComment');

describe('DetailsComment entities', () => {
  it('should throw error when payload does not contain needed properties', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'Llyod Frontera',
      content: 'sebuah komentar',
      // Missing `date`
    };

    // Action and Assert
    expect(() => new DetailsComment(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'Llyod Frontera',
      content: 'sebuah komentar',
      date: 12345, 
      replies: 'invalid', 
      likeCount: 0,
    };

    // Action and Assert
    expect(() => new DetailsComment(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should replace content with "**komentar telah dihapus**" if is_delete is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'Llyod Frontera',
      content: 'sebuah komentar',
      date: '2021-08-08T07:22:33.555Z',
      replies: [],
      likeCount: 0,
      is_delete: true,
    };

    // Action
    const detailsComment = new DetailsComment(payload);

    // Assert
    expect(detailsComment.content).toEqual('**komentar telah dihapus**');
  });

  it('should create DetailsComment object correctly if is_delete is false', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'Llyod Frontera',
      content: 'sebuah komentar',
      date: '2021-08-08T07:22:33.555Z',
      replies: [],
      likeCount: 2,
      is_delete: false,
    };

    // Action
    const detailsComment = new DetailsComment(payload);

    // Assert
    expect(detailsComment).toBeInstanceOf(DetailsComment);
    expect(detailsComment.id).toEqual(payload.id);
    expect(detailsComment.username).toEqual(payload.username);
    expect(detailsComment.content).toEqual(payload.content);
    expect(detailsComment.date).toEqual(payload.date);
    expect(detailsComment.replies).toEqual(payload.replies);
  });
});
