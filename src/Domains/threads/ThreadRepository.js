class ThreadRepository {
    async addThread(userId, thread) {
      throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
    async getThreadDetailsById(threadId) {
      throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
    async checkThreadAvailability(threadId) {
      throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
  }
  
  module.exports = ThreadRepository;