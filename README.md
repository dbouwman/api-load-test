# Portal API Test Harness

This repo is a hack project for ad-hoc portal api load testing

## Resource Upload Test
1) copy `.env-example` to `.env`
2) Put real credientials in the file, and optionally change url to point to a different portal instance
3) drop lots of files into the `/resources` folder. All these will be uploaded. Make sure their extensions are valid for item resources.
4) run script via `node index`

This will do the following:
- create a "host" item that we will upload resources to
- read the files in `/resources` as fast as possible and immediately fire off promises to upload the files using `addItemResource` from REST-JS
- once all those promises are resolved we then ask the item for it's resources, and check that each file we sent up, is listed

NOTE: this does not currently fetch the resource and verify that it's bit-wise the exact same as what was sent up.

Example output
```
(base) ➜  api-load-test git:(master) ✗ node index
Created Host Item 8eaf5971b273466093d794d6e289c499
Updated Thumbnail:  { success: true, id: '8eaf5971b273466093d794d6e289c499' }
uploadResource 30mb.zip to 8eaf5971b273466093d794d6e289c499
uploadResource 49mb.zip to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_0785.JPG to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_0796.JPG to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_0797.JPG to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_0881.JPG to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_1078.JPG to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_3102.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_3103.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_3104.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_3112.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_3118.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_9232.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_9243.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_9251.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_9281.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_9346.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_9362.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource IMG_9367.jpg to 8eaf5971b273466093d794d6e289c499
uploadResource add-files-here.txt to 8eaf5971b273466093d794d6e289c499
Added add-files-here.txt to item 8eaf5971b273466093d794d6e289c499
Added IMG_0797.JPG to item 8eaf5971b273466093d794d6e289c499
Added IMG_0796.JPG to item 8eaf5971b273466093d794d6e289c499
Added IMG_0785.JPG to item 8eaf5971b273466093d794d6e289c499
Added IMG_1078.JPG to item 8eaf5971b273466093d794d6e289c499
Added IMG_9243.jpg to item 8eaf5971b273466093d794d6e289c499
Added IMG_9362.jpg to item 8eaf5971b273466093d794d6e289c499
Added IMG_0881.JPG to item 8eaf5971b273466093d794d6e289c499
Added IMG_9346.jpg to item 8eaf5971b273466093d794d6e289c499
Added IMG_9281.jpg to item 8eaf5971b273466093d794d6e289c499
Added IMG_9251.jpg to item 8eaf5971b273466093d794d6e289c499
Added IMG_9232.jpg to item 8eaf5971b273466093d794d6e289c499
Added IMG_3118.jpg to item 8eaf5971b273466093d794d6e289c499
Added IMG_3112.jpg to item 8eaf5971b273466093d794d6e289c499
Added IMG_9367.jpg to item 8eaf5971b273466093d794d6e289c499
Added IMG_3104.jpg to item 8eaf5971b273466093d794d6e289c499
Added IMG_3102.jpg to item 8eaf5971b273466093d794d6e289c499
Added IMG_3103.jpg to item 8eaf5971b273466093d794d6e289c499
Added 30mb.zip to item 8eaf5971b273466093d794d6e289c499
Added 49mb.zip to item 8eaf5971b273466093d794d6e289c499
Uploads complete.
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
   API Response from /addResource: true
AGO Reports the item has 20 resources, and we uploaded 20 resources
File: 30mb.zip was found in resources
File: 49mb.zip was found in resources
File: IMG_0785.JPG was found in resources
File: IMG_0796.JPG was found in resources
File: IMG_0797.JPG was found in resources
File: IMG_0881.JPG was found in resources
File: IMG_1078.JPG was found in resources
File: IMG_3102.jpg was found in resources
File: IMG_3103.jpg was found in resources
File: IMG_3104.jpg was found in resources
File: IMG_3112.jpg was found in resources
File: IMG_3118.jpg was found in resources
File: IMG_9232.jpg was found in resources
File: IMG_9243.jpg was found in resources
File: IMG_9251.jpg was found in resources
File: IMG_9281.jpg was found in resources
File: IMG_9346.jpg was found in resources
File: IMG_9362.jpg was found in resources
File: IMG_9367.jpg was found in resources
File: add-files-here.txt was found in resources
```