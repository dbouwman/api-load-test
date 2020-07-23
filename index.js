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



const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const portal = process.env.PORTAL

// create a session
const session = new UserSession({
  username,
  password,
  portal
});

let createdItemId = ''
let files = [];
return createHostItem(session)
.then((id) => {
  createdItemId = id;
  return replaceThumbnail(id, session);
})
.then(() => {
  files = getFiles();
  return uploadFiles(files, createdItemId, session);
})
.then(() => {
  return getItemResources(createdItemId, {authentication: session});
})
.then((response) => {
  // now compare this to the files
  console.log(`AGO Reports the item has ${response.resources.length} resources, and we uploaded ${files.length} resources`);
  const resources = response.resources.map(r => r.resource);
  files.forEach(f => {
    if (resources.indexOf(f) === -1) {
      console.log(`Error: File: ${f} was not found in resources`);
    } else {
      console.log(`File: ${f} was found in resources`);
    }
  })

});


function getFiles () {
  return fs.readdirSync(path.join(__dirname, 'resources'));
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

function createHostItem(session) {
  return createItem({
    item: {
      type: 'Web Mapping Application',
      title: 'Resource Upload Test',
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
    filedata: fs.createReadStream(`./resources/${filename}`)
  };
  console.info(`...opt created`);
  return uploadResource(opt, session);
}


function uploadFiles (files, itemId, authentication) {
  const fileOpts = files.map((filename) => {
    return {
      itemId,
      filename,
      filedata: fs.createReadStream(`./resources/${filename}`)
    }
  });
  // partially apply auth and a catch
  const uploadWithAuth = (opts) => {
    return uploadResource(opts, authentication)
    .catch(e => {
      console.error(`Error uploading resource ${opts.filename} :: ${e.message}`);
      return {success: false};
    });
  };
  return batch(fileOpts, uploadWithAuth, 5)
  // return Promise.all(fileOpts.map((opt) => {
  //   return uploadResource(opt, authentication);
  // }))
  .then((resps) => {
    console.log(`Uploads complete.`);
    resps.forEach((r) => {
      console.log(`   API Response from /addResource: ${r.success}`);
    });
  })
  .catch((err) => {
    console.error(`Caught error: ${err.message}`);
  })

}

/**
 * Upload a single resource to a file
 * @param {object} imgOpts 
 * @param {*} authentication 
 */
function uploadResource(imgOpts, authentication) {
  console.log(`uploadResource ${imgOpts.filename} to ${imgOpts.itemId}`);
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


