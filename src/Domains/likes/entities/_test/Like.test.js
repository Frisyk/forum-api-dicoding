const Like = require('../Like');

describe('Like entity', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      commentId: 'comment-111',
    };

    // Action & Assert
    expect(() => new Like(payload)).toThrowError('LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 111,
      owner: true,
    };

    // Action & Assert
    expect(() => new Like(payload)).toThrowError('LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Like object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action
    const newLike = new Like(payload);

    // Assert
    expect(newLike.commentId).toEqual(payload.commentId);
    expect(newLike.owner).toEqual(payload.owner);
  });
});