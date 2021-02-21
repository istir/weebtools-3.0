import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { file } from 'electron-settings';

export default async function HandleBackups(currentDBFile: string) {
  const backupFolder = path.join(app.getPath('userData'), 'backups');
  let howManyToDelete = 0;
  const maxFilesInFolder = 5;
  const maxDifferenceInTime = 1000 * 3600 * 24 * 5;
  const minDifferenceInTime = 1000 * 3600 * 24;
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

  function deleteOldFile(fileToDelete: string, birthtime: Date) {
    if (howManyToDelete > 0) {
      const timeDiff = Date.now() - birthtime.getTime();

      if (timeDiff / maxDifferenceInTime > 1) {
        fs.unlink(fileToDelete, (err) => {
          if (err) throw err;
        });
      }
      howManyToDelete -= 1;
    }
  }

  function handleDeleteArray(files: string[]) {
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

  function handleAddBackup(files) {
    let shouldBackup = false;
    // console.log(files.length);
    if (files.length === 0) {
      shouldBackup = true;
    }
    files.forEach((file) => {
      const absFile = path.join(backupFolder, file);
      fs.stat(absFile, (errStat: NodeJS.ErrnoException, stats: fs.Stats) => {
        if (errStat) {
          throw errStat;
        }
        if (
          (Date.now() - stats.birthtime.getTime()) / minDifferenceInTime >
          1
        ) {
          shouldBackup = true;
        }
      });
    });

    if (shouldBackup) {
      createBackup();
    }
  }

  function handleFileArray(err: NodeJS.ErrnoException, files: string[]) {
    if (err) {
      throw err;
    }
    handleDeleteArray(files);
    handleAddBackup(files);
  }
  createFolderIfDoesntExist(backupFolder);
  fs.readdir(backupFolder, handleFileArray);
}
