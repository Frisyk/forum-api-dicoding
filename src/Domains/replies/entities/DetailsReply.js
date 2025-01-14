class DetailsReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, content, date, is_delete,
    } = payload;

    this.id = id;
    this.content = is_delete ? '**balasan telah dihapus**' : content;
    this.username = username;
    this.date = date;
  }

  _verifyPayload(payload) {
    const {
      id,
      username,
      content,
      date,
      is_delete
    } = payload;

    if (!id || !username || !content || !date) {
      throw new Error('DETAILS_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || (typeof date !== 'string' && typeof date !== 'object')
      || typeof is_delete !== 'boolean'
    ) {
      throw new Error('DETAILS_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailsReply;
