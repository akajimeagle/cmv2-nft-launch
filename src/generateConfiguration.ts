import { CandyMachineConfig, CandyMachineSettings, Exec } from './types';

const util = require('util');
const exec = util.promisify(require('child_process').exec);
import { getSettings } from './settings'
import config from "../config_default.json"
import { getBool } from './utils';

const fs = import('fs');


const formatConfigs = (settings: CandyMachineSettings) => {


    const formatPreLaunch = () => {
        const preLaunch: CandyMachineConfig = {...config}
        preLaunch.price = settings.mintPrice
        preLaunch.number = settings.supply
        preLaunch.creators = [...settings.creators]
        preLaunch.solTreasuryAccount = settings.treasuryWallet
        preLaunch.whitelistMintSettings.mint = settings.whiteListToken
        preLaunch.sellerFeeBasisPoints = settings.royalty
        preLaunch.symbol = settings.symbol
        return preLaunch
    }

    const formatLaunch = (preLaunchConf: CandyMachineConfig) => {
        const launch = {...preLaunchConf}
        launch.goLiveDate = settings.mintDate
        return launch

    }

    const preLaunchConfig = formatPreLaunch();
    const launchConfig = formatLaunch(preLaunchConfig);

    return [preLaunchConfig, launchConfig]
}

const validateAssets = async () => {
    console.log('Validating Assets: [$ sugar validate ../assets]\n--------')
    const {stdout, stderr} = await exec('sugar validate ./assets');
    if (stdout.indexOf('Validation complete,') === -1) {
        throw (stderr)
    } else {
        console.log(`Sugar Validate Response:\n${stdout}`)
        return true
    }
}


const confirmSettings = async (): Promise<Array<any>> => {
    let rpc: string = await exec('solana config get').then((r: Exec) => r.stdout.split('\n')[1])
    let balance: number = await exec('solana balance').then((r: Exec) => Number(r.stdout.split(' ')[0]));
    let address: string = await exec('solana address').then((r: Exec) => r.stdout)

    console.log(`
Configured Settings
---------------------------------------------------------------------------    
    ${rpc}
    Solana Balance: ${balance}
    Solana Address: ${address}`)
    getBool('Do the following settings look correct?', true)
    return [rpc, balance, address]
}



const main = async () => {

    let rpc, balance, address = await confirmSettings()

    const valid = await validateAssets();

    let settings = await getSettings();
    console.log(settings)

    let [preLaunch, launch] = formatConfigs(settings)

    let data = JSON.stringify(preLaunch);
    (await fs).writeFileSync('./config-pre.json', data);

    data = JSON.stringify(launch);
    (await fs).writeFileSync('./config-post.json', data);

    console.log('✅ Configuration Generation Complete!')
    console.log('--------------\n')
    console.log('To Deploy Candy Machine : Run `$ node deployCollection.ts` to launch the disabled candy machine.')
    console.log('When White List is Ready: Run `$ node deployCollection.ts` again & select option 3 to launch the live candy machine.\n')
    console.log('--------------')
//
}

main().then(null)


