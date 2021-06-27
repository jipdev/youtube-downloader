const ytdl = require('ytdl-core');
const fs = require('fs');
const inquirer = require('inquirer');
const readline = require('readline');

const getFilePath = (title) => {
  return `${process.env.PATH_SAVE ?? '../tmp'}/${title.replace(': ', ' - ')}.mp4`
}

const download = async () => {
  let starttime;
  const answer = await inquirer.prompt({
    type: 'input',
    name: 'url',
    message: 'Insira o url: '
  });

  const { videoDetails } = await ytdl.getInfo(answer.url)
  const video = ytdl(videoDetails.video_url)
  video.pipe(fs.createWriteStream(getFilePath(videoDetails.title)));
  video.once('response', () => {
    starttime = Date.now();
  });

  video.on('progress', (chunkLength, downloaded, total) => {
    const percent = downloaded / total;
    const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
    const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${(percent * 100).toFixed(2)}% baixado `);
    process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB de ${(total / 1024 / 1024).toFixed(2)}MB)\r\n`);
    process.stdout.write(`Tempo estimado para terminar: ${estimatedDownloadTime.toFixed(2)} minutos `);
    readline.moveCursor(process.stdout, 0, -1);
    if (percent === 1) {
      process.stdout.write('\r\n\r\n');
    }
  });

  video.on('end', async () => {
    const answerFinish = await inquirer.prompt(
      {
        type: 'confirm',
        name: 'repeat',
        message: 'Deseja baixar mais um vídeo?',
      }
    );

    if (answerFinish.repeat) {
      await download();
    } else {
      console.log(`Vídeos salvo em: ${process.env.PATH_SAVE}/`);
    }
  });
}

(async () => {
  require('dotenv').config();
  await download();
})();

