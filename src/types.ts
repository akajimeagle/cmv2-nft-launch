type CandyMachineConfig = {
  "price": number | null
  "number": number | null
  "gatekeeper": null,
  "creators": Array<Creator>,
  "solTreasuryAccount": string,
  "splTokenAccount": null,
  "splToken": null,
  "goLiveDate": string | null,
  "endSettings": null,
  "whitelistMintSettings": null,
  "hiddenSettings": null,
  "uploadMethod": string,
  "retainAuthority": boolean,
  "isMutable": boolean,
  "symbol": string,
  "sellerFeeBasisPoints": number | null,
  "awsS3Bucket": null,
  "nftStorageAuthToken": null,
  "shdwStorageAccount": null

}

type CandyMachineSettings = {
    mintPrice: number,
    supply: number,
    mintDate: string,
    treasuryWallet: string,
    creators: Array<Creator>,
    royalty: number,
    symbol: string
}

type Creator = {
    address: string;
    share: number;
};

type Exec ={
    stdout: string,
    stderr: string
}


export {Creator, CandyMachineSettings, CandyMachineConfig, Exec}
