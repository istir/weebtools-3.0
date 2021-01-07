const fs = require('fs');
const download = require('download');
const path = require('path');
class Downloader {
  constructor(url, filePath) {
    this.downloadAsync(url, filePath);
  }

  async downloadAsync(url, filePath) {
    var dl = await download(url).pipe(fs.createWriteStream(filePath));
    console.log(dl);
  }
}
export default Downloader;
