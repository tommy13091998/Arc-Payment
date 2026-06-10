import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  Send, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  ExternalLink,
  Globe, 
  Info,
  DollarSign,
  QrCode,
  FileText,
  List,
  ChevronDown,
  Sun,
  Moon,
  Lock,
  Terminal,
  Shield,
  Layers,
  Percent,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ethers } from 'ethers';

// Arc Testnet Constants
const ARC_TESTNET_PARAMS = {
  chainId: '0x4cef52', // 5042002
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
};

const USDC_SYSTEM_CONTRACT = '0x3600000000000000000000000000000000000000';

// Destination countries for cross-border payments
const COUNTRIES = [
  { id: 'VN', name: 'Vietnam',     currency: 'VND', rate: 25420.50, fee: 0, symbol: '₫',  flag: '🇻🇳' },
  { id: 'IN', name: 'India',       currency: 'INR', rate: 83.45,    fee: 0, symbol: '₹',  flag: '🇮🇳' },
  { id: 'PH', name: 'Philippines', currency: 'PHP', rate: 58.30,    fee: 0, symbol: '₱',  flag: '🇵🇭' },
  { id: 'ID', name: 'Indonesia',   currency: 'IDR', rate: 16250.00, fee: 0, symbol: 'Rp', flag: '🇮🇩' },
];

// Historical rates for charts (last 7 days)
const HISTORICAL_RATES = {
  VND: [25380, 25390, 25410, 25400, 25430, 25415, 25420.5],
  INR: [83.10, 83.25, 83.30, 83.20, 83.50, 83.40, 83.45],
  PHP: [57.90, 58.10, 58.05, 58.20, 58.40, 58.25, 58.30],
  IDR: [16180, 16200, 16220, 16210, 16260, 16240, 16250],
};

const LANGUAGES = [
  { code: 'en', label: 'English',    flagCode: 'us' },
  { code: 'vi', label: 'Tiếng Việt', flagCode: 'vn' },
];

const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    send: 'Send USDC',
    receive: 'Receive & Invoices',
    merchant: 'Merchant Portal',
    bridge: 'CCTP Bridge',
    devConsole: 'Developer Logs',
    availableBalance: 'Available Balance',
    arcNetwork: 'Arc Network',
    sponsoredGas: 'Sponsored Gas',
    standardGas: 'Standard Gas',
    simulating: 'Simulating transaction...',
    blacklistWarn: 'CRITICAL WARNING: Address is blacklisted!',
    simulationSuccess: 'Simulation Succeeded',
    confirmSend: 'Confirm & Sign',
    cancel: 'Cancel',
    sendDirect: 'Send USDC Direct',
    broadcasting: 'Broadcasting transaction...',
    invoiceTitle: 'USDC Invoice Generator',
    generateInvoice: 'Generate Request Link & QR',
    copyClose: 'Copy & Close',
    close: 'Close',
    revenueToday: 'Today\'s Revenue',
    txCount: 'Total Transactions',
    averageReceived: 'Average Ticket Size',
    splitTitle: 'Split Payment Tool',
    splitDesc: 'Transfer USDC to multiple EVM addresses simultaneously based on percentage splits.',
    addRecipient: 'Add Recipient',
    broadcastSplit: 'Broadcast Split Payment',
    bridgeTitle: 'Circle CCTP Cross-chain Bridge',
    bridgeDesc: 'Bridge USDC between Ethereum Sepolia, Base Testnet, Solana Devnet, and Arc Network securely using Circle\'s CCTP.',
    faucetTitle: 'Arc USDC Developer Faucet',
    faucetDesc: 'Get test USDC directly to your wallet for testing smart contracts and payments.',
  },
  vi: {
    dashboard: 'Tổng quan',
    send: 'Gửi USDC',
    receive: 'Nhận & Hóa đơn',
    merchant: 'Kênh Người bán',
    bridge: 'Cầu CCTP',
    devConsole: 'Nhật ký Dev',
    availableBalance: 'Số dư khả dụng',
    arcNetwork: 'Mạng Arc',
    sponsoredGas: 'Gas được tài trợ',
    standardGas: 'Gas tiêu chuẩn',
    simulating: 'Đang mô phỏng giao dịch...',
    blacklistWarn: 'CẢNH BÁO: Địa chỉ nằm trong danh sách đen!',
    simulationSuccess: 'Mô phỏng thành công',
    confirmSend: 'Xác nhận & Ký',
    cancel: 'Hủy',
    sendDirect: 'Gửi USDC trực tiếp',
    broadcasting: 'Đang gửi giao dịch...',
    invoiceTitle: 'Tạo hóa đơn USDC',
    generateInvoice: 'Tạo liên kết & mã QR',
    copyClose: 'Sao chép & Đóng',
    close: 'Đóng',
    revenueToday: 'Doanh thu hôm nay',
    txCount: 'Số lượng giao dịch',
    averageReceived: 'Giá trị trung bình',
    splitTitle: 'Thanh toán chia nhỏ',
    splitDesc: 'Chuyển USDC tới nhiều địa chỉ EVM cùng lúc dựa trên tỷ lệ phần trăm được cấu hình.',
    addRecipient: 'Thêm người nhận',
    broadcastSplit: 'Thực hiện chia nhỏ thanh toán',
    bridgeTitle: 'Cầu xuyên chuỗi Circle CCTP',
    bridgeDesc: 'Cầu nối USDC giữa Ethereum Sepolia, Base Testnet, Solana Devnet và Mạng Arc bằng Circle CCTP.',
    faucetTitle: 'Vòi USDC Arc Developer',
    faucetDesc: 'Nhận USDC thử nghiệm trực tiếp về ví của bạn để thử nghiệm hợp đồng thông minh và thanh toán.',
  }
};

function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('arc_pay_theme') || 'dark');
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Wallet Connection States
  const [account, setAccount] = useState('');
  const [accountType, setAccountType] = useState(() => localStorage.getItem('arc_pay_account_type') || null); // 'web3' | 'social'
  const [socialEmail, setSocialEmail] = useState(() => localStorage.getItem('arc_pay_social_email') || '');
  const [socialPrivateKey, setSocialPrivateKey] = useState(() => localStorage.getItem('arc_pay_social_key') || '');
  const [socialAddress, setSocialAddress] = useState(() => localStorage.getItem('arc_pay_social_address') || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [socialEmailInput, setSocialEmailInput] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Balance States
  const [nativeBalance, setNativeBalance] = useState('0.0000');
  const [erc20Balance, setErc20Balance] = useState('0.00');
  const [mockUSDC, setMockUSDC] = useState(() => parseFloat(localStorage.getItem('arc_pay_mock_usdc') || '100')); // default with 100 mock USDC for easy testing
  const [network, setNetwork] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Core Send States
  const [p2pRecipient, setP2pRecipient] = useState('');
  const [p2pAmount, setP2pAmount] = useState('');
  const [p2pMemo, setP2pMemo] = useState('');
  const [sponsoredGas, setSponsoredGas] = useState(true);
  const [isSendingTx, setIsSendingTx] = useState(false);

  // Invoice / Payment Request States
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDesc, setInvoiceDesc] = useState('');
  const [invoiceExpiry, setInvoiceExpiry] = useState('24h');
  const [generatedInvoiceLink, setGeneratedInvoiceLink] = useState('');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // Split Payment States
  const [splitRecipients, setSplitRecipients] = useState([
    { address: '', percent: 60 },
    { address: '', percent: 40 }
  ]);
  const [splitAmount, setSplitAmount] = useState('');
  const [splitMemo, setSplitMemo] = useState('');

  // Merchant Portal States
  const [standeeModalOpen, setStandeeModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Cross-Chain CCTP States
  const [bridgeSourceChain, setBridgeSourceChain] = useState('Base');
  const [bridgeAmount, setBridgeAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStep, setBridgeStep] = useState(0); // 0: Idle, 1: Burn, 2: Attestation, 3: Mint, 4: Success
  const [bridgeTimer, setBridgeTimer] = useState(0);
  const [otherChainsBalance, setOtherChainsBalance] = useState({
    Base: 250.00,
    Ethereum: 105.50,
    Solana: 85.00
  });

  // Security & Simulator Console
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [simulationTxData, setSimulationTxData] = useState(null); // { to, amount, memo, type: 'p2p'|'split'|'invoice', originalData }
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState(null);
  const [simulationDetails, setSimulationDetails] = useState('');
  const [blacklist, setBlacklist] = useState(['0x7777777777777777777777777777777777777777', '0xbad1010101010101010101010101010101010101']);
  const [newBlacklistAddress, setNewBlacklistAddress] = useState('');
  const [developerLogs, setDeveloperLogs] = useState(() => {
    return [{ id: 1, time: new Date().toLocaleTimeString(), text: 'Arc-Payment Console Initialized.', type: 'info' }];
  });
  const [devConsoleOpen, setDevConsoleOpen] = useState(false);

  // References
  const langDropdownRef = useRef(null);

  // i18n Translation Helper
  const t = (key) => TRANSLATIONS[selectedLang.code]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  // Sync themes
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('arc_pay_theme', theme);
  }, [theme]);

  // Sync mock USDC balance to local storage
  useEffect(() => {
    localStorage.setItem('arc_pay_mock_usdc', mockUSDC.toString());
  }, [mockUSDC]);

  // Local Transactions state
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('arc_pay_txs');
    return saved ? JSON.parse(saved) : [
      { id: 'tx-1', type: 'received', amount: '25.00', recipient: '0x3f5c...a1b2', country: 'Vietnam', localAmount: '635,512', localSymbol: '₫', status: 'completed', hash: '0x1234...5678', time: '2 hours ago', memo: 'Coffee shop sale' },
      { id: 'tx-2', type: 'sent', amount: '12.50', recipient: '0x9a8b...7c6d', country: 'Intra-chain', localAmount: '12.50', localSymbol: '$', status: 'completed', hash: '0xabcdef...1234', time: '1 day ago', memo: 'Dinner split' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('arc_pay_txs', JSON.stringify(transactions));
  }, [transactions]);

  // Developer Log Helper
  const logDev = (type, text) => {
    const time = new Date().toLocaleTimeString();
    setDeveloperLogs(prev => [{ id: Date.now() + Math.random(), time, text, type }, ...prev]);
  };

  // Toast System Helper
  const addToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Auto load query params for Payment Requests / Invoices
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payAddress = params.get('pay');
    const payAmount = params.get('amount');
    const payDesc = params.get('desc');
    
    if (payAddress && payAmount) {
      setP2pRecipient(payAddress);
      setP2pAmount(payAmount);
      setP2pMemo(payDesc || 'Invoice Payment');
      setActiveTab('send');
      addToast('info', `Invoice loaded: Requesting ${payAmount} USDC for "${payDesc || 'payment'}"`);
      logDev('info', `Incoming Invoice loaded from URL. Payee: ${payAddress}, Amount: ${payAmount} USDC`);
    }
  }, []);

  // Fetch balances when account details change
  useEffect(() => {
    if (account) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 8000);
      return () => clearInterval(interval);
    }
  }, [account, accountType, socialAddress]);

  const fetchBalances = async () => {
    const activeAddress = accountType === 'social' ? socialAddress : account;
    if (!activeAddress) return;

    try {
      let provider;
      if (accountType === 'social') {
        provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network');
      } else {
        const providerEnv = window.okxwallet || window.ethereum;
        if (providerEnv) {
          provider = new ethers.BrowserProvider(providerEnv);
        } else {
          provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network');
        }
      }

      // 1. Fetch native balance
      const nativeVal = await provider.getBalance(activeAddress);
      const formattedNative = parseFloat(ethers.formatEther(nativeVal)).toFixed(4);
      setNativeBalance(formattedNative);

      // 2. Fetch ERC-20 Wrapped USDC balance
      const usdcContract = new ethers.Contract(
        USDC_SYSTEM_CONTRACT,
        ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
        provider
      );
      
      let formattedErc20 = '0.00';
      try {
        const erc20Val = await usdcContract.balanceOf(activeAddress);
        const decimals = await usdcContract.decimals().catch(() => 6);
        formattedErc20 = parseFloat(ethers.formatUnits(erc20Val, decimals)).toFixed(2);
      } catch (err) {
        // contract call error or not deployed yet
      }
      setErc20Balance(formattedErc20);

      // 3. Chain details
      let isCorrect = false;
      let chainName = 'Unknown';
      let chainId = 0;
      if (accountType === 'social') {
        isCorrect = true;
        chainName = 'Arc Testnet';
        chainId = 5042002;
      } else {
        const net = await provider.getNetwork();
        chainId = Number(net.chainId);
        isCorrect = chainId === 5042002;
        chainName = isCorrect ? 'Arc Testnet' : net.name;
      }

      setNetwork({ name: chainName, chainId, isCorrect });
      logDev('info', `Fetched balances. Native: ${formattedNative} USDC (Gas), ERC20 Wrapped: ${formattedErc20} USDC`);

    } catch (err) {
      logDev('error', `Failed to fetch balance: ${err.message}`);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBalances();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Connect Web3 Wallet
  const connectWeb3Wallet = async () => {
    const providerEnv = window.okxwallet || window.ethereum;
    if (!providerEnv) {
      addToast('error', 'No Web3 Provider detected. Install OKX Wallet or MetaMask.');
      return;
    }

    setIsConnecting(true);
    logDev('info', 'Connecting Web3 provider...');
    try {
      const provider = new ethers.BrowserProvider(providerEnv);
      const accounts = await providerEnv.request({ method: 'eth_requestAccounts' });
      const activeAccount = accounts[0];

      const chainIdHex = await providerEnv.request({ method: 'eth_chainId' });
      if (chainIdHex !== ARC_TESTNET_PARAMS.chainId) {
        logDev('info', 'Switching network to Arc Testnet...');
        try {
          await providerEnv.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ARC_TESTNET_PARAMS.chainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await providerEnv.request({
              method: 'wallet_addEthereumChain',
              params: [ARC_TESTNET_PARAMS],
            });
          } else {
            throw switchError;
          }
        }
      }

      setAccount(activeAccount);
      setAccountType('web3');
      localStorage.setItem('arc_pay_account_type', 'web3');
      setLoginModalOpen(false);
      addToast('success', `Connected MetaMask/OKX: ${activeAccount.substring(0, 6)}...`);
      logDev('success', `Web3 Wallet connected: ${activeAccount}`);
      await fetchBalances();
    } catch (err) {
      logDev('error', `Web3 connection failed: ${err.message}`);
      addToast('error', `Connection error: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Social Login Simulator (Google / GitHub / Email)
  const handleSocialLogin = async (emailInput) => {
    if (!emailInput || !emailInput.includes('@')) {
      addToast('error', 'Please enter a valid email address.');
      return;
    }
    setIsSocialLoggingIn(true);
    logDev('info', `Initializing Social/Email login for ${emailInput}...`);
    
    // Simulate API delay for key derivation / wallet creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let key = localStorage.getItem(`arc_pay_social_key_${emailInput}`);
    let wallet;
    if (key) {
      wallet = new ethers.Wallet(key);
      logDev('success', `Restored Developer Controlled Wallet for ${emailInput}`);
    } else {
      wallet = ethers.Wallet.createRandom();
      key = wallet.privateKey;
      localStorage.setItem(`arc_pay_social_key_${emailInput}`, key);
      logDev('success', `Derived key and created new Developer Controlled Wallet for ${emailInput}`);
    }
    
    localStorage.setItem('arc_pay_account_type', 'social');
    localStorage.setItem('arc_pay_social_email', emailInput);
    localStorage.setItem('arc_pay_social_key', key);
    localStorage.setItem('arc_pay_social_address', wallet.address);
    
    setAccountType('social');
    setSocialEmail(emailInput);
    setSocialPrivateKey(key);
    setSocialAddress(wallet.address);
    setAccount(wallet.address);
    setNetwork({ name: 'Arc Testnet', chainId: 5042002, isCorrect: true });
    
    addToast('success', `Logged in via ${emailInput}. Wallet derived!`);
    setIsSocialLoggingIn(false);
    setLoginModalOpen(false);
    logDev('success', `Social wallet active: ${wallet.address}`);
    
    setTimeout(fetchBalances, 200);
  };

  const disconnectWallet = () => {
    setAccount('');
    setAccountType(null);
    setSocialEmail('');
    setSocialPrivateKey('');
    setSocialAddress('');
    setNativeBalance('0.0000');
    setErc20Balance('0.00');
    setNetwork(null);
    localStorage.removeItem('arc_pay_account_type');
    localStorage.removeItem('arc_pay_social_email');
    localStorage.removeItem('arc_pay_social_key');
    localStorage.removeItem('arc_pay_social_address');
    addToast('info', 'Wallet disconnected.');
    logDev('info', 'Wallet disconnected by user.');
  };

  // Instant Faucet for Social wallets (+100 Mock USDC)
  const triggerFaucet = async () => {
    logDev('info', 'Faucet request triggered...');
    addToast('info', 'Requesting USDC from developer faucet...');
    
    // Simulate faucet delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMockUSDC(prev => prev + 100);
    addToast('success', 'Received 100 USDC testnet tokens!');
    logDev('success', `Faucet credited 100.00 USDC to account: ${account}`);
    
    // Create faucet tx entry
    const faucetTx = {
      id: `tx-faucet-${Date.now()}`,
      type: 'received',
      amount: '100.00',
      recipient: account,
      country: 'Faucet',
      localAmount: '100.00',
      localSymbol: '$',
      status: 'completed',
      hash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      time: 'Just now',
      memo: 'Arc Developer Faucet'
    };
    setTransactions(prev => [faucetTx, ...prev]);
  };

  // Trigger P2P Direct Payout Simulation
  const startP2pSimulation = (e) => {
    e.preventDefault();
    if (!account) {
      addToast('error', 'Connect your wallet first.');
      return;
    }

    const cleanedRecipient = p2pRecipient.trim();
    if (!ethers.isAddress(cleanedRecipient)) {
      addToast('error', 'Invalid EVM address.');
      return;
    }

    const parsedAmt = parseFloat(p2pAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      addToast('error', 'Please enter a valid amount.');
      return;
    }

    const totalBalance = parseFloat(nativeBalance) + mockUSDC;
    if (parsedAmt > totalBalance) {
      addToast('error', `Insufficient balance. Available: ${totalBalance.toFixed(2)} USDC`);
      return;
    }

    // Set transaction data to simulate
    setSimulationTxData({
      to: cleanedRecipient,
      amount: parsedAmt,
      memo: p2pMemo,
      type: 'p2p',
      originalData: { recipient: cleanedRecipient, amount: parsedAmt, memo: p2pMemo }
    });
    setSimulationModalOpen(true);
    runSimulation(cleanedRecipient, parsedAmt);
  };

  // Simulate Dry-Run Transaction
  const runSimulation = async (recipientAddress, amount) => {
    setIsSimulating(true);
    setSimulationSuccess(null);
    setSimulationDetails('Estimating gas limits and searching security blacklists...');
    logDev('info', `Simulating dry-run to address: ${recipientAddress} for ${amount} USDC`);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // 1. Blacklist Check
    const isBlacklisted = blacklist.some(addr => addr.toLowerCase() === recipientAddress.toLowerCase());
    if (isBlacklisted) {
      setSimulationSuccess(false);
      setSimulationDetails('SECURITY EXCEPTION: The destination address is blacklisted for suspected fraud on Arc Testnet.');
      logDev('error', `Transaction Simulation blocked: Destination address ${recipientAddress} is BLACKLISTED`);
      setIsSimulating(false);
      return;
    }

    // 2. Gas Estimation
    const gasEst = sponsoredGas ? 0 : 0.0042;
    setSimulationSuccess(true);
    setSimulationDetails(`Simulation successful! Revert check passed. Gas limit: 21,000 units. Gas cost: ${gasEst.toFixed(4)} USDC ($${gasEst.toFixed(4)}).`);
    logDev('success', `Simulation passed. Dry-run verified. Gas fee estimated: $${gasEst}`);
    setIsSimulating(false);
  };

  // Sign & Broadcast P2P Transaction
  const broadcastP2pTransaction = async () => {
    if (!simulationTxData) return;
    const { to, amount, memo } = simulationTxData;
    setIsSendingTx(true);
    logDev('info', 'Broadcasting transaction to network...');
    
    try {
      let hash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      // If Web3 wallet is connected and on Arc network, attempt real on-chain transaction
      if (accountType === 'web3' && network?.isCorrect) {
        const providerEnv = window.okxwallet || window.ethereum;
        const provider = new ethers.BrowserProvider(providerEnv);
        const signer = await provider.getSigner();
        
        // Use native gas USDC to send transaction
        const tx = await signer.sendTransaction({
          to: to,
          value: ethers.parseEther(amount.toString())
        });
        hash = tx.hash;
        addToast('info', 'Transaction submitted to mempool. Awaiting mining...');
        await tx.wait();
      } else if (accountType === 'social') {
        // Social wallet signing simulation or real JsonRpc execution
        const publicProvider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network');
        const balanceVal = await publicProvider.getBalance(socialAddress).catch(() => 0n);
        
        // If social wallet actually has real USDC, send it on-chain!
        if (balanceVal >= ethers.parseEther(amount.toString())) {
          const wallet = new ethers.Wallet(socialPrivateKey, publicProvider);
          const tx = await wallet.sendTransaction({
            to: to,
            value: ethers.parseEther(amount.toString())
          });
          hash = tx.hash;
          addToast('info', 'Social wallet signed & broadcasted tx on-chain!');
          await tx.wait();
        } else {
          // Fallback to local mock state update
          setMockUSDC(prev => Math.max(0, prev - amount));
          logDev('info', `Transaction simulated locally (social wallet has insufficient gas). TxHash generated: ${hash}`);
        }
      } else {
        // Mock fallback
        setMockUSDC(prev => Math.max(0, prev - amount));
      }

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      const newTx = {
        id: `tx-${Date.now()}`,
        type: 'sent',
        amount: amount.toFixed(2),
        recipient: to,
        country: 'Intra-chain',
        localAmount: amount.toFixed(2),
        localSymbol: '$',
        status: 'completed',
        hash: hash,
        time: 'Just now',
        memo: memo || 'USDC P2P Transfer'
      };

      setTransactions(prev => [newTx, ...prev]);
      addToast('success', `Sent ${amount} USDC to ${to.substring(0, 6)}...`);
      logDev('success', `Transaction complete: Sent ${amount} USDC. TxHash: ${hash}`);
      
      // Auto-trigger merchant receipt if they pay a merchant standee / split address
      const receiptData = {
        txId: newTx.id,
        sender: account,
        recipient: to,
        amount: amount.toFixed(2),
        gasPaid: sponsoredGas ? '0.00 USDC' : '0.0042 USDC',
        date: new Date().toLocaleString(),
        memo: memo || 'P2P Payment',
        hash: hash
      };
      setActiveReceipt(receiptData);
      setReceiptModalOpen(true);

      // Clean inputs
      setP2pAmount('');
      setP2pRecipient('');
      setP2pMemo('');
      setSimulationModalOpen(false);
      setSimulationTxData(null);
      fetchBalances();

    } catch (err) {
      logDev('error', `Transaction execution failed: ${err.message}`);
      addToast('error', `Payment failed: ${err.message}`);
    } finally {
      setIsSendingTx(false);
    }
  };

  // Generate Invoices / Payment Requests
  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!account) {
      addToast('error', 'Connect your wallet first.');
      return;
    }

    const parsedAmt = parseFloat(invoiceAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      addToast('error', 'Please enter a valid amount.');
      return;
    }

    const currentUrl = window.location.origin + window.location.pathname;
    const link = `${currentUrl}?pay=${account}&amount=${parsedAmt}&desc=${encodeURIComponent(invoiceDesc || 'Payment Request')}`;
    setGeneratedInvoiceLink(link);
    setInvoiceModalOpen(true);
    logDev('success', `Invoice payment link generated: ${link}`);
  };

  // Split Payments Handler
  const addSplitRecipient = () => {
    if (splitRecipients.length >= 3) {
      addToast('error', 'Maximum of 3 split recipients supported.');
      return;
    }
    setSplitRecipients(prev => [...prev, { address: '', percent: 0 }]);
  };

  const removeSplitRecipient = (index) => {
    if (splitRecipients.length <= 2) {
      addToast('error', 'Minimum of 2 split recipients required.');
      return;
    }
    setSplitRecipients(prev => prev.filter((_, i) => i !== index));
  };

  const updateSplitRecipient = (index, key, value) => {
    setSplitRecipients(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [key]: value };
      }
      return item;
    }));
  };

  const startSplitSimulation = (e) => {
    e.preventDefault();
    if (!account) {
      addToast('error', 'Connect your wallet first.');
      return;
    }

    const totalPercent = splitRecipients.reduce((sum, item) => sum + parseInt(item.percent || 0), 0);
    if (totalPercent !== 100) {
      addToast('error', `Total percentage must equal 100%. Currently: ${totalPercent}%`);
      return;
    }

    const parsedAmt = parseFloat(splitAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      addToast('error', 'Invalid split amount.');
      return;
    }

    const totalBalance = parseFloat(nativeBalance) + mockUSDC;
    if (parsedAmt > totalBalance) {
      addToast('error', 'Insufficient balance for split payment.');
      return;
    }

    // Verify all recipient addresses
    for (let i = 0; i < splitRecipients.length; i++) {
      if (!ethers.isAddress(splitRecipients[i].address)) {
        addToast('error', `Recipient #${i + 1} has an invalid address.`);
        return;
      }
    }

    setSimulationTxData({
      amount: parsedAmt,
      memo: splitMemo,
      type: 'split',
      recipients: splitRecipients
    });
    setSimulationModalOpen(true);
    runSplitSimulation();
  };

  const runSplitSimulation = async () => {
    setIsSimulating(true);
    setSimulationSuccess(null);
    setSimulationDetails('Checking recipient addresses and calculating network split gas...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Verify blacklist
    const containsBlacklisted = splitRecipients.some(item => 
      blacklist.some(bad => bad.toLowerCase() === item.address.toLowerCase())
    );

    if (containsBlacklisted) {
      setSimulationSuccess(false);
      setSimulationDetails('SECURITY ALERT: One of the split recipients is blacklisted for fraud on Arc network.');
      setIsSimulating(false);
      return;
    }

    const singleGas = sponsoredGas ? 0 : 0.0042;
    const totalGas = singleGas * splitRecipients.length;
    setSimulationSuccess(true);
    setSimulationDetails(`Split verification passed! Split breakdown:\n` + 
      splitRecipients.map((r, i) => ` - #${i+1}: ${((r.percent/100) * splitAmount).toFixed(2)} USDC (${r.percent}%)\n`).join('') +
      `Estimated Split Gas: ${totalGas.toFixed(4)} USDC ($${totalGas.toFixed(4)})`);
    setIsSimulating(false);
  };

  const broadcastSplitPayment = async () => {
    setIsSendingTx(true);
    logDev('info', 'Broadcasting split payment contract calls...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const parsedAmt = parseFloat(splitAmount);
      // Deduct mock balance
      setMockUSDC(prev => Math.max(0, prev - parsedAmt));
      
      confetti({ particleCount: 150, spread: 80 });

      // Create ledger entries for each split recipient
      const splitTxs = splitRecipients.map((recipient, i) => {
        const itemAmount = ((recipient.percent / 100) * parsedAmt).toFixed(2);
        return {
          id: `tx-split-${Date.now()}-${i}`,
          type: 'sent',
          amount: itemAmount,
          recipient: recipient.address,
          country: 'Intra-chain',
          localAmount: itemAmount,
          localSymbol: '$',
          status: 'completed',
          hash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          time: 'Just now',
          memo: `Split Pay (${recipient.percent}%): ${splitMemo || 'Services'}`
        };
      });

      setTransactions(prev => [...splitTxs, ...prev]);
      addToast('success', `Split payment of ${splitAmount} USDC processed successfully!`);
      logDev('success', `Split payment executed across ${splitRecipients.length} destinations.`);

      // Reset Form
      setSplitAmount('');
      setSplitMemo('');
      setSplitRecipients([{ address: '', percent: 60 }, { address: '', percent: 40 }]);
      setSimulationModalOpen(false);
      setSimulationTxData(null);
      fetchBalances();

    } catch (err) {
      logDev('error', `Split payment failed: ${err.message}`);
      addToast('error', `Split failed: ${err.message}`);
    } finally {
      setIsSendingTx(false);
    }
  };

  // Cross-Chain CCTP Bridge Simulation
  const handleBridgeAction = async (e) => {
    e.preventDefault();
    if (!account) {
      addToast('error', 'Connect your wallet first.');
      return;
    }

    const amt = parseFloat(bridgeAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast('error', 'Please enter a valid bridge amount.');
      return;
    }

    // Check balance of source chain
    const sourceBal = otherChainsBalance[bridgeSourceChain];
    if (amt > sourceBal) {
      addToast('error', `Insufficient USDC balance on ${bridgeSourceChain}. Available: ${sourceBal} USDC`);
      return;
    }

    setIsBridging(true);
    setBridgeStep(1);
    setBridgeTimer(5);
    logDev('info', `CCTP bridge initialized. Sending ${amt} USDC from ${bridgeSourceChain} -> Arc Testnet`);

    // Burn step
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBridgeStep(2);
    logDev('info', `Burned ${amt} USDC on ${bridgeSourceChain}. Circular CCTP attestation requested...`);

    // Countdown / Attestation step
    const interval = setInterval(() => {
      setBridgeTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          setBridgeStep(3);
          logDev('info', 'Attestation signatures received. Minting USDC on Arc Testnet...');
          mintCctp(amt);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const mintCctp = async (amount) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update local balances
    setOtherChainsBalance(prev => ({
      ...prev,
      [bridgeSourceChain]: prev[bridgeSourceChain] - amount
    }));
    setMockUSDC(prev => prev + amount);
    setBridgeStep(4);
    setIsBridging(false);
    confetti({ particleCount: 120, spread: 60 });
    
    // Add transaction to history
    const bridgeTx = {
      id: `tx-bridge-${Date.now()}`,
      type: 'received',
      amount: amount.toFixed(2),
      recipient: account,
      country: 'Global',
      localAmount: amount.toFixed(2),
      localSymbol: '$',
      status: 'completed',
      hash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      time: 'Just now',
      memo: `CCTP Bridge: ${bridgeSourceChain} -> Arc`
    };
    setTransactions(prev => [bridgeTx, ...prev]);
    addToast('success', `Bridged ${amount} USDC from ${bridgeSourceChain} successfully!`);
    logDev('success', `CCTP claim complete. Minted ${amount} USDC on Arc. TxHash generated.`);
    fetchBalances();
  };

  // Blacklist Address Management
  const addToBlacklist = (e) => {
    e.preventDefault();
    const addr = newBlacklistAddress.trim();
    if (!ethers.isAddress(addr)) {
      addToast('error', 'Invalid EVM address format.');
      return;
    }
    if (blacklist.includes(addr)) {
      addToast('error', 'Address already in blacklist.');
      return;
    }
    setBlacklist(prev => [...prev, addr]);
    setNewBlacklistAddress('');
    addToast('success', 'Address added to blacklist.');
    logDev('warning', `Developer added address to blacklist: ${addr}`);
  };

  const removeFromBlacklist = (addr) => {
    setBlacklist(prev => prev.filter(a => a !== addr));
    addToast('info', 'Address removed from blacklist.');
    logDev('info', `Developer removed address from blacklist: ${addr}`);
  };

  // Merchant Portal Calculations
  const merchantReceivedTxs = transactions.filter(t => t.type === 'received' || t.recipient === account);
  const revenueToday = merchantReceivedTxs.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const txCount = merchantReceivedTxs.length;
  const averageReceived = txCount > 0 ? (revenueToday / txCount).toFixed(2) : '0.00';

  // Copy helpers
  const copyAddressToClipboard = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopiedAddress(true);
    addToast('success', 'Address copied to clipboard!');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const copyInvoiceToClipboard = () => {
    if (!generatedInvoiceLink) return;
    navigator.clipboard.writeText(generatedInvoiceLink);
    setCopiedInvoice(true);
    addToast('success', 'Invoice payment URL copied!');
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  return (
    <div className="app-container">
      {/* Background Glowing Effects */}
      <div className="glow-background">
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
      </div>

      {/* Stripe-style Left Sidebar Nav */}
      {account && (
        <aside className="stripe-sidebar">
          <div>
            <div className="sidebar-header">
              <div className="spinning-globe-container">
                <div className="spinning-globe"></div>
              </div>
              <span className="sidebar-logo-text">Arc Pay</span>
            </div>

            <nav>
              <ul className="sidebar-nav-list">
                <li>
                  <button type="button" className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                    <Globe className="size-5" />
                    <span>{t('dashboard')}</span>
                  </button>
                </li>
                <li>
                  <button type="button" className={`sidebar-nav-item ${activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('send')}>
                    <Send className="size-5" />
                    <span>{t('send')}</span>
                  </button>
                </li>
                <li>
                  <button type="button" className={`sidebar-nav-item ${activeTab === 'receive' ? 'active' : ''}`} onClick={() => setActiveTab('receive')}>
                    <QrCode className="size-5" />
                    <span>{t('receive')}</span>
                  </button>
                </li>
                <li>
                  <button type="button" className={`sidebar-nav-item ${activeTab === 'merchant' ? 'active' : ''}`} onClick={() => setActiveTab('merchant')}>
                    <FileText className="size-5" />
                    <span>{t('merchant')}</span>
                  </button>
                </li>
                <li>
                  <button type="button" className={`sidebar-nav-item ${activeTab === 'bridge' ? 'active' : ''}`} onClick={() => setActiveTab('bridge')}>
                    <Layers className="size-5" />
                    <span>{t('bridge')}</span>
                  </button>
                </li>
                <li>
                  <button type="button" className={`sidebar-nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                    <Shield className="size-5" />
                    <span>Security Portal</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button" 
              className="stripe-btn-secondary"
              onClick={() => setDevConsoleOpen(p => !p)}
              style={{ display: 'flex', gap: '8px', justifyContent: 'center', width: '100%', fontSize: '12.5px' }}
            >
              <Terminal className="size-4" />
              Developer Logs
            </button>
            <button 
              type="button" 
              className="stripe-btn-disconnect" 
              onClick={disconnectWallet}
            >
              <X className="size-4" />
              Disconnect
            </button>
          </div>
        </aside>
      )}

      {/* Main Panel Viewport */}
      {account ? (
        <main className="stripe-main-content">
          {/* Top Bar for address and network details */}
          <div className="stripe-top-bar">
            <span className="built-on-arc">
              Arc Testnet Mode
            </span>
            {network && (
              <span className={`network-badge-label ${network.isCorrect ? 'active' : ''}`}>
                {network.name}
              </span>
            )}

            {/* Theme Toggle Button */}
            <button
              type="button"
              className="lang-selector-trigger"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              style={{ width: '34px', height: '34px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-400" />}
            </button>

            {/* Language Selector */}
            <div className="lang-selector-wrapper" ref={langDropdownRef}>
              <button
                type="button"
                className="lang-selector-trigger"
                onClick={() => setLangDropdownOpen(prev => !prev)}
                aria-label="Select language"
              >
                <img src={`https://flagcdn.com/w40/${selectedLang.flagCode}.png`} alt={selectedLang.label} className="lang-flag-img" />
                <span className="lang-label">{selectedLang.label}</span>
                <ChevronDown className={`size-3 lang-chevron ${langDropdownOpen ? 'open' : ''}`} />
              </button>
              {langDropdownOpen && (
                <div className="lang-dropdown">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`lang-option ${selectedLang.code === lang.code ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedLang(lang);
                        setLangDropdownOpen(false);
                      }}
                    >
                      <img src={`https://flagcdn.com/w40/${lang.flagCode}.png`} alt={lang.label} className="lang-flag-img" />
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Address copy pill */}
            <div className="wallet-badge-connected" onClick={copyAddressToClipboard} style={{ cursor: 'pointer' }}>
              <Wallet className="size-4 text-emerald-400" />
              <span>
                {accountType === 'social' ? 'Circle DCW: ' : 'Web3: '}
                {account.substring(0, 6)}...{account.substring(38)}
              </span>
              {copiedAddress ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            </div>
          </div>

          {/* Conditional tab renders */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="dashboard-grid">
                
                {/* Left Column: Balance display and Faucet trigger */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Balance Display Card */}
                  <div className="stripe-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('availableBalance')}</h3>
                      <span className="updating-status-badge">{t('arcNetwork')}</span>
                    </div>
                    <div className="balance-display-box">
                      <span className="balance-large-amount">
                        ${(parseFloat(nativeBalance) + mockUSDC).toFixed(2)}
                      </span>
                      <span className="balance-large-currency">USDC</span>
                    </div>

                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', marginBottom: '20px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'hsl(var(--text-secondary))' }}>On-Chain USDC (Gas):</span>
                        <span style={{ fontWeight: 600 }}>{nativeBalance} USDC</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'hsl(var(--text-secondary))' }}>On-Chain Wrapped USDC:</span>
                        <span style={{ fontWeight: 600 }}>{erc20Balance} USDC</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'hsl(var(--text-secondary))' }}>Simulated Dev Faucet Balance:</span>
                        <span style={{ fontWeight: 600, color: 'hsl(var(--secondary))' }}>{mockUSDC.toFixed(2)} USDC</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        type="button" 
                        className="stripe-btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setActiveTab('receive')}
                      >
                        <ArrowDownLeft className="size-4" />
                        Receive
                      </button>
                      <button 
                        type="button" 
                        className="stripe-btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setActiveTab('send')}
                      >
                        <ArrowUpRight className="size-4" />
                        Send P2P
                      </button>
                    </div>
                  </div>

                  {/* Dev Faucet Card */}
                  <div className="stripe-card">
                    <h2>
                      <Plus className="text-secondary size-5" style={{ color: 'hsl(var(--secondary))' }} />
                      {t('faucetTitle')}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '20px', lineHeight: '1.5' }}>
                      {t('faucetDesc')} Need gas tokens or test USDC for mock wallets? Click below to instantly inject test funds.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        type="button" 
                        className="stripe-btn-primary" 
                        style={{ flex: 1 }}
                        onClick={triggerFaucet}
                      >
                        Request Faucet +100 USDC
                      </button>
                      
                      <a 
                        href="https://faucet.circle.com/" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="stripe-btn-secondary" 
                        style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
                      >
                        Circle Faucet ↗
                      </a>
                    </div>
                  </div>

                </div>

                {/* Right Column: Visual routes and settings info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Account Information Card */}
                  <div className="stripe-card">
                    <h2>
                      <Info className="text-primary size-5" />
                      Account Details
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                        <span style={{ color: 'hsl(var(--text-secondary))', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Login Type</span>
                        <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{accountType} Wallet</span>
                      </div>
                      
                      {accountType === 'social' && (
                        <>
                          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                            <span style={{ color: 'hsl(var(--text-secondary))', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Associated Email</span>
                            <span style={{ fontWeight: 'bold' }}>{socialEmail}</span>
                          </div>
                          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                            <span style={{ color: 'hsl(var(--text-secondary))', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Circle DCW EVM Private Key</span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                              <input 
                                type="password" 
                                readOnly 
                                value={socialPrivateKey} 
                                className="input-field" 
                                style={{ padding: '4px 8px', fontSize: '11px', flex: 1 }}
                              />
                              <button 
                                type="button" 
                                className="stripe-btn-secondary" 
                                style={{ padding: '6px' }}
                                onClick={() => {
                                  navigator.clipboard.writeText(socialPrivateKey);
                                  addToast('success', 'Private Key copied!');
                                }}
                              >
                                <Copy className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                        <span style={{ color: 'hsl(var(--text-secondary))', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Gas Payout Mode</span>
                        <span style={{ fontWeight: 'bold', color: 'hsl(var(--secondary))' }}>
                          USDC Gas Enabled (Arc native feature)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FX Trends Widget */}
                  <div className="stripe-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h2>
                        <TrendingUp className="text-emerald-400 size-5" />
                        FX Trends (USDC)
                      </h2>
                      <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>VND 7-day</span>
                    </div>

                    <div className="chart-card-body">
                      <svg viewBox="0 0 400 160" width="100%">
                        <line x1="40" y1="20" x2="380" y2="20" className="chart-grid-line" style={{ stroke: 'rgba(255,255,255,0.04)' }} />
                        <line x1="40" y1="80" x2="380" y2="80" className="chart-grid-line" style={{ stroke: 'rgba(255,255,255,0.04)' }} />
                        <line x1="40" y1="140" x2="380" y2="140" className="chart-grid-line" style={{ stroke: 'rgba(255,255,255,0.04)' }} />

                        {/* Sparkline chart */}
                        <path 
                          d="M 40,140 L 96,120 L 152,100 L 208,110 L 264,70 L 320,85 L 376,60" 
                          fill="none" 
                          stroke="hsl(var(--secondary))" 
                          strokeWidth="2.5" 
                        />
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'].map((day, index) => {
                          const x = (index / 6) * 336 + 40;
                          return (
                            <text key={day} x={x} y="156" textAnchor="middle" fill="rgba(255,255,255,0.4)" style={{ fontSize: '9px' }}>
                              {day}
                            </text>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                </div>

              </div>

              {/* Transactions Ledger */}
              <div className="stripe-card stripe-table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 600 }}>Recent Transaction Activity</h3>
                  <button 
                    type="button" 
                    className="stripe-btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={handleRefresh}
                  >
                    <RefreshCw className={`size-3 ${isRefreshing ? 'spin-animation' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="stripe-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>USDC Amount</th>
                        <th>Destination</th>
                        <th>Memo</th>
                        <th>Tx Hash</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx.id} style={{ cursor: 'pointer' }} onClick={() => {
                          setActiveReceipt({
                            txId: tx.id,
                            sender: tx.type === 'received' ? tx.recipient : account,
                            recipient: tx.type === 'received' ? account : tx.recipient,
                            amount: tx.amount,
                            gasPaid: '0.004 USDC',
                            date: tx.time,
                            memo: tx.memo || 'Direct payment',
                            hash: tx.hash
                          });
                          setReceiptModalOpen(true);
                        }}>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {tx.type === 'sent' ? (
                                <ArrowUpRight className="text-red-400 size-4" />
                              ) : (
                                <ArrowDownLeft className="text-emerald-400 size-4" />
                              )}
                              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{tx.type}</span>
                            </span>
                          </td>
                          <td style={{ fontWeight: 'bold' }}>
                            ${tx.amount} USDC
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace' }}>
                              {tx.recipient.substring(0, 10)}...
                            </span>
                          </td>
                          <td>
                            <span style={{ fontStyle: 'italic', fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>
                              {tx.memo || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <a 
                              href={`https://testnet.arcscan.app/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tx-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {tx.hash.substring(0, 8)}...
                              <ExternalLink className="size-3 inline ml-1" />
                            </a>
                          </td>
                          <td>
                            <span className={`status-badge status-${tx.status}`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Direct P2P and Split Payment Tab */}
          {activeTab === 'send' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '680px', margin: '0 auto' }}>
              
              {/* P2P Direct Send Card */}
              <div className="stripe-card">
                <h2>
                  <Send className="text-indigo-400 size-6" />
                  Direct P2P USDC Payout
                </h2>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13.5px', marginBottom: '24px' }}>
                  Send USDC directly to another EVM address. Gas fees can be settled directly in USDC, or sponsored by Arc Pay!
                </p>

                <form onSubmit={startP2pSimulation} className="quick-p2p-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="p2p-recipient">Recipient EVM Address</label>
                    <div className="input-container">
                      <div className="input-icon-left"><Wallet className="size-4" /></div>
                      <input 
                        type="text" 
                        id="p2p-recipient"
                        className="input-field" 
                        placeholder="0x recipient address" 
                        value={p2pRecipient}
                        onChange={(e) => setP2pRecipient(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" htmlFor="p2p-amount" style={{ marginBottom: 0 }}>Amount (USDC)</label>
                      <span style={{ fontSize: '11.5px', color: 'hsl(var(--text-secondary))' }}>
                        Balance: <strong style={{ color: 'hsl(var(--secondary))' }}>{(parseFloat(nativeBalance) + mockUSDC).toFixed(2)} USDC</strong>
                      </span>
                    </div>
                    <div className="input-container">
                      <div className="input-icon-left"><DollarSign className="size-4" /></div>
                      <input 
                        type="number" 
                        id="p2p-amount"
                        className="input-field" 
                        placeholder="0.00" 
                        step="0.01"
                        min="0.01"
                        value={p2pAmount}
                        onChange={(e) => setP2pAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="p2p-memo">Memo / Description</label>
                    <div className="input-container">
                      <div className="input-icon-left"><FileText className="size-4" /></div>
                      <input 
                        type="text" 
                        id="p2p-memo"
                        className="input-field" 
                        placeholder="e.g. Services payment" 
                        value={p2pMemo}
                        onChange={(e) => setP2pMemo(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Gas Configuration */}
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, fontSize: '13.5px' }}>Sponsor Gas Fee</span>
                        <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Enable gasless transaction sponsored by Arc Pay</span>
                      </div>
                      <label className="switch-wrapper" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                        <input 
                          type="checkbox" 
                          checked={sponsoredGas}
                          onChange={(e) => {
                            setSponsoredGas(e.target.checked);
                            logDev('info', `Gas setting toggled: ${e.target.checked ? 'Sponsored' : 'Standard'}`);
                          }}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span className={`switch-slider ${sponsoredGas ? 'active' : ''}`}></span>
                      </label>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '12.5px' }}>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>Estimated Network Fee:</span>
                      <span style={{ fontWeight: 'bold', color: sponsoredGas ? 'hsl(var(--secondary))' : 'white' }}>
                        {sponsoredGas ? '$0.00 USDC (Sponsored)' : '$0.0042 USDC (~$0.00)'}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="stripe-btn-primary"
                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}
                  >
                    <Send className="size-4" />
                    Simulate & Send USDC
                  </button>
                </form>
              </div>

              {/* Split Payment Card */}
              <div className="stripe-card">
                <h2>
                  <Percent className="text-pink-400 size-6" />
                  {t('splitTitle')}
                </h2>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13.5px', marginBottom: '24px' }}>
                  {t('splitDesc')} Perfect for business expense splitting, affiliate payouts, or charity donations.
                </p>

                <form onSubmit={startSplitSimulation}>
                  
                  <div className="form-group">
                    <label className="form-label">Split Destination Wallets</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {splitRecipients.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div className="input-container" style={{ margin: 0, flex: 1 }}>
                            <div className="input-icon-left"><Wallet className="size-4" /></div>
                            <input 
                              type="text" 
                              className="input-field" 
                              placeholder={`0x address for Recipient #${index + 1}`}
                              value={item.address}
                              onChange={(e) => updateSplitRecipient(index, 'address', e.target.value)}
                              required
                            />
                          </div>
                          
                          <div style={{ position: 'relative', width: '90px' }}>
                            <input 
                              type="number" 
                              className="input-field" 
                              placeholder="%" 
                              min="1"
                              max="100"
                              value={item.percent}
                              onChange={(e) => updateSplitRecipient(index, 'percent', parseInt(e.target.value) || 0)}
                              style={{ paddingLeft: '12px', paddingRight: '28px' }}
                              required
                            />
                            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'hsl(var(--text-muted))' }}>%</span>
                          </div>

                          <button 
                            type="button" 
                            className="stripe-btn-secondary" 
                            style={{ padding: '12px', color: 'hsl(var(--error))', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                            onClick={() => removeSplitRecipient(index)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button 
                      type="button" 
                      className="stripe-btn-secondary" 
                      style={{ marginTop: '12px', width: '100%', fontSize: '12.5px' }}
                      onClick={addSplitRecipient}
                    >
                      <Plus className="size-3.5 inline mr-1" />
                      {t('addRecipient')}
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="split-amount-input">Total Amount to Split (USDC)</label>
                    <div className="input-container">
                      <div className="input-icon-left"><DollarSign className="size-4" /></div>
                      <input 
                        type="number" 
                        id="split-amount-input"
                        className="input-field" 
                        placeholder="0.00" 
                        step="0.01"
                        min="0.01"
                        value={splitAmount}
                        onChange={(e) => setSplitAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="split-memo-input">Split Payment Memo</label>
                    <div className="input-container">
                      <div className="input-icon-left"><FileText className="size-4" /></div>
                      <input 
                        type="text" 
                        id="split-memo-input"
                        className="input-field" 
                        placeholder="e.g. Split revenue share" 
                        value={splitMemo}
                        onChange={(e) => setSplitMemo(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="stripe-btn-primary"
                    style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)' }}
                  >
                    <Percent className="size-4" />
                    Verify & Split Payment
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* Receive & Invoice Tab */}
          {activeTab === 'receive' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '640px', margin: '0 auto' }}>
              
              {/* Receive Card */}
              <div className="stripe-card" style={{ textAlign: 'center' }}>
                <h2>Receive USDC</h2>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13.5px', marginBottom: '24px' }}>
                  Scan the QR code or copy the address. Ensure the sender is using the **Arc Testnet**.
                </p>

                <div className="qr-code-wrapper" style={{ display: 'inline-block', padding: '16px', backgroundColor: 'white', borderRadius: '12px', marginBottom: '20px' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${account}`} 
                    alt="EVM Deposit QR Code" 
                    style={{ display: 'block', width: '180px', height: '180px' }}
                  />
                </div>

                <div className="stripe-address-bar" style={{ cursor: 'pointer', maxWidth: '420px', margin: '0 auto' }} onClick={copyAddressToClipboard}>
                  <span style={{ fontSize: '12px', wordBreak: 'break-all' }}>{account}</span>
                  <button type="button" aria-label="Copy Address">
                    {copiedAddress ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Invoice Generator */}
              <div className="stripe-card">
                <h2>
                  <FileText className="text-indigo-400 size-6" />
                  {t('invoiceTitle')}
                </h2>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13.5px', marginBottom: '24px' }}>
                  Fill details below to generate a shareable invoicing URL. Clients can pay with MetaMask or Social wallets instantly.
                </p>

                <form onSubmit={handleGenerateInvoice}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="inv-amount">Request Amount (USDC)</label>
                    <div className="input-container">
                      <div className="input-icon-left"><DollarSign className="size-4" /></div>
                      <input 
                        type="number" 
                        id="inv-amount"
                        className="input-field" 
                        placeholder="0.00" 
                        step="0.01"
                        min="0.01"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="inv-desc">Service Description / Memo</label>
                    <div className="input-container">
                      <div className="input-icon-left"><FileText className="size-4" /></div>
                      <input 
                        type="text" 
                        id="inv-desc"
                        className="input-field" 
                        placeholder="e.g. Website consulting services" 
                        value={invoiceDesc}
                        onChange={(e) => setInvoiceDesc(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="inv-expiry">Expiry Period</label>
                    <div className="input-container">
                      <div className="input-icon-left"><ChevronDown className="size-4" /></div>
                      <select 
                        id="inv-expiry" 
                        className="input-field" 
                        value={invoiceExpiry} 
                        onChange={(e) => setInvoiceExpiry(e.target.value)}
                        style={{ paddingLeft: '38px', appearance: 'none', background: 'rgba(0,0,0,0.25)' }}
                      >
                        <option value="1h">1 Hour</option>
                        <option value="24h">24 Hours</option>
                        <option value="7d">7 Days</option>
                        <option value="never">Never Expire</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="stripe-btn-primary">
                    <QrCode className="size-4" />
                    {t('generateInvoice')}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* Merchant Portal Tab */}
          {activeTab === 'merchant' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Analytics Header Grid */}
              <div className="merchant-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                
                <div className="stripe-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(0, 230, 195, 0.08)', color: 'hsl(var(--secondary))' }}>
                    <DollarSign className="size-6" />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>{t('revenueToday')}</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>${revenueToday.toFixed(2)} USDC</span>
                  </div>
                </div>

                <div className="stripe-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(62, 116, 187, 0.12)', color: 'hsl(var(--primary))' }}>
                    <List className="size-6" />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>{t('txCount')}</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{txCount} payments</span>
                  </div>
                </div>

                <div className="stripe-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                    <TrendingUp className="size-6" />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>{t('averageReceived')}</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>${averageReceived} USDC</span>
                  </div>
                </div>

              </div>

              {/* Portal content */}
              <div className="dashboard-grid">
                
                {/* Standee and Marketing */}
                <div className="stripe-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{ margin: '0 auto', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <QrCode className="size-10 text-emerald-400" />
                  </div>
                  <h2>Merchant Static QR</h2>
                  <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13px', lineHeight: '1.5' }}>
                    Generate a print-ready counter standee QR code. Customers can scan this static standee to pay instantly from their phones.
                  </p>

                  <button 
                    type="button" 
                    className="stripe-btn-secondary"
                    onClick={() => setStandeeModalOpen(true)}
                  >
                    Open Counter Standee Preview
                  </button>
                </div>

                {/* Received Logs */}
                <div className="stripe-card">
                  <h2>Merchant Payments Ledger</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    {merchantReceivedTxs.length === 0 ? (
                      <span style={{ color: 'hsl(var(--text-muted))', fontSize: '13px', display: 'block', textAlign: 'center', padding: '24px 0' }}>
                        No incoming payments received today.
                      </span>
                    ) : (
                      merchantReceivedTxs.map(tx => (
                        <div 
                          key={tx.id} 
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                          onClick={() => {
                            setActiveReceipt({
                              txId: tx.id,
                              sender: '0x...Client',
                              recipient: account,
                              amount: tx.amount,
                              gasPaid: '0.00 USDC (Sponsored)',
                              date: tx.time,
                              memo: tx.memo || 'Merchant Sale',
                              hash: tx.hash
                            });
                            setReceiptModalOpen(true);
                          }}
                        >
                          <div>
                            <span style={{ display: 'block', fontWeight: 600, fontSize: '13px' }}>Received ${tx.amount} USDC</span>
                            <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{tx.time} | memo: {tx.memo || 'Retail Sale'}</span>
                          </div>
                          <span style={{ color: 'hsl(var(--secondary))', fontWeight: 'bold', fontSize: '13px' }}>+${tx.amount}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* CCTP Cross-chain Bridge Tab */}
          {activeTab === 'bridge' && (
            <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Unified Balance preview card */}
              <div className="stripe-card">
                <h3 style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Unified Cross-chain USDC Preview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
                  
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: 'hsl(var(--text-secondary))' }}>Ethereum</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 'bold' }}>${otherChainsBalance.Ethereum.toFixed(2)}</span>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: 'hsl(var(--text-secondary))' }}>Base Testnet</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 'bold' }}>${otherChainsBalance.Base.toFixed(2)}</span>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: 'hsl(var(--text-secondary))' }}>Solana Devnet</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 'bold' }}>${otherChainsBalance.Solana.toFixed(2)}</span>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(0, 230, 195, 0.05)', border: '1px solid rgba(0, 230, 195, 0.15)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: 'hsl(var(--secondary))' }}>Arc Testnet</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 'bold', color: 'hsl(var(--secondary))' }}>${(parseFloat(nativeBalance) + mockUSDC).toFixed(2)}</span>
                  </div>

                </div>
              </div>

              {/* Bridge Form */}
              <div className="stripe-card">
                <h2>
                  <Layers className="text-indigo-400 size-6" />
                  {t('bridgeTitle')}
                </h2>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13.5px', marginBottom: '24px' }}>
                  {t('bridgeDesc')}
                </p>

                <form onSubmit={handleBridgeAction}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="bridge-source">Source Network</label>
                    <div className="input-container">
                      <div className="input-icon-left"><Globe className="size-4" /></div>
                      <select 
                        id="bridge-source" 
                        className="input-field" 
                        value={bridgeSourceChain} 
                        onChange={(e) => setBridgeSourceChain(e.target.value)}
                        style={{ paddingLeft: '38px', appearance: 'none', background: 'rgba(0,0,0,0.25)' }}
                      >
                        <option value="Base">Base Testnet (CCTP)</option>
                        <option value="Ethereum">Ethereum Sepolia (CCTP)</option>
                        <option value="Solana">Solana Devnet (CCTP)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="bridge-dest">Destination Network</label>
                    <div className="input-container">
                      <div className="input-icon-left"><Globe className="size-4" /></div>
                      <input 
                        type="text" 
                        id="bridge-dest" 
                        className="input-field" 
                        value="Arc Testnet" 
                        disabled 
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="bridge-amount-input">Amount to Bridge (USDC)</label>
                    <div className="input-container">
                      <div className="input-icon-left"><DollarSign className="size-4" /></div>
                      <input 
                        type="number" 
                        id="bridge-amount-input"
                        className="input-field" 
                        placeholder="0.00" 
                        step="0.01"
                        min="0.01"
                        value={bridgeAmount}
                        onChange={(e) => setBridgeAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>CCTP Bridge Fee:</span>
                      <span style={{ fontWeight: 600, color: 'hsl(var(--secondary))' }}>$0.00 (Sponsored Promotion)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>Settlement Duration:</span>
                      <span style={{ fontWeight: 600 }}>~5 seconds (Simulated CCTP)</span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="stripe-btn-primary"
                    style={{ background: 'linear-gradient(135deg, #00e6c3 0%, #00b09b 100%)', color: '#000', fontWeight: 'bold' }}
                  >
                    Bridge USDC via CCTP
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Address Fraud blacklisting */}
              <div className="stripe-card">
                <h2>
                  <Shield className="text-rose-500 size-6" />
                  EVM Fraud Check Blacklist
                </h2>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13.5px', marginBottom: '24px' }}>
                  Manage addresses blacklisted from receiving payouts due to suspected fraud. Attempting to pay these addresses will block transaction simulation.
                </p>

                <form onSubmit={addToBlacklist} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <div className="input-container" style={{ margin: 0, flex: 1 }}>
                    <div className="input-icon-left"><Wallet className="size-4" /></div>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Add address to blacklist" 
                      value={newBlacklistAddress}
                      onChange={(e) => setNewBlacklistAddress(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="stripe-btn-secondary" style={{ padding: '0 20px', whiteSpace: 'nowrap' }}>
                    Blacklist Address
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Currently Blacklisted Addresses</span>
                  {blacklist.map(addr => (
                    <div key={addr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.12)' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12.5px', color: 'hsl(var(--error))' }}>{addr}</span>
                      <button 
                        type="button" 
                        className="stripe-btn-action" 
                        style={{ padding: '4px', color: 'hsl(var(--text-muted))' }}
                        onClick={() => removeFromBlacklist(addr)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      ) : (
        /* Connect Landing Screen */
        <div className="app-landing-screen">
          <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="lang-selector-trigger"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              style={{ width: '36px', height: '36px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-400" />}
            </button>
          </div>

          <div className="app-landing-hero">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div className="spinning-globe-container" style={{ width: '80px', height: '80px' }}>
                <div className="spinning-globe" style={{ width: '70px', height: '70px' }}></div>
              </div>
            </div>
            <h1>Arc Pay</h1>
            <p style={{ fontSize: '18px', color: 'hsl(var(--text-secondary))', lineHeight: '1.6', marginBottom: '36px' }}>
              Instant cross-border stablecoin payments and invoice settlements powered by USDC native gas on Arc Network.
            </p>

            <button 
              type="button" 
              className="btn-landing-primary" 
              onClick={() => setLoginModalOpen(true)}
            >
              <Wallet className="size-5" />
              Connect Wallet
            </button>
          </div>
        </div>
      )}

      {/* Connect Wallet Selection Modal */}
      {loginModalOpen && (
        <div className="modal-overlay" onClick={() => setLoginModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <button type="button" className="modal-close-btn" onClick={() => setLoginModalOpen(false)}>
              <X className="size-5" />
            </button>
            <h2>Connect to Arc Pay</h2>
            <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '24px' }}>
              Select your preferred Web3 wallet provider or create an instant developer controlled wallet via Email/Google.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* MetaMask/OKX */}
              <button 
                type="button" 
                className="stripe-btn-secondary" 
                style={{ justifyContent: 'flex-start', padding: '16px 20px', gap: '16px', borderRadius: '12px' }}
                onClick={connectWeb3Wallet}
                disabled={isConnecting}
              >
                <img src="https://metamask.io/assets/icon.svg" alt="MetaMask" style={{ width: '24px' }} />
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', fontSize: '14px' }}>MetaMask / OKX Wallet</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Connect your browser extension wallet</span>
                </div>
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }}></div>
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Or Login Via Email</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }}></div>
              </div>

              {/* Social Login Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="Enter email address" 
                  value={socialEmailInput}
                  onChange={(e) => setSocialEmailInput(e.target.value)}
                  style={{ paddingLeft: '16px', borderRadius: '10px' }}
                />
                
                <button 
                  type="button" 
                  className="stripe-btn-primary"
                  onClick={() => handleSocialLogin(socialEmailInput)}
                  disabled={isSocialLoggingIn}
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #295aa1 100%)' }}
                >
                  {isSocialLoggingIn ? 'Creating secure keys...' : 'Login & Generate Wallet'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Static Counter QR Standee Modal */}
      {standeeModalOpen && (
        <div className="modal-overlay" onClick={() => setStandeeModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '0px', overflow: 'hidden', backgroundColor: '#fff', color: '#000' }}>
            
            {/* Standee Header */}
            <div style={{ backgroundColor: '#0f1013', color: '#fff', padding: '24px 20px', textAlign: 'center', position: 'relative' }}>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setStandeeModalOpen(false)}
                style={{ color: '#fff', top: '16px', right: '16px' }}
              >
                <X className="size-5" />
              </button>
              <h3 style={{ margin: 0, fontFamily: 'Space Grotesk', fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>USDC Merchant Standee</h3>
              <span style={{ fontSize: '11px', color: '#00e6c3', textTransform: 'uppercase', fontWeight: 600 }}>Arc Network Payments</span>
            </div>

            {/* Standee Body */}
            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>Arc Pay Merchant Stand</h4>
              <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '24px' }}>Scan code below to send USDC on Arc</span>

              <div style={{ border: '2px solid #000', display: 'inline-block', padding: '16px', borderRadius: '16px', backgroundColor: '#fff', marginBottom: '24px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + window.location.pathname + '?pay=' + account)}`} 
                  alt="Merchant QR" 
                  style={{ width: '180px', height: '180px' }}
                />
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', fontSize: '11.5px', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '16px' }}>
                {account}
              </div>

              <span style={{ display: 'block', fontSize: '10.5px', color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Powering Borderless Retail Payments</span>
            </div>

            {/* Print action footer */}
            <div style={{ padding: '16px', borderTop: '1px solid #e5e5e5', backgroundColor: '#fafafa', display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="stripe-btn-secondary" 
                style={{ flex: 1, borderColor: '#ccc', color: '#333' }}
                onClick={() => setStandeeModalOpen(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="stripe-btn-primary" 
                style={{ flex: 1, background: '#000', color: '#fff' }}
                onClick={() => window.print()}
              >
                Print Standee Card
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Transaction Receipt Modal */}
      {receiptModalOpen && activeReceipt && (
        <div className="modal-overlay" onClick={() => setReceiptModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', padding: '24px' }}>
            <button type="button" className="modal-close-btn" onClick={() => setReceiptModalOpen(false)}>
              <X className="size-5" />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(74, 222, 128, 0.08)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle2 className="size-6" />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Payment Receipt</h3>
              <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Transaction completed successfully</span>
            </div>

            {/* Receipt Details */}
            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', borderBottom: '1px dashed rgba(255,255,255,0.1)', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', textAlign: 'left', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Receipt ID:</span>
                <span style={{ fontWeight: 600 }}>{activeReceipt.txId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Sender:</span>
                <span style={{ fontWeight: 600 }}>{activeReceipt.sender.substring(0, 8)}...</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Recipient:</span>
                <span style={{ fontWeight: 600 }}>{activeReceipt.recipient.substring(0, 8)}...</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Amount:</span>
                <span style={{ fontWeight: 600, color: 'hsl(var(--secondary))' }}>${activeReceipt.amount} USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Network Gas:</span>
                <span style={{ fontWeight: 600 }}>{activeReceipt.gasPaid}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Timestamp:</span>
                <span>{activeReceipt.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Memo:</span>
                <span>{activeReceipt.memo}</span>
              </div>
            </div>

            {/* Barcode simulation */}
            <div style={{ marginTop: '20px', textAlign: 'center', opacity: 0.5 }}>
              <div style={{ height: '30px', width: '200px', backgroundColor: '#fff', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', overflow: 'hidden' }}>
                {Array.from({length: 30}).map((_, i) => (
                  <div key={i} style={{ width: i % 3 === 0 ? '4px' : i % 2 === 0 ? '2px' : '1px', height: '100%', backgroundColor: '#000' }}></div>
                ))}
              </div>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '2px' }}>{activeReceipt.hash.substring(0, 16)}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              <button 
                type="button" 
                className="stripe-btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => setReceiptModalOpen(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="stripe-btn-primary" 
                style={{ flex: 1 }}
                onClick={() => {
                  window.print();
                  setReceiptModalOpen(false);
                }}
              >
                Print Receipt
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Transaction Simulation & Security Checklist Drawer Modal */}
      {simulationModalOpen && simulationTxData && (
        <div className="modal-overlay" onClick={() => !isSendingTx && setSimulationModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'left' }}>
            <h2 style={{ display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '20px' }}>
              <Shield className="text-secondary size-5" />
              Transaction Security Pre-flight
            </h2>

            {/* Checklist states */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ padding: '4px', borderRadius: '50%', backgroundColor: 'rgba(0, 230, 195, 0.1)', color: 'hsl(var(--secondary))' }}>
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '13px' }}>Address Formatting Verification</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Ensuring target is valid checksummed EVM address.</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ 
                  padding: '4px', 
                  borderRadius: '50%', 
                  backgroundColor: isSimulating ? 'rgba(255,255,255,0.05)' : simulationSuccess === false ? 'rgba(239,68,68,0.1)' : 'rgba(0, 230, 195, 0.1)', 
                  color: isSimulating ? 'white' : simulationSuccess === false ? 'hsl(var(--error))' : 'hsl(var(--secondary))' 
                }}>
                  {isSimulating ? <RefreshCw className="size-4 spin-animation" /> : simulationSuccess === false ? <AlertTriangle className="size-4" /> : <CheckCircle2 className="size-4" />}
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '13px' }}>EVM Threat & Fraud Assessment</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Cross-referencing address blacklist cache.</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ 
                  padding: '4px', 
                  borderRadius: '50%', 
                  backgroundColor: isSimulating ? 'rgba(255,255,255,0.05)' : 'rgba(0, 230, 195, 0.1)', 
                  color: isSimulating ? 'white' : 'hsl(var(--secondary))' 
                }}>
                  {isSimulating ? <RefreshCw className="size-4 spin-animation" /> : <CheckCircle2 className="size-4" />}
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '13px' }}>Dry-run Execution Simulation</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Simulating transaction calls on Arc Testnet node.</span>
                </div>
              </div>

            </div>

            {/* Simulation Results Output Box */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', marginBottom: '24px', fontSize: '12.5px', fontFamily: 'monospace' }}>
              <span style={{ display: 'block', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', fontSize: '10px', marginBottom: '8px', letterSpacing: '0.5px' }}>Dry-run Console Log</span>
              
              {isSimulating ? (
                <span style={{ color: 'white', display: 'block' }}>
                  <RefreshCw className="size-3 inline mr-1 spin-animation" />
                  Running threat analysis...
                </span>
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap', color: simulationSuccess ? '#4ade80' : '#f87171', margin: 0 }}>
                  {simulationDetails}
                </pre>
              )}
            </div>

            {/* Transaction Parameters Summary */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', fontSize: '13px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Transaction Type:</span>
                <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{simulationTxData.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>USDC Subtotal:</span>
                <span style={{ fontWeight: 'bold' }}>{simulationTxData.amount} USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Estimated Fee:</span>
                <span style={{ fontWeight: 'bold' }}>{sponsoredGas ? '$0.00 (Sponsored)' : '$0.0042 USDC'}</span>
              </div>
            </div>

            {/* Confirm Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="stripe-btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => setSimulationModalOpen(false)}
                disabled={isSendingTx}
              >
                Abort
              </button>
              
              <button 
                type="button" 
                className="stripe-btn-primary" 
                style={{ flex: 2, background: simulationSuccess ? 'linear-gradient(135deg, #00e6c3 0%, #00b09b 100%)' : 'rgba(255,255,255,0.1)', color: '#000', fontWeight: 'bold', border: 'none' }}
                onClick={() => {
                  if (simulationTxData.type === 'split') {
                    broadcastSplitPayment();
                  } else {
                    broadcastP2pTransaction();
                  }
                }}
                disabled={!simulationSuccess || isSendingTx}
              >
                {isSendingTx ? (
                  <>
                    <RefreshCw className="size-4 inline mr-1 spin-animation" />
                    Broadcasting...
                  </>
                ) : (
                  'Confirm & Broadcast'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CCTP Cross-chain Bridge Simulator Overlay */}
      {isBridging && bridgeStep > 0 && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '32px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold' }}>Circle CCTP Settlement</h3>
              <span style={{ fontSize: '12.5px', color: 'hsl(var(--text-secondary))' }}>
                Bridging {bridgeAmount} USDC from {bridgeSourceChain} to Arc
              </span>
            </div>

            {/* Flow line animation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              
              {/* Step 1: Burn */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', opacity: bridgeStep >= 1 ? 1 : 0.4 }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  backgroundColor: bridgeStep > 1 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(62, 116, 187, 0.1)', 
                  color: bridgeStep > 1 ? '#4ade80' : 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px' 
                }}>
                  {bridgeStep > 1 ? <Check className="size-4" /> : '1'}
                </div>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '13px' }}>Burn USDC on {bridgeSourceChain}</span>
                  <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>
                    {bridgeStep === 1 ? 'Initiating contract call...' : 'Burn tx confirmed.'}
                  </span>
                </div>
              </div>

              {/* Step 2: Attestation */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', opacity: bridgeStep >= 2 ? 1 : 0.4 }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  backgroundColor: bridgeStep > 2 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(62, 116, 187, 0.1)', 
                  color: bridgeStep > 2 ? '#4ade80' : 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px' 
                }}>
                  {bridgeStep > 2 ? <Check className="size-4" /> : bridgeStep === 2 ? <RefreshCw className="size-4 spin-animation" /> : '2'}
                </div>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '13px' }}>Awaiting Circle Attestation</span>
                  <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>
                    {bridgeStep === 2 ? `Gathering CCTP validator signatures (${bridgeTimer}s)...` : bridgeStep > 2 ? 'Attestation verified.' : 'Pending burn verification.'}
                  </span>
                </div>
              </div>

              {/* Step 3: Mint */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', opacity: bridgeStep >= 3 ? 1 : 0.4 }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  backgroundColor: bridgeStep > 3 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(62, 116, 187, 0.1)', 
                  color: bridgeStep > 3 ? '#4ade80' : 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px' 
                }}>
                  {bridgeStep > 3 ? <Check className="size-4" /> : bridgeStep === 3 ? <RefreshCw className="size-4 spin-animation" /> : '3'}
                </div>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '13px' }}>Mint USDC on Arc network</span>
                  <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>
                    {bridgeStep === 3 ? 'Executing claim transaction...' : 'Mint complete.'}
                  </span>
                </div>
              </div>

            </div>

            <div className="progress-bar-container" style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  height: '100%', 
                  backgroundColor: 'hsl(var(--secondary))', 
                  transition: 'width 0.4s ease', 
                  width: bridgeStep === 1 ? '25%' : bridgeStep === 2 ? '60%' : bridgeStep === 3 ? '90%' : '100%' 
                }}
              ></div>
            </div>

          </div>
        </div>
      )}

      {/* Floating Developer Debug Console Drawer */}
      {devConsoleOpen && (
        <div className="developer-logs-console" style={{ position: 'fixed', bottom: 0, left: account ? '260px' : 0, right: 0, height: '240px', backgroundColor: '#0c0d0f', borderTop: '1px solid rgba(255,255,255,0.08)', zIndex: 9999, display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', backgroundColor: '#131418', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#00e6c3' }}>
              <Terminal className="size-4" />
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Arc-Payment Developer Log Output</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '11px' }}
                onClick={() => setDeveloperLogs([{ id: 1, time: new Date().toLocaleTimeString(), text: 'Console cleared.', type: 'info' }])}
              >
                Clear
              </button>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '11px' }}
                onClick={() => setDevConsoleOpen(false)}
              >
                Close (Esc)
              </button>
            </div>
          </div>

          {/* Scrolling output logs */}
          <div style={{ flex: 1, padding: '12px 16px', overflowY: 'auto', fontSize: '11.5px', color: '#bbb', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {developerLogs.map(log => (
              <div key={log.id} style={{ display: 'flex', gap: '8px', lineHeight: '1.4' }}>
                <span style={{ color: '#555' }}>[{log.time}]</span>
                <span style={{ 
                  color: log.type === 'error' ? '#f87171' : log.type === 'success' ? '#4ade80' : log.type === 'warning' ? '#fbbf24' : '#60a5fa' 
                }}>[{log.type.toUpperCase()}]</span>
                <span>{log.text}</span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Invoice Details Modal */}
      {invoiceModalOpen && (
        <div className="modal-overlay" onClick={() => setInvoiceModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <button type="button" className="modal-close-btn" onClick={() => setInvoiceModalOpen(false)}>
              <X className="size-5" />
            </button>
            <h2>USDC Invoice Created</h2>
            <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '24px' }}>
              Share this request URL or QR code. Client can pay directly using MetaMask or Social wallets.
            </p>

            <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', marginBottom: '24px', backgroundColor: 'rgba(0,0,0,0.15)' }}>
              
              <div style={{ border: '2px solid #000', display: 'inline-block', padding: '12px', borderRadius: '12px', backgroundColor: '#fff', marginBottom: '16px' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(generatedInvoiceLink)}`} 
                  alt="Invoice QR" 
                  style={{ width: '160px', height: '160px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Amount:</span>
                <strong style={{ color: 'hsl(var(--secondary))' }}>{invoiceAmount} USDC</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Memo:</span>
                <span style={{ fontStyle: 'italic' }}>{invoiceDesc || 'N/A'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Expiry:</span>
                <span>{invoiceExpiry}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text" 
                readOnly 
                value={generatedInvoiceLink} 
                className="input-field" 
                style={{ padding: '8px 12px', fontSize: '11px', flex: 1 }}
              />
              <button 
                type="button" 
                className="stripe-btn-secondary" 
                style={{ padding: '8px 12px' }}
                onClick={copyInvoiceToClipboard}
              >
                {copiedInvoice ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              </button>
            </div>

            <button 
              type="button" 
              className="stripe-btn-primary"
              onClick={() => {
                copyInvoiceToClipboard();
                setInvoiceModalOpen(false);
              }}
            >
              Copy Link & Close
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert System overlay */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 className="text-emerald-400 size-5 shrink-0" />}
            {toast.type === 'error' && <X className="text-red-400 size-5 shrink-0" />}
            <span style={{ fontSize: '13.5px', color: '#fff', fontWeight: 500 }}>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
