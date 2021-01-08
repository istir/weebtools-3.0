import { assert } from 'console';
import { TouchBarOtherItemsProxy } from 'electron';
import { supportsGoWithoutReloadUsingHash } from 'history/DOMUtils';
import Config from './config.json';
import Downloader from './Downloader';
const fs = require('fs');
const download = require('download');
const path = require('path');
// const mysql = require('mysql2/promise');
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
  filePath: string | undefined;
  folderName: string | undefined;
  sqlConnection: any | undefined;
  dl: any | undefined;
  urlString: string = '';
  eventFinished: any | undefined;
  async init(database: any, urlString: string) {
    this.sqlConnection = database;
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
      // this.handeDatabaseConnection();
      var test = await this.readBooruTags(urlString);
      // this.urlString = urlString;
      return 'true';
    } else if (patternTwitter.exec(urlString)) {
      console.log('Twitter');
      this.site = 'Twitter';
    } else if (patternPixiv.exec(urlString)) {
      console.log('Pixiv');
      this.site = 'Pixiv';
    }
  }

  // constructor(database, urlString: string) {
  //   this.sqlConnection = database;
  //   var patternBooru = new RegExp(
  //     '^(ht|f)tp(s?)\\:\\/\\/(danbooru|safebooru)\\.donmai\\.us\\/posts\\/[0-9]{4,}'
  //   );
  //   var patternTwitter = new RegExp(
  //     '^(ht|f)tp(s?)\\:\\/\\/twitter\\.com\\/[0-z]+\\/status\\/[0-9]+\\/photo.+'
  //   );
  //   var patternPixiv = new RegExp(
  //     '^(ht|f)tp(s?)\\:\\/\\/(www?).pixiv.net\\/.+artworks\\/[0-9]+'
  //   );

  //   if (patternBooru.exec(urlString)) {
  //     this.site = 'Danbooru';
  //     // console.log('Danbooru');
  //     // this.handeDatabaseConnection();
  //     this.readBooruTags(urlString);
  //     // this.urlString = urlString;
  //   } else if (patternTwitter.exec(urlString)) {
  //     console.log('Twitter');
  //     this.site = 'Twitter';
  //   } else if (patternPixiv.exec(urlString)) {
  //     console.log('Pixiv');
  //     this.site = 'Pixiv';
  //   }

  //   // return{dl:this.dl,_document:this._document,site:this.site,tags:this.tags,fileName:this.fileName,filePath:this.filePath,folderName:this.folderName,sqlConnection:this.sqlConnection,downloadLink:this.downloadLink}
  //   // this.test = undefined;
  //   // this.doc = 'asd';
  //   // return{dl:this.dl};
  // }

  async getDownloadInfo() {
    var result = await this.readBooruTags(this.urlString).then(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
    return new Promise((resolve, reject) => {
      // if (this.dl != undefined) {
      //   resolve(result);
      // } else {
      //   reject('ERR');
      // }
      resolve(result);
    });
  }

  async downloadAsync(url, filePath, callback) {
    // var dl = await download(url).pipe(fs.createWriteStream(filePath));
    // var dl = fs.writeFileSync(filePath, await download(url));
    fs.writeFile(filePath, await download(url), (callback) => {
      this.dl = true;
    });
    // this.dl = dl;
    // this.eventFinished = new CustomEvent('SpecialMessage', {
    //   detail: {
    //     message: 'Hello There',
    //     time: new Date(),
    //   },
    //   bubbles: true,
    //   cancelable: true,
    // });
    // dispatchEvent(this.eventFinished);
    // return dl;
  }
  async readBooruTags(urlString: string) {
    var tags: string[] = [];
    var downloadLink: string = '';
    var fileName: string = '';
    var filePath: string = '';
    var folderName: string = '';
    getAllThings().then(
      async () => {
        this.tags = tags;
        this.downloadLink = downloadLink;
        this.fileName = fileName;
        this.filePath = filePath;
        this.folderName = folderName;
        // console.log(this.tags);
        // console.log(this.downloadLink);
        // console.log(this.fileName);
        // console.log(this.filePath);
        this.insertIntoDatabase(this.folderName, this.fileName, this.tags);
        // console.log(new Downloader(this.downloadLink, this.filePath));
        await this.downloadAsync(this.downloadLink, this.filePath);
        // console.log(test);
        return this.dl;
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
      // setFileName();
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

            // console.log(element);
            var obrobiony = normalizeString(element.innerText);
            for (let j = 0; j < obrobiony.length; j++) {
              tags.push(obrobiony[j]);
            }
            // var obrobiony: string[] = normalizeString(element.innerText);
          }
        }
      }

      var elementRating = _document.getElementById('post-info-rating')
        ?.innerText;
      if (elementRating != null) {
        // console.log(elementRating);
        tags.push(elementRating);
      }

      // var elementsInfo = _document.getElementById('post-information')
      // ?.children as HTMLCollectionOf<HTMLElement>;
      // if (elementsInfo!=null) {
      //   for (let i = 0; i < elementsInfo.length; i++) {
      //   var element = elementsInfo[i];
      //   if (element.className.includes) {

      //   }
      //   }
      // }
      generatePath();

      return new Promise((resolve, reject) => {
        if (tags.length > 0 && filePath.length > 0) {
          resolve('OK');
        } else {
          reject('ERROR');
        }
      });
    }

    function normalizeString(input: string) {
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
    function generatePath() {
      setFileName();
      folderName = generateFolderName();
      filePath = path.join(Config.workingPath, folderName, fileName);
    }
    function setFileName() {
      var split = downloadLink.split('/');
      fileName = split[split.length - 1];
    }

    function generateFolderName(): string {
      // console.log(Config.tags[0].fromSite);
      console.log('generating folder name');
      console.log(tags);

      for (let i = 0; i < Config.tags.length; i++) {
        if (!Config.tags[i].checkFolder) {
          continue;
        }
        for (let j = 0; j < tags.length; j++) {
          for (let k = 0; k < Config.tags[i].fromSite.length; k++) {
            if (tags[j] == Config.tags[i].fromSite[k]) {
              console.log(Config.tags[i].folder);
              return Config.tags[i].folder;
            }
          }
        }
      }

      // for (let i = 0; i < tags.length; i++) {
      //   for (let j = 0; j < Config.tags.length; j++) {
      //     if (!Config.tags[j].checkFolder) {
      //       continue;
      //     }
      //     console.log('tags[i]');
      //     console.log(tags[i]);
      //     console.log('COnfig.tags[j].folder');
      //     console.log(Config.tags[j].folder);
      //     for (let k = 0; k < Config.tags[j].fromSite.length; k++) {
      //       if (tags[i] == Config.tags[j].fromSite[k]) {
      //         console.log(Config.tags[j].folder);
      //         return Config.tags[j].folder;

      //         // console.log('YEPPERS' + tags[i]);
      //         // console.log(fs.access(Config.workingPath));
      //         // fs.appendFile(
      //         //   path.join(Config.workingPath, 'test.txt'),
      //         //   'contentasdsad',
      //         //   (err) => {
      //         //     if (err) {
      //         //       console.error(err);
      //         //       return;
      //         //     }
      //         //     //file written successfully
      //         //   }
      //         // );
      //         // fs.writeFile(
      //         //   'E:\\istir\\react-git\\git\\tilde-5.4.0-react\\working-dir\\test.txt',
      //         //   'asdasdasd'
      //         // );
      //       }
      //     }
      //   }
      // }
      return 'other';
    }
  }

  // async handeDatabaseConnection() {
  //   this.sqlConnection = await mysql.createConnection({
  //     host: 'localhost',
  //     user: 'istir',
  //     password: 'weebtoolspasswd',
  //     database: 'weebtools',
  //   });
  //   this.sqlConnection.connect(function (err: any) {
  //     if (err) {
  //       console.log("Couldn't connect to database.");
  //       throw err;
  //     }
  //     console.log('Connected to database');
  //   });
  // }
  async insertIntoDatabase(folder: string, file: string, tags: string[]) {
    var sqlConnection = this.sqlConnection;

    var duplicate: boolean =
      (await checkIfExists('fileName', 'folder')) > 0 ? true : false;
    if (!duplicate) {
      insert();
    }
    // console.log(test);
    async function checkIfExists(keyFile: string, keyFolder: string) {
      var query =
        'SELECT COUNT(*) as solution FROM files WHERE ' +
        keyFile +
        '="' +
        file +
        '" and ' +
        keyFolder +
        '="' +
        folder +
        '"';

      var [rows] = await sqlConnection.execute(query);
      // var asd = await sqlConnection.query(query);

      // length = asd;
      // console.log(sqlConnection.solution);
      return rows[0].solution;
    }

    async function insert() {
      var query =
        'INSERT INTO files(folder, fileName, tags) VALUES("' +
        folder +
        '","' +
        file +
        '","' +
        normalizeTags(tags) +
        '")';
      await sqlConnection.query(query);
    }
    function normalizeTags(tagArr: string[]) {
      return tagArr.join(', ');
    }
  }
}
export default GetTags;
