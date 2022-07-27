import { CandyMachineConfig, CandyMachineSettings, Exec } from './types';

const util = require('util');
const exec = util.promisify(require('child_process').exec);
import { getSettings } from './settings'
import config from "../config_default.json"
import { getBool } from './utils';

const fs = import('fs');


const formatConfigs = (settings: CandyMachineSettings) => {


    const launch: CandyMachineConfig = {...config}
    launch.price = settings.mintPrice
    launch.number = settings.supply
    launch.creators = [...settings.creators]
    launch.solTreasuryAccount = settings.treasuryWallet
    launch.whitelistMintSettings = null
    launch.sellerFeeBasisPoints = settings.royalty
    launch.symbol = settings.symbol
    launch.goLiveDate = settings.mintDate
    return launch

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

    await confirmSettings()

    await validateAssets();

    let settings = await getSettings();

    let launch = formatConfigs(settings)

    let data = JSON.stringify(launch);
    (await fs).writeFileSync('./config.json', data);

    console.log('✅ Configuration Generation Complete!')
    console.log('--------------\n')
    console.log('To Deploy Candy Machine : Run `npm run deploy` to launch the candy machine.')
    console.log('--------------')

}

main().then(null)


