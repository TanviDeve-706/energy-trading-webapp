import { useState, useEffect, useCallback } from 'react';
import { initializeWeb3, getBalance } from '@/lib/web3';

export interface WalletState {
  isConnected: boolean;
  account: string | null;
  balance: string | null;
  chainId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    account: null,
    balance: null,
    chainId: null,
    isLoading: false,
    error: null,
  });

  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Check if we're in a browser environment that supports MetaMask
    if (typeof window === 'undefined') {
      const error = new Error('Wallet connection is only available in the browser');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }

    // Check if MetaMask is available (not available in Replit preview iframe)
    if (!window.ethereum) {
      const error = new Error('MetaMask is not available in this window. Please open this app in a new browser tab with MetaMask installed to connect your wallet.');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
    
    try {
      const { provider, signer } = await initializeWeb3();
      
      if (signer && provider) {
        const account = await signer.getAddress();
        const balance = await getBalance(account);
        const network = await provider.getNetwork();
        
        setState({
          isConnected: true,
          account,
          balance,
          chainId: network.chainId.toString(),
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setState({
      isConnected: false,
      account: null,
      balance: null,
      chainId: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const refreshBalance = useCallback(async () => {
    if (state.account) {
      try {
        const balance = await getBalance(state.account);
        setState(prev => ({ ...prev, balance }));
      } catch (error) {
        console.error('Failed to refresh balance:', error);
      }
    }
  }, [state.account]);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, [connectWallet]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== state.account) {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Refresh the connection when chain changes
        connectWallet();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [state.account, connectWallet, disconnectWallet]);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };
}
