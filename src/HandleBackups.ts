import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export default async function HandleBackups(currentDBFile: string) {
  const backupFolder = path.join(app.getPath('userData'), 'backups');
  let howManyToDelete = 0;
  const maxFilesInFolder = 5;
  const maxDifferenceInTime = 1000 * 3600 * 24 * 5;

  function createFolderIfDoesntExist(folder: string) {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
  }

  function createBackup() {
    const fileName = `public.db${Date.now()}`;
    const backedUpFile = path.join(backupFolder, fileName);
    fs.copyFile(currentDBFile, backedUpFile, (err) => {
      if (err) throw err;
    });
  }

  function deleteOldFile(file: string, birthtime: Date) {
    if (howManyToDelete > 0) {
      const timeDiff = Date.now() - birthtime.getTime();

      if (timeDiff / maxDifferenceInTime > 1) {
        fs.unlink(file, (err) => {
          if (err) throw err;
        });
      }
      howManyToDelete -= 1;
    }
  }

  function handleFileArray(err: NodeJS.ErrnoException, files: string[]) {
    if (err) {
      throw err;
    }

    if (files.length > maxFilesInFolder) {
      howManyToDelete = files.length - maxFilesInFolder;
    }
    files.forEach((file) => {
      const absFile = path.join(backupFolder, file);
      fs.stat(absFile, (errStat: NodeJS.ErrnoException, stats: fs.Stats) => {
        if (errStat) {
          throw errStat;
        }
        deleteOldFile(absFile, stats.birthtime);
      });
    });
  }
  createFolderIfDoesntExist(backupFolder);
  createBackup();
  fs.readdir(backupFolder, handleFileArray);
}
