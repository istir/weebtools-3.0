import { TouchBarOtherItemsProxy } from 'electron';

var http = require('http');
var https = require('https');
const domparser = new DOMParser();
class GetTags {
  constructor(path, urlString) {
    var patternBooru = new RegExp(
      '^(ht|f)tp(s?)\\:\\/\\/(danbooru|safebooru)\\.donmai\\.us\\/posts\\/[0-9]{4,}'
    );
    var patternTwitter = new RegExp(
      '^(ht|f)tp(s?)\\:\\/\\/twitter\\.com\\/[0-z]+\\/status\\/[0-9]+\\/photo.+'
    );
    var patternPixiv = new RegExp(
      '^(ht|f)tp(s?)\\:\\/\\/(www?).pixiv.net\\/.+artworks\\/[0-9]+'
    );
    if (patternBooru.exec(urlString)) {
      this.site = 'Danbooru';
      // console.log('Danbooru');
      this._document = 'asd';
      this.test = this.readBooruTags(
        urlString,
        this.onCrawlFinishedGlobal,
        this._document
      );
    } else if (patternTwitter.exec(urlString)) {
      console.log('Twitter');
      this.site = 'Twitter';
    } else if (patternPixiv.exec(urlString)) {
      console.log('Pixiv');
      this.site = 'Pixiv';
    }
    // this.test = undefined;
    // this.doc = 'asd';
  }
  getTags() {
    return this.test;
  }
  async readBooruTags(urlString, crawlCallback, stringCallback) {
    var downloaded;
    // console.log('XD');
    var options = {
      host: urlString,
      method: 'GET',
      // timeout: 500,
    };
    var doc = '';

    // urlString = urlString.replace('https://', 'http://');
    try {
      // console.log('XD');

      var req = (urlString.includes('https://') ? https : http).request(
        urlString,
        function (res) {
          // console.log('STATUS: ' + res.statusCode);
          // console.log("HEADERS: " + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          // res.read()
          res.on('data', function (chunk) {
            // console.log('BODY: ' + chunk);
            doc += chunk;
            // console.log(doc);
          });
          res.on('end', crawlCallback);
        }
      );

      // req.end('aaa', 'utf8', onCrawlFinishedGlobal);
      req.end();
      // req.destroy();
      // var dl = doc.
    } catch (error) {
      console.log(console.log(error));
    }

    function onCrawlFinished() {
      // console.log(bruh);
      // console.log(downloaded);
      // return downloaded;
      var downloadedDocument = domparser.parseFromString(doc, 'text/html');
      getDownloadLink(downloadedDocument);
      getActualTags(downloadedDocument);
    }

    function getDownloadLink(_document) {
      // console.log(
      //   downloadedDocument.getElementById('post-option-download').innerHTML
      // );
      downloaded = _document.getElementById('post-option-download').innerHTML;
      downloaded = downloaded.substr(downloaded.indexOf('href="'));
      downloaded = downloaded.replace('href="', '');
      downloaded = downloaded.substr(0, downloaded.indexOf('?download=1'));
    }
    function getActualTags(_document) {
      var elements = _document.getElementById('tag-list').children;

      for (let i = 0; i < elements.length; i++) {
        // console.log(i);
        var element = elements[i];
        if (
          (element.className.includes('copyright-tag-list') ||
            element.className.includes('character-tag-list') ||
            element.className.includes('general-tag-list')) &&
          !element.tagName.includes('H3')
        ) {
          var obrobiony = console.log(element.innerText);
          // console.log(normalizeString(element.innerText));
        }
      }
    }
    // return downloaded;
    // console.log(

    // );

    function normalizeString(input) {
      var items = [];
      // console.log(input);
      var strings = input.split('?');
      // console.log(strings);
      for (let i = 1; i < strings.length; i++) {
        // console.log(i);
        var output = strings[i].replace(' ', '');
        output = output.replace(/&#39;/g, "'");
        output = output.replace(/ [0-9.]+ *k* *$/g, '');
        // console.log(output);
        items.push(output);
      }
      return items;
    }
  }

  //callbacks?

  // setTagsCallback() {
  //   // this.tags =
  // }

  onCrawlFinishedGlobal(xd) {
    // var downloadedDocument = domparser.parseFromString(
    //   this._document,
    //   'text/html'
    // );
    // this.test = downloadedDocument;
    console.log(xd);
    // getDownloadLink(downloadedDocument);
    // getActualTags(downloadedDocument);
  }
}
export default GetTags;
