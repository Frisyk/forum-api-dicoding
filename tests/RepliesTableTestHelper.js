/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
    async addReply({
        id = 'reply-123',
        content = 'First Reply',
        date = new Date().toISOString(),
        commentId = 'comment-123',
        owner = 'user-123',
        isDelete = false
      }) {
        const query = {
          text: 'INSERT INTO replies (id, content, date, comment_id, owner, is_delete) VALUES ($1, $2, $3, $4, $5, $6)',
          values: [id, content, date, commentId, owner, isDelete],
        };
    
        await pool.query(query);
      },

  async getReplyById(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
