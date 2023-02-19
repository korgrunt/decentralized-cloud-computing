const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const bitcoin = require('bitcoinjs-lib');
const unzipper = require('unzipper');
const httpProxy = require('http-proxy');
const axios = require('axios');
const proxy = httpProxy.createProxyServer();



//import * as ecc from 'tiny-secp256k1';


const app = express();
const uploadDir = 'uploads';

// Initialize Lightning wallet
/*
const keyPairHard = bitcoin.ECPair.makeRandom();
const publicKey = keyPairHard.publicKey.toString('hex');
const privateKey = keyPairHard.toWIF();

console.log(publicKey)
console.log(publicKey)
*/

/*
function generateNewAddress(publicKey, privateKey, counter) {
  const keyPair = bitcoin.ECPair.fromPrivateKey(privateKey, { network: bitcoin.networks.bitcoin });
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: bitcoin.networks.bitcoin, });
  const keyPairNext = bitcoin.ECPair.fromPrivateKey(
    Buffer.from(keyPair.privateKey).map((b, i) => b ^ counter[i]), // XOR the key with the counter
    { network: bitcoin.networks.bitcoin }
  );
  const { address: nextAddress } = bitcoin.payments.p2pkh({ pubkey: keyPairNext.publicKey, network: bitcoin.networks.bitcoin });
  return { currentAddress: address, nextAddress };
}

*/

let data = []

const publicKey = "publicKey-address";
const privateKey = "privateKey-address";
// Create wallet.txt file
fs.writeFileSync('wallet.txt', `Public Key: ${publicKey}\nPrivate Key: ${privateKey}`);

// Enable file upload
app.use(fileUpload());

//proxy
app.all('/app-cloud/:appToProxy/:pathToProxy', async (req, res) => {
  console.log(Date.now(), "start");
  const { pathToProxy, appToProxy } = req.params;
  const target = `http://localhost:${appToProxy}/${pathToProxy}`;
  const { body, headers, params, query, method } = req;
  const options = {
    method,
    headers,
    data: body,
    params: query
  };

  try {
    const response = await axios({
      ...options,
      url: target
    });
    console.log(Date.now(), "end");
    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(error.response.status).send(error.response.data);
  }
});

// Health endpoint
app.get('/health', (req, res) => {
  res.send('Server is up!');
});

// Upload endpoint
app.post('/upload', async (req, res) => {
  // Check if file was uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No file was uploaded.');
  }

  const file = req.files.file;
  console.log(file);
  // Check if uploaded file is a zip file
  if (path.extname(file.name) !== '.zip') {
    return res.status(400).send('Only zip files are allowed.');
  }

  // Create a unique identifier for the uploaded file
  const fileId = uuidv4();

  // Create a directory to store the uploaded file
  const fileDir = path.join(uploadDir, fileId);
  fs.mkdirSync(fileDir);

  // Save the uploaded file to disk
  const filePath = path.join(fileDir, file.name);
  file.mv(filePath, (err) => {
    if (err) {
      return res.status(500).send('Error saving file to disk.');
    }
  });

  // Generate a Lightning invoice for the uploaded file
  
  // Store the payment request and file path in a database
  
  // save to database here

  // Return the payment request to the client
  res.send({ 
    payableBtc: "addre",
    payableEth: "addre",
    payableLtc: "addre"
   });
});

// Download endpoint
app.get('/deploy', async (req, res) => {
  const filePath = "./uploads/48de67ca-ab61-4454-94a9-acf164a7bd40/appCloud.zip"
  const fileDir = "./uploads/48de67ca-ab61-4454-94a9-acf164a7bd40/"
  const fileDirApp = "./uploads/48de67ca-ab61-4454-94a9-acf164a7bd40/appCloud/"

    // Run `npm install` in the extracted folder
    console.log("step1")
    exec('npm install', { cwd: fileDirApp }, (err, stdout, stderr) => {
      console.log("step2")
      if (err) {
        console.log("step2 err")
        return res.status(500).send('Error running npm install.');
      }
      console.log("step3")
      // Run `npm run dev` in the extracted folder
      exec('node app.js 7001', { cwd: fileDirApp }, (err, stdout, stderr) => {
        console.log("step4")
        if (err) {
          console.log("step4 err")
          console.log(err)
          return res.status(500).send('Error running npm run dev.');
        }
      
        
      });
      
// after 

setTimeout(() => {
  exec('lsof -i :7001', { cwd: fileDirApp }, (err, stdout, stderr) => {
    console.log("lsof -i :7001 stdout");
    console.log(stdout);
    console.log("step5")
  });

  
  res.send("ok")
}, 3000)



      


    });
  
});


app.get('/', async (req, res) => {
  res.send(`
  <H3>
    endpoints :
  </H3>
    <p>
      get   /health \n
    </p>
    <p>
      post    /upload \n
    </p>
    <p>
      get   /download \n
    </p>
    <p>
      get   / \n
    </p>
`);
});


const port = process.argv[2] || 4500;
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});