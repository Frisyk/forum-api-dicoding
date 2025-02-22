const InvariantError = require('./InvariantError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'NEW_THREAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('gagal menambahkan thread karena tipe data tidak sesuai'),
  'NEW_THREAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('gagal menambahkan thread karena kurangnya properti yang dibutuhkan'),
  'NEW_COMMENT_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('gagal menambahkan komentar karena properti yang dibutuhkan tidak ada'),
  'NEW_REPLY_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('gagal menambahkan balasan karena kurangnya properti yang dibutuhkan'),
  'NEW_REPLY_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('gagal menambahkan reply karena tipe data tidak sesuai'),
  'NEW_COMMENT_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('gagal menambahkan comment karena tipe data tidak sesuai'),
  'DETAILS_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('Data tidak sesuai')
};

module.exports = DomainErrorTranslator;
