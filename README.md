# 3D_WebGIS_Angular_ESRI


## Description

3D_WebGIS_Angular_ESRI is an Angular 1.x APP which is built with [ESRI API 4.5](https://developers.arcgis.com/javascript/latest/api-reference/index.html) for 3D view and [Leaflet](https://esri.github.io/esri-leaflet/api-reference/) for 2D view.
This Map application is used to visualize spatial information for users' hardware devices, also provides dashboard that allows users to _**register/edit/delete/view**_ their own devices.

## System requirement
You can use 3D_WebGIS_Angular_ESRI in desktop web browsers that support WebGL, a web technology standard for rendering 3D graphics. In addition, your hardware must have a graphics card installed that supports WebGL. Make sure your graphics card has the latest drivers installed and has at least 512 MB of video memory. Your computer hardware needs to have a minimum of 2 GB system memory and 4GB recommended. For best performance, it is recommended that you use the latest versions of Chrome or Firefox and that your graphics card have 1 GB or more of video memory. 3D_WebGIS_Angular_ESRI is not supported on mobile devices.

3D_WebGIS_Angular_ESRI should support the following web browsers (not fully test on all):

Chrome (requires webGL 2)
Firefox
Internet Explorer 11*
Edge*
Safari 9 and later*

Screen size support:

From `1024px * 768px` to `2560px * 1440px`

| Screen size | Marketing Stats Worldwide|
| ------------- |:-------------:|
|   1366x768    | `26.59%` |
| 1920x1080     | `15.65%` |
| 1024x768      | `10.43%` |

Only list top three most widely used screen size

Use the link below to test the webGL version supported by your system.
http://webglreport.com/

## Prerequisites

Install yarn locally, please follow [installation doc](https://yarnpkg.com/lang/en/docs/install/)

Alternatively, run `npm install -g yarn`, which depends on node version.

## Development Setup

1. Clone [this repo](http://207.34.103.155:57990/projects/FRON/repos/map_esri/browse) into your laptop.
2. Go to downloaded folder, run `yarn`
3. Run tests before start developing, run `gulp test` or `npm test`, make sure all passed, otherwise find out who breaks the tests and let him/her fix it.
4. Run `gulp start` or `npm start` to start local server, the server will keep watching files changes and reload page.
5. Please write tests when you create any complex logic and make sure tests are passed before pushing code.

**dev/test config will be applied for running `gulp` or `npm start`, if you want to use prod config, please run `npm run start:prod`**

**If you want to run prod without minify JS file, please run `npm run start:prod --unminified=true`**

**If you want to run prod with Shanghai prod config, please run `npm run start:prod --unminified=true --shanghai=true`**

## Testing

-  Run `npm start` to start local dev environment and do some manual UI testing.
-  Add tests when logic is a bit complex or contains `if-else`, `for`, `while` and etc.
-  Run `npm test` to verify functions are working.

## Dependencies
Now this project is depending on **[WEB API](http://10.10.10.6:7990/projects/BCK/repos/nodejs/browse/webapi)**
and **GeoServer**. We call WEB API node server as it's built based on nodejs, and it will provide realtime data, up-to-date spatial info and user account info. For GeoServer, it will provide both 2D & 3D Map Layer info, e.g. graphic locations, 3D modeling, labels and etc.

Dependencies:

```
node 6.x
npm >= 5.x
yarn >= 1.5.1
```


```
Angular 1.6.x
Bootstrap 3.3.7
ESRI MAP 4.5
JQuery 3.2.1
ESRI Leaflet 1.0.3
```

Tests dependencies: 

```
Karma as test runner
Mocha + Chai + Sinon as testing framework
```


## Deployment & Release

Please see `deployment-notes.md` in `docs/` folder.

## Author
- Victor Gu

