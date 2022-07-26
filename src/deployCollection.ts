const util = require('util');
const exec = util.promisify(require('child_process').exec);
const exec_sync = require('child_process').exec;
const config = require("../config-pre.json");
const fs = require('fs');
const {getNumberedOption, getBool} = require('./utils');

const getStringBetween = (str: string, startSub: string, endSub: string) => {
    let strIndex = str.indexOf(startSub) + startSub.length;
    let cmStr = str.substring(strIndex, str.length)
    let result = cmStr.substring(0, cmStr.indexOf(endSub))
    return result.trim()
}

const upload = async () => {
    console.log('Uploading Assets. This might take a while... `$ sugar upload ./assets -c ./config-pre.json`')
    const {stdout, stderr} = await exec('sugar upload ./assets -c ./config-pre.json');

    const total = Math.round((config.number + 1)).toString()

    if (stdout.indexOf(`${total}/${total}`) === -1) {
        throw (stderr)
    } else {
        console.log('Assets Successfully Uploaded.');
        console.log(stdout);
        return true
    }
}

const deploy = async () => {
    const success = '✅ Command successful'
    const deployedAlready = 'Collection mint already deployed.'
    const bashScript = 'sugar deploy -c ./config-pre.json'

    console.log(`Deploying CM. This might take a while... \`${bashScript}\``)
    const {stdout, stderr} = await exec(bashScript);

    if (stdout.indexOf(success) === -1) {
        console.log('Failed! Re-run this script or sugar deploy -c ./config-pre.json')
        throw(stderr)
    }

    const candyMachineID = getStringBetween(stdout, 'Candy machine ID: ', '\n')

    if (stdout.indexOf(deployedAlready) !== -1) {
        console.log(`CM Already Deployed: ${candyMachineID}`)
        return 0;
    }

    const collectionId = getStringBetween(stdout, 'Collection mint ID: ', '\n')

    if (candyMachineID.length <= 0 || collectionId.length <= 0) {
        throw(stderr)
    }

    const data = {
        "CANDY_MACHINE_ID": candyMachineID,
        "COLLECTION_ID": collectionId,
    }

    let jsonData = JSON.stringify(data);
    fs.writeFileSync('./candy-machine.json', jsonData);

    console.log('Successfully Deployed Candy Machine - Settings Saved to ./candy-machine.json')
    console.log(data)

    return

}

const handleUpdate = async (option: number) => {

    let updateDefault = "sugar update -c ../config-pre.json"
    let updateLive = "sugar update -c ../config-post.json"

    // Cancel
    if (option === 1) {
        return Promise.resolve()
    }

    // Update Default
    else if (option === 2) {
        console.log('Updating with `./config-pre.json`')
        exec_sync(updateDefault, (err: string, stdout: string, stderr: string) => {
            if (err) {
                //some err occurred
                console.error(err)
            } else {
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            }
        })
    }
    // Go Live
    else if (option === 3) {
        console.log('Updating with `./config-post.json`')
        exec_sync(updateLive, (err: string, stdout: string, stderr: string) => {
            if (err) {
                //some err occurred
                console.error(err)
            } else {
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            }
        })
    } else {
        return Promise.reject(`Option: ${option} unrecognized.`)
    }


}


const deployCM = async () => {
    await upload()
    let status = await deploy()
    let options = ['Cancel', 'Update Candy Machine with ./config-pre.json (Mint Disabled)', 'Update Candy Machine with ./config-post.json (Allow White List Minting):']
    if (status === 0) {
        const promptText = `Candy Machine is already Deployed: Would you like to:

    1: ${options[0]}
    2: ${options[1]}
    3: ${options[2]}
    `
        let option = getNumberedOption(promptText, 3)
        if (!getBool(`You chose: "${options[option - 1]}". Are you sure? (Y/N): `)) {
            console.log('Cancelling')
            await deployCM()
            return
        } else {
            await handleUpdate(option)
            return
        }

    }
}
//
deployCM().then(null);/**/

