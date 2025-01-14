const NewComment = require('../NewComment');

describe('NewComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123, // invalid type
    };

    // Action and Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'This is a new comment',
    };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment).toBeInstanceOf(NewComment);
    expect(newComment.content).toEqual(payload.content);
  });
});
