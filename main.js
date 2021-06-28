const fetch = require('node-fetch');

let JWT;

async function register ({
  registerHook,
}) {
  try {
    // TODO: how do we get the plugin config? (URL, password...)
    const res = await fetch('https://waasabi.eu.ngrok.io/waasabi/auth/local', {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        identifier: 'peertubebot',
        password: 'testpassword',
      })
    });
    JWT = await res.json().then(r => r.jwt);

    // TODO: use peertube logging facility?
    console.log('[peertube-plugin-waasabi] Authenticated to Waasabi backend');

    registerHook({
      target: 'action:api.live-video.statechange',
      handler: hook,
    });
    //storageManager.storeData(fieldName + '-' + video.id, value)
  }
  catch(e) {
    console.log('[peertube-plugin-waasabi] WARNING! Could not connect to Waasabi backend.');
  }
}

async function unregister () {
}

function hook({ video }) {
  streamStarted(video);
}

module.exports = {
  register,
  unregister
}



async function streamStarted(video) {
  const { id, uuid, name, description, url, state } = video.dataValues;

  let event = '';
  if (state == 4) {
    event = 'live-now';
  }
  if (state == 5) {
    event = 'ended';
  }

  const data = {
    "type": "livestream",
    "event": event,
    "message": `The session "${name}" is now live!`,
    "session": {},
    "livestream": {
      "type": "peertube",
    },
    video: {
      id, uuid, name, description, url, state,
    },
  };

  const res = await fetch('https://waasabi.eu.ngrok.io/waasabi/event-manager/signals', {
    method: 'post',
    headers: { 'authorization': 'Bearer '+JWT, 'content-type': 'application/json' },
    body: JSON.stringify({ event: 'livestream.'+event, data })
  });

  if (!res.ok) {
    return console.error('[peertube-plugin-waasabi] Request to backend for `streamStarted` failed: HTTP/'+res.status);
  }
}