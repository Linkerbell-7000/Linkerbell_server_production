
const { users } = require('../../models');
const { addToken, checkToken, enToken } = require('../../modules');
const bcrypt = require('bcryptjs');

module.exports = {
  post: (req, res) => {
    if (Object.keys(req.body).length === 0) {
      if (req.cookies.session_id) {
        const token_info = checkToken(req)
        const { user_id } = token_info
        const token = enToken(req.cookies)
        res.status(256).json({ user_id: user_id, token: token })
      } else if (!req.cookies.session_id) {
        res.status(404).end('로그인 해주세요!');
      } else {
        res.status(404).end()
      }
    } else {
      const { email, password } = req.body
      users
        .findOne({
          where: {
            email: email
          }
        })
        .then((result) => {
          if (result === null) {
            res.status(401).send('이메일이 일치하지 않습니다.');
          }
          if (result.password) {
            if (bcrypt.compareSync(password, result.password)) {
              const user_info = addToken(result)
              const token = enToken(user_info)
              req.session.id = result.dataValues.id

              res
                .status(200)
                .cookie('session_id', req.session.id)
                .cookie('token', token)
                .json({
                  user_id: result.dataValues.id,
                  token: token
                })
                .end()
            } else {

              res.status(401).send('비밀번호가 일치하지 않습니다.');
            }
          }
        })
        .catch((err) => {
          res.status(404).send(err)
        })
    }
  }
}
