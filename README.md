# Waasabi PeerTube integration

This plugin is part of the [Waasabi](https://waasabi.org) software suite, it provides webhooks for live stream state changes. The plugin is automatically installed by the [Waasabi setup](https://www.npmjs.com/package/waasabi) during the provisioning of a Waasabi instance with the Peertube streaming backend enabled.

The plugin can be separately installed from the Peertube Plugin interface for existing services that need to be connected to a Waasabi instance, or can be used to receive live video event notifications for status changes in the form of webhooks by any service that requires this.


## Installation

> Note, that the Waasabi setup will take care of installation & configuration for newly installed instances.

The plugin can be manually installed from the admin interface of Peertube by server administrators (usually `/admin/plugins`).

Click the `Search` tab to search for plugins, make sure the `Plugins` toggle is selected, then type the plugin package name into the searchbar: `peertube-plugin-waasabi` or simply `waasabi` (note the double-"a"-s).


## Configuration

After installation, the plugin can be configured by clicking the *"Settings"* button in the Peertube admin interface next to the plugin's name. The following settings are configurable:

- **Waasabi endpoint URL:**  
  The endpoint URL to send the webhook requests to when the status of a live video has changed. Please note that if there are multiple users registered on the server, status changes will be sent for *every* user, and filtering will happen on Waasabi's side (discarding requests that don't have corresponding `livestream` session configured in Waasabi).
- **Waasabi webhook secret:**  
  The shared secret that is used to encode and validate the Webhook requests. This plugin generates HMAC-SHA-256 authentication codes for the message payload, that is checked on the receiving end by Waasabi to avoid tampering and forged requests.

![Screenshot of the plugin settings page](https://waasabi.org/code/peertube-plugin-waasabi/docs/plugin-config.png)
