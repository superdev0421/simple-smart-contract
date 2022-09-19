require("babel-register");
require("babel-polyfill");

const HDWalletProvider = require("truffle-hdwallet-provider");
const MNEMONIC =
  "027c86164e616fba4d0e8eca16cebd62002d8814bf55c52b22cdc598850b2851";
const projectId = "35f3402e9f354c69bb89e591f768cd38";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 0,
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          MNEMONIC,
          `https://ropsten.infura.io/v3/${projectId}`
        ),
      network_id: 3, // Ropsten's id
      gas: 0, //make sure this gas allocation isn't over 4M, which is the max
    },
  },

  contracts_directory: "./src/contracts/",
  contracts_build_directory: "./src/abis/",
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
