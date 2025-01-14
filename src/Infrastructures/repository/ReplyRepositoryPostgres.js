const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(userId, commentId, reply) {
    const { content } = reply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, date, commentId, userId],
    };

    const result = await this._pool.query(query);

    return new AddedReply(result.rows[0]);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
        text: 'SELECT replies.id, users.username, replies.date, replies.content, replies.is_delete FROM replies LEFT JOIN users ON users.id = replies.owner WHERE replies.comment_id = $1 ORDER BY replies.date ASC',
        values: [commentId],
      };
  
      const result = await this._pool.query(query);

      return result.rows;
  }

  async getRepliesByThreadId(threadId) {
    const query = {
        text: `SELECT replies.*, users.username 
        FROM replies LEFT JOIN users ON users.id = replies.owner
        LEFT JOIN comments ON comments.id = replies.comment_id
        WHERE comments.thread_id = $1 AND comments.is_delete = false
        ORDER BY replies.date ASC`,
        values: [threadId],
    };

    const result = await this._pool.query(query);
    
    return result.rows;
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async checkReplyAvailability(replyId, commentId) {
    const query = {
      text: 'SELECT id, comment_id, is_delete FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('tidak ada balasan');
    }

    if (result.rows[0].is_delete) {
        throw new NotFoundError('balasan tidak ditemukan atau telah dihapus');
    }

    if (result.rows[0].comment_id !== commentId) {
      throw new NotFoundError('tidak ditemukan balasan dalam komentar');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    const reply = result.rows[0];

    if (reply.owner !== owner) {
      throw new AuthorizationError('anda tidak memiliki akses');
    }
  }
}

module.exports = ReplyRepositoryPostgres;