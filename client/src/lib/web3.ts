import { ethers } from 'ethers';

export interface Web3Provider {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

let web3Provider: Web3Provider = {
  provider: null,
  signer: null,
};

export const initializeWeb3 = async (): Promise<Web3Provider> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      web3Provider = { provider, signer };
      return web3Provider;
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      throw error;
    }
  } else {
    throw new Error('MetaMask is not installed');
  }
};

export const getWeb3Provider = (): Web3Provider => {
  return web3Provider;
};

export const switchToNetwork = async (chainId: string) => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      throw new Error('Network not added to MetaMask');
    }
    throw switchError;
  }
};

export const getBalance = async (address: string): Promise<string> => {
  if (!web3Provider.provider) {
    throw new Error('Web3 provider not initialized');
  }

  const balance = await web3Provider.provider.getBalance(address);
  return ethers.formatEther(balance);
};

export const sendTransaction = async (to: string, value: string): Promise<string> => {
  if (!web3Provider.signer) {
    throw new Error('Web3 signer not initialized');
  }

  const tx = await web3Provider.signer.sendTransaction({
    to,
    value: ethers.parseEther(value),
  });

  return tx.hash;
};

// Smart contract interaction utilities
export const getContract = (address: string, abi: any) => {
  if (!web3Provider.signer) {
    throw new Error('Web3 signer not initialized');
  }

  return new ethers.Contract(address, abi, web3Provider.signer);
};

export const deployContract = async (abi: any, bytecode: string, ...args: any[]) => {
  if (!web3Provider.signer) {
    throw new Error('Web3 signer not initialized');
  }

  const contractFactory = new ethers.ContractFactory(abi, bytecode, web3Provider.signer);
  const contract = await contractFactory.deploy(...args);
  await contract.waitForDeployment();
  
  return contract;
};

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
