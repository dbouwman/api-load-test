// load config (username/password/portalurl)
require('dotenv').config()
// ensures fetch is available as a global
require("cross-fetch/polyfill");
require("isomorphic-form-data");
const {batch, uploadResourcesFromUrl} = require('@esri/hub-common');

const path = require('path');
const fs = require('fs');

const { UserSession } = require('@esri/arcgis-rest-auth');
const { createItem, addItemResource, updateItem, getItemResources } = require('@esri/arcgis-rest-portal');

const username = process.env.AGOUSERNAME;
const password = process.env.PASSWORD;
const portal = process.env.PORTAL

const RESOURCEFOLDER = 'small-resources';

// 
let batchSize = parseInt(process.env.BATCHSIZE);
if (process.argv.length >= 3) {
  batchSize = process.argv[2];
}
// Lag between batches
let lag = 0;
if (process.argv.length >= 4) {
  lag = process.argv[3];
}
console.log(`Using Batch size ${batchSize} and Lag of ${lag}`);

// create a session
const session = new UserSession({
  username,
  password,
  portal
});

let createdItemId = ''
let files = [];
// Create a new item to hold the resources
return createHostItem(session, batchSize)
.then((id) => {
  createdItemId = id;
  // give it a thumbnail
  return replaceThumbnail(id, session);
})
.then(() => {
  // get the files from the resources folder, and upload them as resources
  files = getFiles();
  return uploadFiles(files, createdItemId, session, batchSize, lag);
})
.then(() => {
  // ask the API for it's list of resources...
  return getItemResources(createdItemId, {authentication: session});
})
.then((response) => {
  // compare the item's resources to the files we originally uploaded
  console.log(`AGO Reports the item has ${response.resources.length} resources, and we uploaded ${files.length} resources`);
  console.log('--------------- Missing Files --------------')
  const resources = response.resources.map(r => r.resource);
  files.forEach(f => {
    if (resources.indexOf(f) === -1) {
      console.log(`Error: File: ${f} was not found in resources`);
    }
  })

});


function getFiles () {
  return fs.readdirSync(path.join(__dirname, RESOURCEFOLDER));
}

function replaceThumbnail(itemId, authentication) {
  return updateItem({
    item: {
      id: itemId
    },
    authentication,
    params: {
      thumbnail: fs.createReadStream(`./item-thumbnail-2.png`)
    }
  })
  .then((resp) => {
    console.log(`Updated Thumbnail: `, resp);
  })
  .catch((ex) => {
    console.log(`Error updating thumbnail: `, ex);
  })
}

function createHostItem(session, batchSize) {
  return createItem({
    item: {
      type: 'Web Mapping Application',
      title: `Resource Upload Test - x${batchSize}`,
      owner: username,
      tags: ['test'],
      typeKeywords: ['resourceTest']
    },
    authentication: session,
    params: {
      thumbnail: fs.createReadStream(`./item-thumbnail.jpg`)
    }
  })
  .then((resp) => {
    console.log(`Created Host Item ${resp.id}`);
    return resp.id;
  })
  .catch((ex) => {
    console.error(`Error creating hostItem`, ex);
  })
}

function uploadFile(itemId, filename, session) {
  console.info(`Uploading ${filename} to ${itemId}...`);
  let opt = {
    itemId,
    filename,
    filedata: fs.createReadStream(`./${RESOURCEFOLDER}/${filename}`)
  };
  console.info(`...opt created`);
  return uploadResource(opt, session);
}

/**
 * Given a set of files, upload the all to
 * the specified item
 * @param {*} files 
 * @param {*} itemId 
 * @param {*} authentication 
 * @returns 
 */
function uploadFiles (files, itemId, authentication, batchSize, lag) {
  const fileOpts = files.map((filename) => {
    return {
      itemId,
      filename,
      filedata: fs.createReadStream(`./${RESOURCEFOLDER}/${filename}`)
    }
  });
  // partially apply auth and a catch
  const uploadWithAuth = (opts) => {
  return uploadResource(opts, authentication)
    .then((response) => {
      console.log(`Upload of file ${opts.filename} returned success: ${JSON.stringify(response.success)}. Starting ${lag}ms delay before continuing`);
      if (lag) {
        return returnLater(lag, response);
      } else {
        return response;
      }
      
    })
    .catch(e => {
      console.log(`Error uploading resource ${opts.filename} :: ${e.message}`);
      return {success: false};
    });
  };
  return batch(fileOpts, uploadWithAuth, batchSize);
}

function returnLater(delay, value) {
  return new Promise(resolve => setTimeout(resolve, delay, value));
}

/**
 * Upload a single resource to a file
 * @param {object} imgOpts 
 * @param {*} authentication 
 */
function uploadResource(imgOpts, authentication) {
  // console.log(`uploadResource ${imgOpts.filename} to ${imgOpts.itemId}`);
  return addItemResource({
    authentication,
    resource: imgOpts.filedata,
    name: imgOpts.filename,
    id: imgOpts.itemId,
    params: {
      method: 'POST'
    }
  })
  .then((resp) => {
    console.log(`Added ${imgOpts.filename} to item ${imgOpts.itemId}`);
    return resp;
  })
  .catch(ex => {
    console.log(`Error adding ${imgOpts.filename} to item ${imgOpts.itemId} ::${ex.message} `);
    return {success: false};
  })
}


