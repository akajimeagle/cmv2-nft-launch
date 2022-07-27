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

const getNumberedOption = (promptText: string, options: Array<any>): any => {

    let optionStrings = options.map((i, idx) => {
        return `    ${idx+1}): ${i}`
    })

    let optionString = optionStrings.join('\n')
    console.log(`${promptText}\n--------------------------------\n${optionString}\n`)

    const val = Number(prompt('Enter Here: '));
    if (val > options.length || val < 0 || isNaN(val)) {
        console.log(`Option ${val} is invalid. Please choose [1-${options.length}]`)
        return getNumberedOption(promptText, options)
    }
    let res = options[val-1]
    getBool(`You selected ${res}. Is this correct?`, true)
    return res

}

export { getNumber, getPubkey, getNumberedOption }
