import { ethers } from "./ehter.js";
import { abi, contractAddress } from "./constants.js";
const connectBtn = document.getElementById("connectBtn");
const fundBtn = document.getElementById("fund");
const balance = document.getElementById("balance");
const withdraw = document.getElementById("withdraw");
connectBtn.onclick = connect;
fundBtn.onclick = fund;
balance.onclick = getBlance;
withdraw.onclick = withdrawFunds;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      document.getElementById("connectBtn").innerHTML = "connected!";
    } catch (error) {
      console.log(error.message);
    }

    console.log("there is a metemask");
  } else {
    document.getElementById("connectBtn").innerHTML =
      "Please install metamask!";
  }
}

async function getBlance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance.toString()));
  }
}

async function fund() {
  const ethAmount = document.getElementById("eth").value;
  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const txRes = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(txRes, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}

async function withdrawFunds() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txRes = await contract.withdraw();
      await listenForTransactionMine(txRes, provider);
    } catch (error) {
      console.log(error.message);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations. `
      );
      resolve();
    });
  });
}
