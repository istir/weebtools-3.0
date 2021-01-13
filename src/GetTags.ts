import { assert } from 'console';
import { TouchBarOtherItemsProxy } from 'electron';
import { supportsGoWithoutReloadUsingHash } from 'history/DOMUtils';
import Config from './config.json';
import Downloader from './Downloader';
import settings from 'electron-settings';
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
  workingDirectory: any = '';
  settingsTags: any | undefined;
  async init(database: any, urlString: string) {
    // settings      .getSync('commonSettings')      .find((el) => el.key === 'workingPath').value = settings.getSync('commonSettings');
    // settings      .getSync('commonSettings')      .find((el) => el.key === 'workingPath').value = settings      .getSync('commonSettings')      .find((el) => el.key === 'workingPath').value;
    this.settingsTags = settings.getSync('tags');

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
      this.urlString = urlString;
      console.log('Danbooru');
      // this.handeDatabaseConnection();
      var test = await this.readBooruTags(urlString, this.generateFolderName);
      // this.urlString = urlString;
      return 'true';
    } else if (patternTwitter.exec(urlString)) {
      this.urlString = urlString;
      console.log('Twitter');
      await this.readTwitterTags(urlString, this.generateFolderName);
      this.site = 'Twitter';
    } else if (patternPixiv.exec(urlString)) {
      console.log('Pixiv');
      this.site = 'Pixiv';
    }
  }

  async downloadAsync(url, filePath) {
    // var dl = await download(url).pipe(fs.createWriteStream(filePath));
    // var dl = fs.writeFileSync(filePath, await download(url));
    fs.writeFile(filePath, await download(url), () => {
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
  async readBooruTags(urlString: string, generateFolderName: Function) {
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
      folderName = generateFolderName(tags);

      filePath = path.join(
        settings
          .getSync('commonSettings')
          .find((el) => el.key === 'workingPath').value,
        folderName,
        fileName
      );
    }
    function setFileName() {
      var split = downloadLink.split('/');
      fileName = split[split.length - 1];
    }
  }

  generateFolderName(tags: string[]): string {
    for (let i = 0; i < settings.getSync('tags').length; i++) {
      if (!settings.getSync('tags')[i].checkFolder) {
        continue;
      }
      for (let j = 0; j < tags.length; j++) {
        for (let k = 0; k < settings.getSync('tags')[i].fromSite.length; k++) {
          if (tags[j] == settings.getSync('tags')[i].fromSite[k]) {
            return settings.getSync('tags')[i].folder;
          }
        }
      }
    }
    return 'other';
  }

  async readTwitterTags(taggedUrlString: string, generateFolderName: Function) {
    var tags: string[] = [];
    var downloadLink: string = '';
    var fileName: string = '';
    var filePath: string = '';
    var folderName: string = '';
    var postLink: string = '';
    postLink = taggedUrlString.substring(0, taggedUrlString.indexOf('|'));
    downloadLink = taggedUrlString.substring(taggedUrlString.indexOf('|') + 1);
    downloadLink = downloadLink.substring(0, downloadLink.indexOf('|'));
    let tagsString = taggedUrlString.substring(
      taggedUrlString.indexOf('|Tags: ')
    );
    tagsString = tagsString.replace('|Tags: ', '');
    tags = tagsString.split(', ');
    generatePath();
    this.tags = tags;
    this.downloadLink = downloadLink;
    this.fileName = fileName;
    this.filePath = filePath;
    this.folderName = folderName;
    this.insertIntoDatabase(this.folderName, this.fileName, this.tags);
    fs.writeFile(filePath, await download(downloadLink), (callback) => {
      this.dl = true;
    });

    function generatePath() {
      setFileName();
      folderName = generateFolderName(tags);

      filePath = path.join(
        settings
          .getSync('commonSettings')
          .find((el) => el.key === 'workingPath').value,
        folderName,
        fileName
      );
    }
    function setFileName() {
      let urlSplit = downloadLink.split('?format=');

      let name = urlSplit[0].substring(urlSplit[0].lastIndexOf('/') + 1);
      let ext = urlSplit[1].substring(0, urlSplit[1].indexOf('&'));
      fileName = name + '.' + ext;
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
      insert(tags, this.urlString);
    } else {
      deleteAndUpdate(file, folder).then((ful: string[]) => {
        // console.log(ful);
        this.tags = ful;
      });
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

    async function deleteAndUpdate(fileName: string, folderName: string) {
      async function getRecord() {
        var queryGetTags =
          'SELECT * FROM files WHERE fileName = "' +
          fileName +
          '" AND folder ="' +
          folderName +
          '"';
        var [rows] = await sqlConnection.execute(queryGetTags);
        // return stringToArr(rows[0].Tags);
        return new Promise((resolve, reject) => {
          if (rows.length > 0) {
            resolve(rows[0].Tags);
          } else {
            reject();
          }
        });
      }
      // var newTags = [];
      return getRecord().then((ful: string) => {
        // console.log(ful);
        let oldTags = stringToArr(ful);
        // console.log(tags);
        let allTags = oldTags.concat(tags);
        var newTags = [...new Set(allTags)];

        deleteRecord().then((ful) => {
          insert(newTags, this.urlString);
        });
        return new Promise((res) => {
          res(newTags);
        });
      });

      async function deleteRecord() {
        var queryDeleteRow =
          'DELETE FROM files WHERE fileName = "' +
          fileName +
          '" AND folder ="' +
          folderName +
          '"';
        var [rows] = await sqlConnection.execute(queryDeleteRow);
        // console.log(rows);
        return new Promise((resolved, rejected) => {
          if (rows.affectedRows >= 1) {
            // console.log('YEP');
            resolved(true);
          } else {
            rejected(false);
          }
        });
      }
      // console.log(newTags);
      // throw 'BREAK';
    }

    async function insert(tagsToInsert: string[], url: string) {
      var query =
        'INSERT INTO files(folder, fileName, tags, url) VALUES("' +
        folder +
        '","' +
        file +
        '","' +
        arrToString(tagsToInsert) +
        '","' +
        url +
        '")';
      await sqlConnection.query(query);
    }
    function arrToString(tagArr: string[]) {
      return tagArr.join(', ');
    }
    function stringToArr(tagString: string) {
      return tagString.split(', ');
    }
  }
}
export default GetTags;
