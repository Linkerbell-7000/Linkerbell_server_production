const { urls } = require('../../models');
const { classifier } = require('../../modules');
const { checkToken } = require('../../modules');
const extract = require('meta-extractor');
module.exports = {
  post: async (req, res) => {
    try {
      const token_info = checkToken(req);
      const { user_id } = token_info;
      if (user_id === undefined) {
        return res.status(403).send('로그인을 해주세요');
      }
      const category = async function () {
        return classifier(req.body.url);
      };
      const { result, analysis } = await category();
      const ext = await extract({ uri: req.body.url });
      urls
        .findOrCreate({
          where: {
            user_id: user_id,
            url: req.body.url,
          },
          defaults: {
            category_id: result,
            og_title: ext.ogTitle || ext.title || '',
            og_image: ext.ogImage || ext.twitterImage || '',
            og_description:
              ext.ogDescription ||
              ext.description ||
              ext.twitterDescription ||
              '',
          },
        })
        .then(async ([url, created]) => {
          if (!created) {
            return res.status(409).send('이미 존재하는 url입니다.');
          }
          const data = await url.get({ plain: true });
          res.status(201).send({ link_data: { ...data }, analysis: analysis });
        });
    } catch (err) {
      console.log(err);
      return res.status(400).send('bad request');
    }
  },
  delete: (req, res) => {
    try {
      urls
        .destroy({
          where: {
            id: req.params.url_id,
          },
        })
        .then((result) => {
          if (!result) {
            res.status(400).send('bad request');
          }
          res.status(201).send('삭제되었습니다.');
        });
    } catch (err) {
      res.status(400).send('bad request');
    }
  },
};
