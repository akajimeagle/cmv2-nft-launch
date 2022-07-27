const util = require('util');
const exec = util.promisify(require('child_process').exec);
const config = require("../config.json");
const fs = require('fs');
const {getNumberedOption, getBool} = require('./utils');

const getStringBetween = (str: string, startSub: string, endSub: string) => {
    let strIndex = str.indexOf(startSub) + startSub.length;
    let cmStr = str.substring(strIndex, str.length)
    let result = cmStr.substring(0, cmStr.indexOf(endSub))
    return result.trim()
}

const getCluster = () => {
    const options = ['devnet', 'mainnet-beta']
    const res = getNumberedOption('Which cluster are you deploying to?', options)
    return res
}

const runUploadScript = async () => {

    console.log('Uploading Assets. This might take a while... `$ sugar upload ./assets -c ./config.json`')

    const {stdout, stderr} = await exec('sugar upload ./assets -c ./config.json');
    const total = Math.round((config.number + 1)).toString()

    // Log Exec Status
    if (stdout.indexOf(`${total}/${total}`) === -1) {
        throw (stderr)
    } else {
        console.log('Assets Successfully Uploaded.');
        console.log(stdout);
        return true
    }

}

const runDeployScript = async (): Promise<Array<string>> => {
    const success = '✅ Command successful'
    const deployedAlready = 'Collection mint already deployed.'
    const bashScript = 'sugar deploy -c ./config.json'

    console.log(`Deploying CM. This might take a while... \`${bashScript}\``)
    const {stdout, stderr} = await exec(bashScript);

    // Handle Failure
    if (stdout.indexOf(success) === -1) {
        console.log('Failed! Re-run this script or sugar deploy -c ./config.json')
        throw(stderr)
    }

    // Handle Already Deployed
    if (stdout.indexOf(deployedAlready) !== -1) {
        console.log(`CM Already Deployed. Exiting.`)
        process.exit(1);
    }

    const candyMachineID: string = getStringBetween(stdout, 'Candy machine ID: ', '\n')
    const collectionId: string = getStringBetween(stdout, 'Collection mint ID: ', '\n')

    if (candyMachineID.length <= 0 || collectionId.length <= 0) {
        throw(stderr)
    }

    return [candyMachineID, collectionId]

}

const generateEnv = (candyMachineID: string, cluster: string) => {
    let env = `
REACT_APP_CANDY_MACHINE_ID=${candyMachineID}
REACT_APP_SOLANA_NETWORK=${cluster}
REACT_APP_SOLANA_RPC_HOST=${cluster === 'mainnet-beta' ? 'https://api.mainnet-beta.solana.com' : 'https://api.devnet.solana.com'}

REACT_APP_SPL_TOKEN_TO_MINT_NAME=
REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS=

CI=false
`
    fs.writeFile(__dirname + '/../../frontend/.env', env, function (err: Error) {
        if (err) return console.error(err);
    });
}


const startFrontEnd = async () => {
    console.log('Successfully Deployed Candy Machine! Launching frontend site! Visit http://localhost:3000/.')
    const {stdout, stderr} = await exec('cd ../frontend && npm i && npm run start');
    console.log(stdout)
    console.log(stderr)
}

const deployCandyMachine = async () => {

    const cluster = getCluster()
    await runUploadScript()
    let [cmid, collection] = await runDeployScript()
    generateEnv(cmid, cluster)
    await startFrontEnd()

}

deployCandyMachine().then(null)
