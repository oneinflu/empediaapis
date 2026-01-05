const https = require('https');

function createFolder(path) {
  return new Promise((resolve, reject) => {
    const zone = process.env.BUNNY_STORAGE_ZONE;
    const accessKey = process.env.BUNNY_ACCESS_KEY;
    if (!zone || !accessKey) {
      return resolve({ skipped: true, reason: 'Missing BUNNY_STORAGE_ZONE or BUNNY_ACCESS_KEY' });
    }
    const options = {
      hostname: 'storage.bunnycdn.com',
      path: `/${encodeURIComponent(zone)}/${path.endsWith('/') ? path : path + '/'}`,
      method: 'PUT',
      headers: {
        AccessKey: accessKey,
        'Content-Length': 0
      }
    };
    const req = https.request(options, (res) => {
      // 201 Created for directories, 200 OK is fine too
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ ok: true, statusCode: res.statusCode });
      } else {
        resolve({ ok: false, statusCode: res.statusCode });
      }
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
}

module.exports = {
  createFolder
};
