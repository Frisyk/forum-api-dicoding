const DetailsReply = require('../DetailsReply');

describe('DetailsReply entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'Llyod Frontera',
      content: 'This is a reply',
    };

    // Action and Assert
    expect(() => new DetailsReply(payload)).toThrowError('DETAILS_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    const payload = {
      id: '12', 
      username: 'Llyod Frontera',
      content: 'This is a reply',
      date: 12345,
      is_delete: 'oke'
    };

    // Action and Assert
    expect(() => new DetailsReply(payload)).toThrowError('DETAILS_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailsReply object correctly when not deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'Llyod Frontera',
      content: 'This is a reply',
      date: '2021-08-08T07:19:09.775Z',
      is_delete: false
    };

    // Action
    const detailsReply = new DetailsReply(payload);

    // Assert
    expect(detailsReply).toBeInstanceOf(DetailsReply);
    expect(detailsReply.id).toEqual(payload.id);
    expect(detailsReply.username).toEqual(payload.username);
    expect(detailsReply.content).toEqual(payload.content);
    expect(detailsReply.date).toEqual(payload.date);
  });

  it('should set content to "**komentar telah dihapus**" if reply is deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'Llyod Frontera',
      content: 'This is a reply',
      date: '2021-08-08T07:19:09.775Z',
      is_delete: true, 
    };

    // Action
    const detailsReply = new DetailsReply(payload);

    // Assert
    expect(detailsReply.content).toEqual('**komentar telah dihapus**');
  });
});
