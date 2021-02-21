import path from 'path';
import url from 'file-url';
import sendAsync from './DatabaseSQLite';

class RandomBackground {
  database: import('mysql2/promise').Connection;

  workingDirectory: string;

  fileArray;

  getSearchQuery(tags?: string[], tagsToIgnore?: string[], folder?: string) {
    let query = 'SELECT fileName, folder FROM files WHERE ';
    if (tags) {
      let queryTags = '';
      for (let i = 0; i < tags.length; i += 1) {
        queryTags += `Tags LIKE "%${tags[i]}%" AND `;
      }
      query += queryTags;
    }

    if (tagsToIgnore) {
      let queryTags = '';
      for (let i = 0; i < tagsToIgnore.length; i += 1) {
        if (tagsToIgnore[i].length > 0) {
          queryTags += `Tags NOT LIKE "%${tagsToIgnore[i]}%" AND `;
        }
      }
      query += queryTags;
    }
    if (folder) {
      query += `folder LIKE "${folder}"`;
    }
    if (query.endsWith('AND ')) {
      query = query.slice(0, query.length - 4);
    }
    return query;
  }

  async getCorrectQueries(
    database: import('mysql2/promise').Connection,
    workingDirectory: string,
    tagsToShow?: string[],
    tagsToIgnore?: string[],
    folderToShow?: string
  ) {
    this.workingDirectory = workingDirectory;
    this.fileArray = await sendAsync(
      this.getSearchQuery(tagsToShow, tagsToIgnore, folderToShow)
    );
    // await database
    //   .execute(this.getSearchQuery(tagsToShow, tagsToIgnore, folderToShow))
    //   .then((ful) => {
    //     this.fileArray = ful;
    //     return true;
    //   });
    // return rows;
  }

  getRandomBackground() {
    function combineName(rootDir: string, folder: string, name: string) {
      return path.join(rootDir, folder, name);
    }
    try {
      const random = Math.round(Math.random() * this.fileArray.length);
      // console.log(array[random]);
      //   console.log(

      return `url("${url(
        combineName(
          this.workingDirectory,
          this.fileArray[random].folder,
          this.fileArray[random].fileName
        )
      )}")`;
      //   );
    } catch {
      return '';
    }
  }
}
export default RandomBackground;
