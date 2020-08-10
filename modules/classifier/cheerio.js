const cheer = require('cheerio');
const Iconv = require('iconv-lite');
const request = require('request-promise');
const charset = require('charset');
const axios = require('axios');

//* 해당 url의 charset을 받아오는 함수
const getEnc = async (url) => {
  try {
    let enc = await axios.get(url, {
      timeout: 5000,
      maxRedirects: 10,
    });
    return charset(enc.headers, enc.data);
  } catch (err) {
    console.log('findCharset err');
    console.log(err);
    return null;
  }
};

const cheerio = async (url) => {
  try {
    //* 1. 해당 url에 요청을 보냄
    const getHtml = async () => {
      try {
        const userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:69.0) Gecko/20100101 Firefox/69.0';
        return await request.get({
          url: url,
          timeout: 5000,
          maxRedirects: 10,
          encoding: null,
          headers: {
            'User-Agent': userAgent,
          },
        });
      } catch (err) {
        console.log('getHtml err');
        console.log(err);
        return '';
      }
    };
    //* 2. getHtml 요청에서 html을 받음
    const text = await getHtml().then(async (htmlDoc) => {
      //* 2-1 innerText : html에서 텍스트를 저장하는배열
      let innerText = [];
      //* 2-2 decoding
      const convertBinary = Buffer.from(htmlDoc);
      const enc = await getEnc(url);
      const decodedResult = Iconv.decode(convertBinary, enc);
      const $ = cheer.load(decodedResult);
      //* 2-3 getText: body tag의 text 가져오기
      //! 분기 : naver Post 인지 판단
      if ($('head').html().indexOf('post.naver.com/') > -1) {
        innerText.push(
          $('body')
            .html()
            .replace('<script type="x-clip-content" id="__clipContent">', '')
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/(<([^>]+)>)/gi, '')
            .replace(/  |&nbsp;|(^\s*)|(\s*$)|\n|\t|\r/g, '')
        );
      } else {
        if (url.indexOf('twitter.com/') > -1) {
          return '';
        }
        //! 분기 : <iframe></iframe> 이 있는지 판단
        if ($('body').html().indexOf('mainFrame') > -1) {
          let iframeUrl;
          if (url.indexOf('https://m.blog.naver.com') > -1) {
            iframeUrl = 'https://m.blog.naver.com' + $('iframe').attr('src');
          } else if (url.indexOf('https://blog.naver.com') > -1) {
            iframeUrl = 'https://blog.naver.com' + $('iframe').attr('src');
          }
          return cheerio(iframeUrl);
        } else {
          innerText.push(
            $('body')
              .text()
              .replace(/  |(^\s*)|(\s*$)|\n|\t|\r/g, '')
          );
        }
      }
      return innerText.join('').slice(0, 15000);
    });
    return text;
  } catch (err) {
    console.log('cheerio err');
    console.log(err);
    return '';
  }
};

module.exports = cheerio;
