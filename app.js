import { contractABI } from './contractABI.js';

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
let signer;
let contract;

async function fetchEtherPrice() {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      const price = data.ethereum.usd;

      document.getElementById('etherPrice').textContent = `$${price.toFixed(2)}`;
    } catch (error) {
      console.error('Error fetching Ether price:', error);
      document.getElementById('etherPrice').textContent = 'Error fetching price';
    }
  }
  
window.addEventListener('load', fetchEtherPrice);

async function loadBalances() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      signer = provider.getSigner();

      const senderAddress = await signer.getAddress();
      document.getElementById('tokenBalance').textContent = 'Loading...';
      document.getElementById('etherBalance').textContent = 'Loading...';
      document.getElementById('gasFee').textContent = 'Loading...';

      contract = new ethers.Contract(contractAddress, contractABI, signer);

      const balance = await contract.balanceOf(senderAddress);
      document.getElementById('tokenBalance').textContent = ethers.utils.formatUnits(balance, 18);

      const etherBalance = await provider.getBalance(senderAddress);
      document.getElementById('etherBalance').textContent = ethers.utils.formatEther(etherBalance);

      const gasLimit = await contract.estimateGas.transfer(senderAddress, 0); // dummy transaction for gas estimation
      const gasPrice = await provider.getGasPrice();
      const estimatedGasFee = gasLimit.mul(gasPrice);
      document.getElementById('gasFee').textContent = ethers.utils.formatEther(estimatedGasFee);
    } catch (error) {
      alert('Error loading balances or gas fee: ' + error.message);
    }
  } else {
    alert('MetaMask is not installed');
  }
}

window.addEventListener('load', loadBalances);


document.getElementById('transferForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const toAddress = document.getElementById('toAddress').value;
  const amount = document.getElementById('amount').value;

  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      signer = provider.getSigner();
      const senderAddress = await signer.getAddress();
      contract = new ethers.Contract(contractAddress, contractABI, signer);

      const balance = await contract.balanceOf(senderAddress);
      if (balance.lt(ethers.utils.parseUnits(amount, 18))) {
        alert('Insufficient token balance');
        return;
      }

      const tx = await contract.transfer(toAddress, ethers.utils.parseUnits(amount, 18));
      
      // Show transaction info
      document.getElementById('transactionHash').textContent = tx.hash;
      document.getElementById('transactionStatus').textContent = 'Pending...';

      // Wait for transaction to be mined
      await tx.wait();
      document.getElementById('transactionStatus').textContent = 'Success';

      // Reveal the transaction info section
      document.querySelector('.transaction-info').style.display = 'block';
    } catch (error) {
      alert('Transaction failed: ' + error.message);
    }
  } else {
    alert('MetaMask is not installed');
  }
});
