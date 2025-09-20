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
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    throw new Error('Wallet connection is only available in the browser');
  }

  // Check if MetaMask is installed
  if (!window.ethereum) {
    throw new Error('MetaMask wallet is not installed. Please install MetaMask from https://metamask.io/');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your MetaMask wallet.');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    web3Provider = { provider, signer };
    return web3Provider;
  } catch (error: any) {
    console.error('Failed to initialize Web3:', error);
    
    // Handle specific MetaMask errors
    if (error.code === 4001) {
      throw new Error('Connection rejected. Please approve the connection request in MetaMask.');
    } else if (error.code === -32002) {
      throw new Error('Connection request already pending. Please check MetaMask.');
    } else if (error.message?.includes('User rejected')) {
      throw new Error('Connection rejected. Please approve the connection request in MetaMask.');
    } else if (error.message?.includes('already pending')) {
      throw new Error('Connection request already pending. Please check MetaMask.');
    }
    
    // Re-throw the error with a more user-friendly message if it's our custom error
    if (error.message?.includes('MetaMask') || error.message?.includes('accounts')) {
      throw error;
    }
    
    // Generic error for unexpected issues
    throw new Error('Failed to connect wallet. Please make sure MetaMask is unlocked and try again.');
  }
};

export const getWeb3Provider = (): Web3Provider => {
  return web3Provider;
};

export const switchToNetwork = async (chainId: string) => {
  if (!window.ethereum) {
    throw new Error('MetaMask wallet is not installed. Please install MetaMask from https://metamask.io/');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      throw new Error('This network is not added to your MetaMask. Please add it manually.');
    } else if (switchError.code === 4001) {
      throw new Error('Network switch rejected. Please approve the network switch in MetaMask.');
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
