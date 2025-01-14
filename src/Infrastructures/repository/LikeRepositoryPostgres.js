const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(like) {
    const id = `like-${this._idGenerator()}`;
    const { commentId, owner } = like;

    const query = {
      text: 'INSERT INTO likes (id, comment_id, owner) VALUES ($1, $2, $3)',
      values: [id, commentId, owner],
    };

    await this._pool.query(query);
  }

  async deleteLike(like) {
    const { commentId, owner } = like;

    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }

  async getLikesByThreadId(threadId) {
    const query = {
      text: `SELECT likes.* FROM likes 
      LEFT JOIN comments ON comments.id = likes.comment_id
      WHERE comments.thread_id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async verifyUserLike(like) {
    const { commentId, owner } = like;

    const query = {
      text: 'SELECT 1 FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    return !!result.rowCount;
  }
}

module.exports = LikeRepositoryPostgres;