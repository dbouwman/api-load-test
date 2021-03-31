# Item Resource Test Harness

To run things, clone the repo locally, and run `npm install` in the root.

## Browser Resource Upload Test

1. run `npm run browser`
2. open https://item-resources.surge.sh in a browser
3. enter username, password and portal base url (optionally click Verify Credentials to ensure no typos)
4. Click "Choose Files" and select a large number of files. If you've cloned the repo, use the files in the `small-resources` folder.
5. Click Start Test. You'll see messages in the Output area

If you want to run this locally, you have to open the /browse/index.html file in a browser.

## Node Resource Upload Test

1. copy `.env-example` to `.env`
2. Put real credientials in the file, and optionally change url to point to a different portal instance
3. drop lots of files into the `/resources` folder. All these will be uploaded. Make sure their extensions are valid for item resources.
4. run script via `node index <concurrency> <lag>` i.e. `node index 5`

This will do the following:

- create a "host" item that we will upload resources to
- read the files in `/resources` as fast as possible and immediately fire off promises to upload the files using `addItemResource` from REST-JS
- once all those promises are resolved we then ask the item for it's resources, and check that each file we sent up, is listed

NOTE: this does not currently fetch the resource and verify that it's bit-wise the exact same as what was sent up.
