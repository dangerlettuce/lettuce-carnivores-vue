Debug
Run in terminal:
firebase emulators:start --inspect-functions

Start debug attach in VS Code with this configuration:
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}

Run Locally
npm run serve
In the vue app, edit env to set VITE_EMULATE_FIREBASE_FUNCTIONS to true so that functions are emulated.

Deploy one function:
firebase deploy --only functions:stripeWebhookController
