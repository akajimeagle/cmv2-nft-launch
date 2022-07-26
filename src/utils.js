const prompt = require('prompt-sync')({sigint: true});

const getPubkey = (promptText) => {
    let pubKey = prompt(promptText);

    if (pubKey.length < 32 || pubKey.length > 44) {
        throw (`Pubkey: ${pubKey} invalid!`)
    }

    return pubKey;
}

const getNumber = (fieldName, promptText) => {
    const num = Number(prompt(promptText))
    if (isNaN(num)) {
        throw(`${fieldName} must be a number!`)
    }
    return num
}

const getBool = (promptText) => {
    const val = prompt(promptText).toString().toUpperCase()
    if (val === 'Y') {
        return true
    } else if (val === 'N') {
        return false
    } else {
        return getBool(promptText)
    }
}

const getNumberedOption = (promptText, options) => {
    console.log(promptText)
    const val = Number(prompt( 'Enter Here: '));
    if (val > options || val < 0 || isNaN(val)) {
        console.log(`Option ${val} is invalid. Please choose [1-${options}]`)
        return getNumberedOption(promptText, options)
    }
    console.log(val)
    return Number(val)

}

module.exports = {getBool, getNumber, getPubkey, getNumberedOption}
