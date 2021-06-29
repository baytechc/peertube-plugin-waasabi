const fetch = require('node-fetch');
const { computeSignature } = require('./lib/hmac.js');

// TODO: how to get this from Peertube?
const VideoState = {
  PUBLISHED: 1,
  TO_TRANSCODE: 2,
  TO_IMPORT: 3,
  WAITING_FOR_LIVE: 4,
  LIVE_ENDED: 5
};

let WH_SECRET;
let WH_ENDPOINT;

async function register ({
  registerHook,
  registerSetting,
  settingsManager,
}) {
  registerSetting({
    name: 'webhook-endpoint',
    label: 'Waasabi webhook URL',

    type: 'input',

    // Optional
    descriptionHTML: 'The URL of the Waasabi server webhook endpoint where the '
                    +'plugin needs to report the state changes.',

    default: 'https://',
    private: true
  });
  
  registerSetting({
    name: 'webhook-secret',
    label: 'Waasabi webhook secret',

    type: 'input-password',

    // Optional
    descriptionHTML: 'This field stores the shared secret that is used to encode '
                    +'and verify the webhook calls sent to the Waasabi instance',

    default: '',
    private: true
  });
  
  // Need the shared webhook secret to initialize
  const settings = await settingsManager.getSettings(['webhook-endpoint', 'webhook-secret']);
  WH_ENDPOINT = settings['webhook-endpoint'];
  WH_SECRET = settings['webhook-secret'];

  // Listen to live video status changes
  registerHook({
    target: 'action:api.live-video.statechange',
    handler: statechangeHandler,
  });
}

async function unregister () {
}

async function statechangeHandler({ video }) {
  const { id, uuid, name, description, url, state } = video.dataValues;

  let event = '';
  if (state == VideoState.WAITING_FOR_LIVE) {
    event = 'live-now';
  }
  // TODO: permalives never switch to LIVE_ENDED
  if (state == VideoState.LIVE_ENDED) {
    event = 'ended';
  }

  const data = {
    "type": "livestream",
    "event": event,
    "sender": "peertube",
    video: {
      id, uuid, name, description, url, state,
    },
  };

  const payload = JSON.stringify({ event: 'livestream.'+event, data });
  const payloadHmac = computeSignature(payload, WH_SECRET);

  const res = await fetch(WH_ENDPOINT, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
      'hmac': payloadHmac,
    },
    body: payload,
  });

  if (!res.ok) {
    return console.error('[peertube-plugin-waasabi] Request to backend for `streamStarted` failed: HTTP/'+res.status);
  }
}

module.exports = {
  register,
  unregister
}
