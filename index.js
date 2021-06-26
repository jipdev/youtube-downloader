(async () => {
  const youtube = require('youtube-dl-exec');
  const url = process.argv[2];
  await youtube(url);
})();
