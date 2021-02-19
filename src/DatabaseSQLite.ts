import { ipcRenderer } from 'electron';

export default function sendAsync(message) {
  return new Promise((resolve) => {
    ipcRenderer.once('asynchronous-reply', (_, arg) => {
      resolve(arg);
    });
    ipcRenderer.send('asynchronous-message', message);
  });
}

//   send(sql) {
//     this.sendAsync(sql).then((result) => console.log(result));
// }
