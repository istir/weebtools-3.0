import settings from 'electron-settings';

const fs = require('fs');
const download = require('download');
const path = require('path');
// const mysql = require('mysql2/promise');
// var http = require('http');
const https = require('https');
const superagent = require('superagent');

const domparser = new DOMParser();
class GetTags {
  site: string | undefined;

  _document = '';

  tags: string[] = [];

  downloadLink: string | undefined;

  fileName: string | undefined;

  filePath: string | undefined;

  folderName: string | undefined;

  sqlConnection: any | undefined;

  dl: any | undefined;

  urlString = '';

  eventFinished: any | undefined;

  workingDirectory: any = '';

  settingsTags: any | undefined;

  downloadedCallback: any;

  commonSettings: any | undefined;

  setProgressBarPercentage: any | undefined;

  async init(
    database: any,
    urlString: string,
    downloadedCallback: any,
    setProgressBarPercentage: any
  ) {
    // settings      .getSync('commonSettings')      .find((el) => el.key === 'workingPath').value = settings.getSync('commonSettings');
    // settings      .getSync('commonSettings')      .find((el) => el.key === 'workingPath').value = settings      .getSync('commonSettings')      .find((el) => el.key === 'workingPath').value;
    this.settingsTags = settings.getSync('tags');
    this.commonSettings = settings.getSync('commonSettings');
    this.sqlConnection = database;
    this.downloadedCallback = downloadedCallback;
    this.setProgressBarPercentage = setProgressBarPercentage;
    const patternBooru = new RegExp(
      '^(ht|f)tp(s?)\\:\\/\\/(danbooru|safebooru)\\.donmai\\.us\\/posts\\/[0-9]{4,}'
    );
    const patternTwitter = new RegExp(
      '^(ht|f)tp(s?)\\:\\/\\/twitter\\.com\\/[0-z]+\\/status\\/[0-9]+\\/photo.+'
    );
    const patternPixiv = new RegExp(
      '^(ht|f)tp(s?)\\:\\/\\/(www?).pixiv.net\\/.+artworks\\/[0-9]+'
    );

    if (patternBooru.exec(urlString)) {
      this.site = 'Danbooru';
      this.urlString = urlString;
      console.log('Danbooru');
      // this.handeDatabaseConnection();
      // var test = await this.readBooruTags(urlString, this.generateFolderName);
      if (
        this.commonSettings.find((el) => el.key === 'useDanbooruAPI').value ===
        'true'
      ) {
        // console.log('YEP');
        await this.readBooruTagsAPI(
          urlString,
          this.generateFolderName.bind(this),
          true
        );
      } else {
        await this.readBooruTags(urlString, this.generateFolderName);
      }

      // this.urlString = urlString;
      return 'true';
    }
    if (patternTwitter.exec(urlString)) {
      this.urlString = urlString;
      console.log('Twitter');
      this.site = 'Twitter';
      await this.handleDownloadingPixivTwitter(
        urlString,
        this.generateFolderName.bind(this),
        this.site
      );
      // await this.readTwitterTags(urlString, this.generateFolderName);
    } else if (patternPixiv.exec(urlString)) {
      // console.log('Pixiv');
      this.urlString = urlString;
      this.site = 'Pixiv';
      await this.handleDownloadingPixivTwitter(
        urlString,
        this.generateFolderName.bind(this),
        this.site
      );
      // await this.readPixivTags(urlString, this.generateFolderName);
    }
    return true;
  }

  // async downloadAsyncPixiv(url, filePath) {
  //   fs.writeFile(
  //     filePath,
  //     await download(url),
  //     { headers: { referer: 'https://app-api.pixiv.net/' } },
  //     () => {
  //       this.dl = true;
  //     }
  //   );
  // }
  async downloadAsync(url, filePath) {
    fs.writeFile(
      filePath,
      await download(url)
        .on('downloadProgress', (progress) => {
          // console.log(progress);
          this.setProgressBarPercentage(progress.percent);
        })
        .on('end', () => {
          // console.log('END');
          this.setProgressBarPercentage(1);
        }),
      () => {
        // this.dl = true;
        // console.log(this.urlString);
        this.downloadedCallback(
          true,
          this.filePath,
          this.fileName,
          this.tags,
          this.folderName,
          this.urlString
        );
      }
    );

    // download(url, filePath)
    //   .on('downloadProgress', (data) => console.log(data))
    //   .then(() => {
    //     console.log('done');
    //     this.downloadedCallback(
    //       true,
    //       this.filePath,
    //       this.fileName,
    //       this.tags,
    //       this.folderName,
    //       this.urlString
    //     );
    //   });
  }

  async readBooruTagsAPI(
    urlString: string,
    generateFolderName: (tags: string[]) => string,
    shouldCrawlForName: boolean
  ) {
    let tags: string[] = [];
    let downloadLink = '';
    let fileName = '';
    let filePath = '';
    let folderName = '';

    function getID(url) {
      let url1 = url.substring(url.indexOf('/posts/'));
      url1 = url1.replace('/posts/', '');
      const urlA = url1.split('?');
      return urlA[0];
    }
    function generatePath() {
      filePath = path.join(
        this.commonSettings.find((el) => el.key === 'workingPath').value,
        folderName,
        fileName
      );
    }
    function parseInfo(data) {
      tags = data.tag_string.split(' ');
      // tags.forEach((element) => {
      //   element = element.replaceAll('_', ' ');
      // });
      for (let i = 0; i < tags.length; i += 1) {
        tags[i] = tags[i].replaceAll('_', ' ');
      }
      // let modifiedTag = data.tag_string.replace('_', ' ');
      // console.log(data.tag_string);
      folderName = generateFolderName(tags);
      const bindGeneratePath = generatePath.bind(this);
      bindGeneratePath();
      // generatePath();
      if (!shouldCrawlForName || fileName.length < 1) {
        fileName = `danbooru_${data.md5}.${data.file_ext}`;
      }
      return new Promise((resolve, reject) => {
        if (
          fileName.length > 0 &&
          tags.length > 0 &&
          downloadLink.length > 0 &&
          filePath.length > 0 &&
          folderName.length > 0
        ) {
          resolve('OK');
        } else {
          // console.log(
          //   `fileName ${fileName}`,
          //   `\ntags ${tags}`,
          //   `\ndownloadLink ${downloadLink}`,
          //   `\nfolderName ${folderName}`,
          //   `\nfilePath ${filePath}`
          // );
          reject(
            new Error(
              `Couldn't get information from API` +
                `\nfileName ${fileName}` +
                `\ntags ${tags}` +
                `\ndownloadLink ${downloadLink}` +
                `\nfolderName ${folderName}` +
                `\nfilePath ${filePath}`
            )
          );
        }
      });
    }

    if (shouldCrawlForName) {
      let danbooruDocument = await superagent.get(urlString);

      danbooruDocument = danbooruDocument.text;
      const downloadedDocument: Document = domparser.parseFromString(
        danbooruDocument,
        'text/html'
      );
      let downloaded = downloadedDocument.getElementById('post-option-download')
        ?.innerHTML;

      if (downloaded != null) {
        downloaded = downloaded.substr(downloaded.indexOf('href="'));
        downloaded = downloaded.replace('href="', '');
        downloaded = downloaded.substr(0, downloaded.indexOf('?download=1'));
        downloadLink = downloaded;
        const split = downloaded.split('/');
        fileName = split[split.length - 1];
      }
    }
    // console.log(fileName);

    const options = {
      hostname: 'danbooru.donmai.us',
      path: `/posts/${getID(urlString)}.json`,
      method: 'GET',
    };
    let data = '';
    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        data += d;
      });
      res.on('end', () => {
        const jsonData = JSON.parse(data);
        // console.log(parseInfo(jsonData));
        // if (parseInfo(jsonData)=="OK") {

        // }
        const bindParseInfo = parseInfo.bind(this);
        bindParseInfo(jsonData)
          .then(
            (ful) => {
              // console.log(ful);
              this.tags = tags;
              this.downloadLink = downloadLink;
              this.fileName = fileName;
              this.filePath = filePath;
              this.folderName = folderName;
              this.insertIntoDatabase(
                this.folderName,
                this.fileName,
                this.tags
              );
              this.downloadAsync(this.downloadLink, this.filePath);
              return ful;
            },
            (rej) => {
              throw rej;
              return rej;
            }
          )
          .catch((error) => {
            // console.error(error);
            throw error;
          });
      });
    });
    req.on('error', (error) => {
      // console.error(error);
      throw error;
    });

    req.end();
  }

  async readBooruTags(
    urlString: string,
    generateFolderName: (tags: string[]) => string
  ) {
    const tags: string[] = [];
    let downloadLink = '';
    let fileName = '';
    let filePath = '';
    let folderName = '';
    function setFileName() {
      const split = downloadLink.split('/');
      fileName = split[split.length - 1];
    }

    function generatePath() {
      setFileName();
      folderName = generateFolderName(tags);

      filePath = path.join(
        this.commonSettings.find((el) => el.key === 'workingPath').value,
        folderName,
        fileName
      );
    }

    function getActualTags(_document: Document) {
      // var elements = _document.getElementById('tag-list')
      const elements = _document.getElementsByClassName(
        'tag-list categorized-tag-list'
      )[0]?.children as HTMLCollectionOf<HTMLElement>;
      // console.log('OBROBIONY:');
      if (elements != null) {
        for (let i = 0; i < elements.length; i += 1) {
          // console.log(i);
          const element = elements[i];
          if (
            (element.className.includes('copyright-tag-list') ||
              element.className.includes('character-tag-list') ||
              element.className.includes('general-tag-list')) &&
            !element.tagName.includes('H3')
          ) {
            // var obrobiony = element.innerText;

            // console.log(element);

            for (let j = 0; j < elements[i].childElementCount; j += 1) {
              tags.push(elements[i].children[j].children[1]?.innerText);
              // console.log(elements[i].children[j].children[1].innerText);
              // console.log(el.children[1].innerText)
            }

            // var obrobiony = normalizeString(element.innerText);
            // for (let j = 0; j < obrobiony.length; j+=1) {
            //   tags.push(obrobiony[j]);
            // }
            // var obrobiony: string[] = normalizeString(element.innerText);
          }
        }
      }

      const elementRating = _document.getElementById('post-info-rating')
        ?.innerText;
      if (elementRating != null) {
        // console.log(elementRating);
        tags.push(elementRating);
      }

      // var elementsInfo = _document.getElementById('post-information')
      // ?.children as HTMLCollectionOf<HTMLElement>;
      // if (elementsInfo!=null) {
      //   for (let i = 0; i < elementsInfo.length; i+=1) {
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
          reject(new Error("Couldn't get tags"));
        }
      });
    }
    function getDownloadLink(_document: Document) {
      // console.log(
      //   downloadedDocument.getElementById('post-option-download').innerHTML
      // );
      // if (_document !== null) {
      //   // try{
      let downloaded = _document.getElementById('post-option-download')
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
    function onCrawlFinished(doc: string) {
      // console.log(bruh);
      // console.log(downloaded);
      // return downloaded;
      const downloadedDocument: Document = domparser.parseFromString(
        doc,
        'text/html'
      );
      // if (downloadedDocument) {
      getDownloadLink(downloadedDocument);
      getActualTags(downloadedDocument);
      // }
    }

    async function getAllThings() {
      // console.log('XD');

      let documentDanbooru = await superagent.get(urlString);

      documentDanbooru = documentDanbooru.text;
      // console.log(_document);
      onCrawlFinished(documentDanbooru);
      // getActualTags(_document);
    }

    // function normalizeString(input: string) {
    //   const items = [];
    //   // console.log(input);
    //   const strings = input.split('?');
    //   // console.log(strings);
    //   for (let i = 1; i < strings.length; i += 1) {
    //     // console.log(i);
    //     let output = strings[i].replace(' ', '');
    //     output = output.replace(/&#39;/g, "'");
    //     output = output.replace(/ [0-9.]+ *k* *$/g, '');
    //     // console.log(output);
    //     items.push(output);
    //   }
    //   return items;
    // }

    getAllThings()
      .then(
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
          // return this.dl;
          return true;
        },
        (err) => {
          // console.log(err);
          throw err;
        }
      )
      .catch((error) => {
        throw error;
      });
  }

  generateFolderName(tags: string[]): string {
    for (let i = 0; i < this.settingsTags.length; i += 1) {
      if (!this.settingsTags[i].checkFolder) {
        // continue;
        i += 1;
      }
      for (let j = 0; j < tags.length; j += 1) {
        for (let k = 0; k < this.settingsTags[i].fromSite.length; k += 1) {
          if (tags[j] === this.settingsTags[i].fromSite[k]) {
            return this.settingsTags[i].folder;
          }
        }
      }
    }

    return 'other';
  }

  async handleDownloadingPixivTwitter(
    taggedUrlString: string,
    generateFolderName: Function,
    site: string
  ) {
    let tags: string[] = [];
    let downloadLink = '';
    let fileName = '';
    let filePath = '';
    let folderName = '';
    // let postLink = '';
    // const postLink = taggedUrlString.substring(0, taggedUrlString.indexOf('|'));
    downloadLink = taggedUrlString.substring(taggedUrlString.indexOf('|') + 1);
    downloadLink = downloadLink.substring(0, downloadLink.indexOf('|'));
    let tagsString = taggedUrlString.substring(
      taggedUrlString.indexOf('|Tags: ')
    );
    tagsString = tagsString.replace('|Tags: ', '');
    tags = tagsString.split(', ');
    const bindGeneratePath = generatePath.bind(this);
    bindGeneratePath();
    this.tags = tags;
    this.downloadLink = downloadLink;
    this.fileName = fileName;
    this.filePath = filePath;
    this.folderName = folderName;
    // console.log(this.urlString);
    this.urlString = this.urlString.substring(0, this.urlString.indexOf('|'));

    this.insertIntoDatabase(this.folderName, this.fileName, this.tags);
    if (site === 'Pixiv') {
      fs.writeFile(
        filePath,
        await download(downloadLink, {
          headers: { Referer: 'https://app-api.pixiv.net/' },
        }),
        () => {
          // this.dl = true;
          this.downloadedCallback(
            true,
            this.filePath,
            this.fileName,
            this.tags,
            this.folderName,
            this.urlString
          );
        }
      );
    } else {
      fs.writeFile(filePath, await download(downloadLink), () => {
        // this.dl = true;
        this.downloadedCallback(
          true,
          this.filePath,
          this.fileName,
          this.tags,
          this.folderName,
          this.urlString
        );
      });
    }
    function setFileNamePixiv() {
      // let urlSplit = downloadLink.split('?format=');
      // console.log(downloadLink);
      const name = downloadLink.substring(downloadLink.lastIndexOf('/') + 1);
      // console.log(name);
      // let name = urlSplit[0].substring(urlSplit[0].lastIndexOf('/') + 1);
      // let ext = urlSplit[1].substring(0, urlSplit[1].indexOf('&'));
      fileName = name;
    }

    function setFileNameTwitter() {
      const urlSplit = downloadLink.split('?format=');

      const name = urlSplit[0].substring(urlSplit[0].lastIndexOf('/') + 1);
      const ext = urlSplit[1].substring(0, urlSplit[1].indexOf('&'));
      fileName = `${name}.${ext}`;
    }
    function generatePath() {
      // site === 'Twitter' ? setFileNameTwitter() : setFileNamePixiv();
      if (site === 'Twitter') {
        setFileNameTwitter();
      } else {
        setFileNamePixiv();
      }
      folderName = generateFolderName(tags);

      filePath = path.join(
        this.commonSettings.find((el) => el.key === 'workingPath').value,
        folderName,
        fileName
      );
    }
  }

  async insertIntoDatabase(folder: string, file: string, tags: string[]) {
    const { sqlConnection } = this;
    // console.log(this.urlString);

    function arrToString(tagArr: string[]) {
      return tagArr.join(', ');
    }
    function stringToArr(tagString: string) {
      return tagString.split(', ');
    }
    async function insert(tagsToInsert: string[], url: string) {
      const query = `INSERT INTO files(folder, fileName, tags, url) VALUES("${folder}","${file}","${arrToString(
        tagsToInsert
      )}","${url}")`;
      await sqlConnection.query(query);
    }
    async function checkIfExists(keyFile: string, keyFolder: string) {
      const query = `SELECT COUNT(*) as solution FROM files WHERE ${keyFile}="${file}" and ${keyFolder}="${folder}"`;

      const [rows] = await sqlConnection.execute(query);
      // var asd = await sqlConnection.query(query);

      // length = asd;
      // console.log(sqlConnection.solution);
      return rows[0].solution;
    }

    async function deleteAndUpdate(
      fileName: string,
      folderName: string,
      urlString: string
    ) {
      async function getRecord() {
        const queryGetTags = `SELECT * FROM files WHERE fileName = "${fileName}" AND folder ="${folderName}"`;
        const [rows] = await sqlConnection.execute(queryGetTags);
        // return stringToArr(rows[0].Tags);
        return new Promise((resolve, reject) => {
          if (rows.length > 0) {
            resolve(rows[0].Tags);
          } else {
            reject();
          }
        });
      }
      async function deleteRecord() {
        const queryDeleteRow = `DELETE FROM files WHERE fileName = "${fileName}" AND folder ="${folderName}"`;
        const [rows] = await sqlConnection.execute(queryDeleteRow);
        // console.log(rows);
        return new Promise((resolve, reject) => {
          if (rows.affectedRows >= 1) {
            // console.log('YEP');
            resolve('Record Deleted');
          } else {
            reject(new Error("Couldn't delete record"));
          }
        });
      }
      // var newTags = [];
      return getRecord().then((ful: string) => {
        // console.log(ful);
        const oldTags = stringToArr(ful);
        // console.log(tags);
        const allTags = oldTags.concat(tags);
        const newTags = [...new Set(allTags)];

        deleteRecord()
          .then(() => {
            insert(newTags, urlString);
            return true;
          })
          .catch((err) => {
            throw err;
          });

        return new Promise((resolve) => {
          resolve(newTags);
        });
      });

      // console.log(newTags);
      // throw 'BREAK';
    }

    const duplicate: boolean = (await checkIfExists('fileName', 'folder')) > 0;
    if (!duplicate) {
      insert(tags, this.urlString);
    } else {
      deleteAndUpdate(file, folder, this.urlString)
        .then((ful: string[]) => {
          // console.log(ful);
          this.tags = ful;
          return true;
        })
        .catch((err) => {
          throw err;
        });
    }
    // console.log(test);
  }
}
export default GetTags;
