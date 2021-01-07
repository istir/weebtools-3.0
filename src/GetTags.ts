import { assert } from 'console';
import { TouchBarOtherItemsProxy } from 'electron';
import { supportsGoWithoutReloadUsingHash } from 'history/DOMUtils';

// var http = require('http');
// var https = require('https');
var superagent = require('superagent');
const domparser = new DOMParser();
class GetTags {
  site: string | undefined;
  _document: string = '';
  tags: string[] = [];
  downloadLink: string | undefined;
  fileName: string | undefined;
  path: string | undefined;

  constructor(path: string, urlString: string) {
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

      this.readBooruTags(urlString);
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

  async readBooruTags(urlString: string) {
    var tags: string[] = [];
    var downloadLink: string = '';
    var fileName: string = '';
    getAllThings().then(
      (ret) => {
        this.tags = tags;
        this.downloadLink = downloadLink;
        this.fileName = fileName;
        console.log(this.tags);
        console.log(this.downloadLink);
        console.log(this.fileName);
      },
      (err) => {
        console.log(err);
      }
    );
    async function getAllThings() {
      // console.log('XD');

      var _document = await superagent.get(urlString);

      _document = _document.text;
      // console.log(_document);
      onCrawlFinished(_document);
      // getActualTags(_document);
    }
    function onCrawlFinished(doc: string) {
      // console.log(bruh);
      // console.log(downloaded);
      // return downloaded;
      var downloadedDocument: Document;
      downloadedDocument = domparser.parseFromString(doc, 'text/html');
      // if (downloadedDocument) {
      getDownloadLink(downloadedDocument);
      getActualTags(downloadedDocument);
      // }
    }

    function getDownloadLink(_document: Document) {
      // console.log(
      //   downloadedDocument.getElementById('post-option-download').innerHTML
      // );
      // if (_document !== null) {
      //   // try{
      var downloaded = _document.getElementById('post-option-download')
        ?.innerHTML;
      if (downloaded != null) {
        downloaded = downloaded.substr(downloaded.indexOf('href="'));
        downloaded = downloaded.replace('href="', '');
        downloaded = downloaded.substr(0, downloaded.indexOf('?download=1'));
        downloadLink = downloaded;
      }
      setFileName();
      //   // } catch(err){console.log(err)}
      // }
    }
    function getActualTags(_document: Document) {
      var elements = _document.getElementById('tag-list')
        ?.children as HTMLCollectionOf<HTMLElement>;
      // console.log('OBROBIONY:');
      if (elements != null) {
        for (let i = 0; i < elements.length; i++) {
          // console.log(i);
          var element = elements[i];
          if (
            (element.className.includes('copyright-tag-list') ||
              element.className.includes('character-tag-list') ||
              element.className.includes('general-tag-list')) &&
            !element.tagName.includes('H3')
          ) {
            // var obrobiony = element.innerText;

            console.log(element);
            var obrobiony = normalizeString(element.innerText);
            for (let j = 0; j < obrobiony.length; j++) {
              tags.push(obrobiony[j]);
            }
            // var obrobiony: string[] = normalizeString(element.innerText);
          }
        }
      }
      return new Promise((resolve, reject) => {
        if (tags.length > 0) {
          resolve('OK');
        } else {
          reject('ERROR');
        }
      });
    }

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
    function setFileName() {
      var split = downloadLink.split('/');
      fileName = split[split.length - 1];
    }
  }
}
export default GetTags;
