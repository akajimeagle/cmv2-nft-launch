import { Creator, CandyMachineSettings } from './types';

const {getPubkey, getNumber, getBool} = require('./utils');
const collection = require("../assets/collection.json")
const glob = require('glob');
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const datePrompt = require('date-prompt');


const getCreators = (creators: Array<Creator> = [], royalties: number = 0, activeCreator: number = 1): Array<Creator> => {

    let breakTotal = 100

    if (activeCreator === 1) {
        console.log('\n--------')
        console.log('Input Creator Address and Desired Royalties - Royalties Must Add up to 100')
        console.log('Royalties are Whole Numbers Only - Will Be Rounded\n--------\n')
    }

    let creator = getPubkey(`Insert Creator [${activeCreator}]'s Address: `)

    if (creator.length < 32 || creator.length > 44) {
        throw ('Creator Address Invalid!')
    }

    let royalty = Math.round(getNumber('Royalty Percentage', `Insert [${creator}]'s royalty percentage. (Rounded to Nearest Whole Number):  `));

    console.log(`\nCreator ${creator} - Royalties: ${royalty}:`)
    console.log('\n--------\n')

    let totalRoyalties = royalties + royalty

    if (totalRoyalties > breakTotal) {
        throw (`Royalties Total ${totalRoyalties} Invalid - Must add up to 100!`)
    }

    creators.push({
        "address": creator,
        "share": royalty
    })
    let totalCreators = activeCreator + 1;

    if (totalRoyalties === 100) {
        return creators
    } else if (totalRoyalties < 100) {
        return getCreators(creators, totalRoyalties, totalCreators)
    } else {
        throw('Royalties cannot exceed 100.')
    }

}

const getSupplyLength = () => {
}

const getSupply = () => {
    const files = glob.sync('./assets/*.json')
    let collectionIndex = files.indexOf('./assets/collection.json');
    if (collectionIndex !== -1) {
        files.splice(collectionIndex, 1);
    }
    let supply = files.length;
    const valid = getBool(`Supply Found of [${supply}]: Is this correct (Y/N): `)
    if (!valid) {
        throw ('Please validate assets in ./assets folder.')
    }
    return Math.round(supply)
}

const getMintDate = async () => {
    return await datePrompt(`When should the mint go public? (${timeZone} | Military Time)`).then((isoStr: string) => {
        let dateObj = new Date(isoStr)
        dateObj.setSeconds(0, 0);
        let dateValidStr = `${dateObj.toDateString()} - ${dateObj.toLocaleTimeString('en-US', {timeZone: 'America/New_York'})} EST`

        const valid = getBool(`Is ${dateValidStr} correct? (Y/N) `)
        if (!valid) {
            throw (`Mint Date ${dateValidStr} invalid. Halting.`)
        }

        let dateStr = dateObj.toISOString().replace('.000', '')

        return dateStr
    })
        .catch((isoStr: string) => console.log('Aborted with', isoStr))
}

const getRoyaltyPercentage = () => {
    const sellerFee = Math.round(getNumber('Royalty Percentage', 'Enter the royalty percentage for the sale of an NFT. [1111 = 11.11%]: '))
    if (sellerFee < 0 || sellerFee > 10000) {
        throw ('Seller fee must be between [0 and 10000]')
    }

    const royaltyPercent = sellerFee / 100

    if (!getBool(`Royalty Percentage: ${royaltyPercent}%, is this correct? (Y/N) `)) {
        throw (`Royalty Percentage: ${royaltyPercent} incorrect. Halting.`)
    }

    return sellerFee
}

export const getSettings = async () => {

    const mintPrice = getNumber('Mint Price', 'What is your desired mint price? ');
    const supply = getSupply();
    let mintDate = await getMintDate()
    const treasuryWallet = getPubkey('What wallet should recieve mint funds? ')
    const creators = getCreators();
    const sellerBasis = getRoyaltyPercentage();

    const confirmSettings = (): CandyMachineSettings => {
        let sets: CandyMachineSettings = {
            mintPrice: mintPrice,
            supply: supply,
            mintDate: mintDate,
            treasuryWallet: treasuryWallet,
            creators: creators,
            royalty: sellerBasis,
            symbol: getSymbol()
        }
        console.log('Settings Configured\n------')
        console.log(sets)
        console.log('------')

        if (!getBool('Do the above settings look correct? (Y/N): '))
            throw('Settings Incorrect. Program Halted.')

        return sets
    }

    return confirmSettings();
}

const getSymbol = () => {
    const symbol = collection.symbol
    if (symbol.length <= 0) {
        throw ('Symbol must be set in ./assets/collection.json.')
    }
    return symbol
}


