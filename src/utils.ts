import * as process from 'process';

const prompt = require('prompt-sync')({sigint: true});

const getPubkey = (promptText: string): String => {
    let pubKey = prompt(promptText);

    if (pubKey.length < 32 || pubKey.length > 44) {
        throw (`Pubkey: ${pubKey} invalid!`)
    }

    return pubKey;
}

const getNumber = (fieldName: string, promptText: string): Number => {
    const num = Number(prompt(promptText))
    if (isNaN(num)) {
        throw(`${fieldName} must be a number!`)
    }
    return num
}

export const getBool = (promptText: string, breakOnFalse: boolean = false): boolean => {
    const val = prompt(`${promptText} (Y/N): `).toString().toUpperCase()
    if (val === 'Y') {
        return true
    } else if (val === 'N') {
        if (breakOnFalse) {
            console.log('Exiting Peacefully.')
            process.exit(1)
        }
        return false
    } else {
        return getBool(promptText)
    }
}

const getNumberedOption = (promptText: string, options_count: number): number => {
    console.log(promptText)
    const val = Number(prompt('Enter Here: '));
    if (val > options_count || val < 0 || isNaN(val)) {
        console.log(`Option ${val} is invalid. Please choose [1-${options_count}]`)
        return getNumberedOption(promptText, options_count)
    }
    console.log(val)
    return Number(val)

}

export { getNumber, getPubkey, getNumberedOption }
