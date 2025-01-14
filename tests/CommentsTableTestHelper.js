/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
    async addComment({
        id = 'comment-123',
        content = 'First Comment',
        date = new Date().toISOString(),
        threadId = 'thread-123',
        owner = 'user-123',
        isDelete = false
      }) {
        const query = {
          text: 'INSERT INTO comments (id, content, date, thread_id, owner, is_delete) VALUES ($1, $2, $3, $4, $5, $6)',
          values: [id, content, date, threadId, owner, isDelete],
        };
    
        await pool.query(query);
      },

  async getCommentById(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
