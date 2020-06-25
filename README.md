# Install
Upload the files available on the release page to the following path on your Venafi Server.
C:\Program Files\Venafi\Web\TableauWDC

# Use
To use the Tableau Web Data Connector in Tableau Desktop select the option Web Data Connector from the Data Connections list and enter the url or IP of your Venafi Server followed by TableauWDC (ie. https://<your-venafi-server-url>/TableauWDC to open the connector. Supply your username and password. On the following screen you can define which tables you would like to load.

# How to compile the source code
## Install

Make sure you have node-js v8 or later installed. Then run:

```bash
$ npm install
```

or for automated build environments:
```bash
$ npm ci
```

## Build

### For development

(this will start a devserver)

```bash
$ npm run dev
```

### For production

```bash
$ npm run clean
$ npm run build
```
