const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {getSettings} = require('./settings')
const config = require("./config_default.json");
const fs = require('fs');


const formatConfigs = (settings) => {


    const formatPreLaunch = () => {
        const preLaunch = {...config}
        preLaunch.price = settings.mintPrice
        preLaunch.number = settings.supply
        preLaunch.creators = [...settings.creators]
        preLaunch.solTreasuryAccount = settings.treasuryWallet
        preLaunch.whitelistMintSettings.mint = settings.whiteListToken
        preLaunch.sellerFeeBasisPoints = settings.royalty
        preLaunch.symbol = settings.symbol
        return preLaunch
    }

    const formatLaunch = (preLaunchConf) => {
        const launch = {...preLaunchConf}
        launch.goLiveDate = settings.mintDate
        return launch

    }

    const preLaunchConfig = formatPreLaunch();
    const launchConfig = formatLaunch(preLaunchConfig);

    return [preLaunchConfig, launchConfig]
}

const validateAssets = async () => {
    console.log('Validating Assets: [$ sugar validate ./assets]\n--------')
    const {stdout, stderr} = await exec('sugar validate ./assets');
    if (stdout.indexOf('Validation complete,') === -1) {
        throw (stderr)
    } else {
        console.log(`Sugar Validate Response:\n${stdout}`)
        return true
    }
}

const main = async () => {

    const valid = await validateAssets();

    let settings = await getSettings();
    console.log(settings)

    let [preLaunch, launch] = formatConfigs(settings)

    let data = JSON.stringify(preLaunch);
    fs.writeFileSync('./config-pre.json', data);

    data = JSON.stringify(launch);
    fs.writeFileSync('./config-post.json', data);

    console.log('✅ Configuration Generation Complete!')
    console.log('--------------\n')
    console.log('To Deploy Candy Machine : Run `$ node deployCollection.js` to launch the disabled candy machine.')
    console.log('When White List is Ready: Run `$ node deployCollection.js` again & select option 3 to launch the live candy machine.\n')
    console.log('--------------')

}

main().then(null)




// 3StFdZpqVSKwmHJPkMzHb4LsvyTaR9Ffjq6LsBgpeAku
// 5jpUmsn5UeTHeo2ubDyhaajw5MXiQgmjammY6EE7eF4J
// EcbfPxbYMeuNAKq931d89K4vsdPvcMv2jkC4ThHiJ3ja - Devnet
//




