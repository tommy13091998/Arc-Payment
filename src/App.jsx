import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  Send, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  X, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown,
  Sun,
  Moon,
  Plus,
  QrCode,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ethers } from 'ethers';

// Arc Testnet Chain Parameters
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

const LANGUAGES = [
  { code: 'vi', label: 'Việt Nam', flagCode: 'vn' },
  { code: 'en', label: 'India', flagCode: 'in' },
  { code: 'en', label: 'Philippines', flagCode: 'ph' },
  { code: 'id', label: 'Indonesia', flagCode: 'id' },
  { code: 'en', label: 'English', flagCode: 'us' },
];

const TRANSLATIONS = {
  vi: {
    dashboard: 'Tổng quan',
    send: 'Gửi USDC',
    receive: 'Nhận & Hóa đơn',
    activity: 'Lịch sử',
    availableBalance: 'Số dư khả dụng',
    arcNetwork: 'Mạng Arc Testnet',
    invoiceTitle: 'Tạo hóa đơn & Link thanh toán',
    generateInvoice: 'Tạo liên kết & mã QR',
    copyClose: 'Sao chép & Đóng',
    close: 'Đóng',
    faucetTitle: 'Vòi USDC Arc',
    faucetDesc: 'Nhận USDC thử nghiệm trực tiếp về ví của bạn để kiểm thử giao dịch trên mạng thử nghiệm Arc.',
    connectWallet: 'Kết nối ví',
    disconnect: 'Ngắt kết nối',
    recipientAddress: 'Địa chỉ người nhận',
    amount: 'Số tiền (USDC)',
    memo: 'Ghi chú / Mô tả',
    confirmSend: 'Xác nhận & Gửi USDC',
    addressPlaceholder: 'Nhập địa chỉ ví EVM (0x...)',
    amountPlaceholder: '0.00',
    memoPlaceholder: 'Ví dụ: Thanh toán dịch vụ',
    sendSuccess: 'Đã gửi USDC thành công!',
    insufficientBalance: 'Số dư không đủ',
    walletNotConnected: 'Vui lòng kết nối ví trước.',
    invalidAddress: 'Địa chỉ ví EVM không hợp lệ.',
    invalidAmount: 'Vui lòng nhập số tiền hợp lệ.',
    recentActivity: 'Lịch sử giao dịch',
    txHash: 'Mã giao dịch',
    status: 'Trạng thái',
    type: 'Loại',
    copyAddress: 'Sao chép địa chỉ',
    copied: 'Đã sao chép!',
    successTitle: 'Giao dịch thành công',
    faucetSuccess: 'Nhận thành công 100 USDC từ vòi thử nghiệm!',
    faucetRequesting: 'Đang yêu cầu USDC từ vòi...',
    searchInvoiceFound: 'Đã tải hóa đơn: Yêu cầu %amount% USDC cho "%desc%"',
    nativeUsdc: 'USDC gốc (Gas)',
    wrappedUsdc: 'Wrapped USDC (Hợp đồng)',
    faucetUsdc: 'Số dư vòi thử nghiệm (Mô phỏng)',
    quickActions: 'Phím tắt nhanh',
    depositQrDesc: 'Quét mã QR hoặc sao chép địa chỉ bên dưới để gửi USDC. Hãy đảm bảo người gửi đang sử dụng mạng Arc Testnet.',
    invoiceDesc: 'Điền thông tin chi tiết để tạo link thanh toán chia sẻ. Người dùng khác có thể nhấp vào link để tự động điền form gửi.',
    expiry: 'Hạn thanh toán',
    oneHour: '1 Giờ',
    oneDay: '24 Giờ',
    oneWeek: '7 Ngày',
    never: 'Không hết hạn',
    noActivity: 'Chưa có hoạt động giao dịch nào.',
    faucetRequest: 'Yêu cầu +100 USDC',
    faucetCircle: 'Vòi Circle chính thức ↗',
    sendP2pTitle: 'Gửi USDC trực tiếp',
    sendP2pDesc: 'Chuyển tiền USDC trực tiếp đến bất kỳ địa chỉ ví EVM nào trên mạng thử nghiệm Arc.',
    loadingTx: 'Đang thực hiện giao dịch...',
    gasLabel: 'Sử dụng USDC thanh toán phí gas',
    gasDesc: 'Phí giao dịch sẽ được thanh toán trực tiếp bằng USDC.'
  },
  en: {
    dashboard: 'Dashboard',
    send: 'Send USDC',
    receive: 'Receive & Invoices',
    activity: 'Transaction History',
    availableBalance: 'Available Balance',
    arcNetwork: 'Arc Testnet',
    invoiceTitle: 'USDC Invoice & Payment Link',
    generateInvoice: 'Generate Request Link & QR',
    copyClose: 'Copy & Close',
    close: 'Close',
    faucetTitle: 'Arc USDC Faucet',
    faucetDesc: 'Get test USDC directly to your wallet for testing transactions on Arc Testnet.',
    connectWallet: 'Connect Wallet',
    disconnect: 'Disconnect',
    recipientAddress: 'Recipient Address',
    amount: 'Amount (USDC)',
    memo: 'Memo / Description',
    confirmSend: 'Confirm & Send USDC',
    addressPlaceholder: 'Enter recipient 0x address...',
    amountPlaceholder: '0.00',
    memoPlaceholder: 'e.g., Services payment',
    sendSuccess: 'Sent USDC successfully!',
    insufficientBalance: 'Insufficient balance',
    walletNotConnected: 'Connect your wallet first.',
    invalidAddress: 'Invalid EVM address.',
    invalidAmount: 'Please enter a valid amount.',
    recentActivity: 'Recent Transaction Activity',
    txHash: 'Tx Hash',
    status: 'Status',
    type: 'Type',
    copyAddress: 'Copy Address',
    copied: 'Copied!',
    successTitle: 'Transaction Success',
    faucetSuccess: 'Received 100 USDC testnet tokens!',
    faucetRequesting: 'Requesting USDC from developer faucet...',
    searchInvoiceFound: 'Invoice loaded: Requesting %amount% USDC for "%desc%"',
    nativeUsdc: 'On-Chain USDC (Gas)',
    wrappedUsdc: 'On-Chain Wrapped USDC',
    faucetUsdc: 'Simulated Dev Faucet Balance',
    quickActions: 'Quick Actions',
    depositQrDesc: 'Scan QR code or copy address to deposit USDC. Ensure the sender is using Arc Testnet.',
    invoiceDesc: 'Fill details below to generate a shareable payment link. Others can load this link to auto-populate their send form.',
    expiry: 'Expiry Period',
    oneHour: '1 Hour',
    oneDay: '24 Hours',
    oneWeek: '7 Days',
    never: 'Never Expire',
    noActivity: 'No transaction activity yet.',
    faucetRequest: 'Request +100 USDC',
    faucetCircle: 'Circle Faucet ↗',
    sendP2pTitle: 'Direct P2P USDC Payout',
    sendP2pDesc: 'Send USDC directly to another EVM address on Arc Testnet.',
    loadingTx: 'Broadcasting transaction...',
    gasLabel: 'Gas Fee Paid in USDC',
    gasDesc: 'Transaction fees are automatically settled in USDC.'
  },
  id: {
    dashboard: 'Dasbor',
    send: 'Kirim USDC',
    receive: 'Terima & Faktur',
    activity: 'Riwayat Transaksi',
    availableBalance: 'Saldo Tersedia',
    arcNetwork: 'Arc Testnet',
    invoiceTitle: 'Buat Faktur & Tautan Pembayaran',
    generateInvoice: 'Buat Tautan & QR',
    copyClose: 'Salin & Tutup',
    close: 'Tutup',
    faucetTitle: 'Kran USDC Arc',
    faucetDesc: 'Dapatkan USDC uji coba langsung ke dompet Anda untuk menguji transaksi di Arc Testnet.',
    connectWallet: 'Hubungkan Dompet',
    disconnect: 'Putuskan Koneksi',
    recipientAddress: 'Alamat Penerima',
    amount: 'Jumlah (USDC)',
    memo: 'Memo / Deskripsi',
    confirmSend: 'Konfirmasi & Kirim USDC',
    addressPlaceholder: 'Masukkan alamat penerima 0x...',
    amountPlaceholder: '0.00',
    memoPlaceholder: 'Misal: Pembayaran layanan',
    sendSuccess: 'Berhasil mengirim USDC!',
    insufficientBalance: 'Saldo tidak mencukupi',
    walletNotConnected: 'Hubungkan dompet Anda terlebih dahulu.',
    invalidAddress: 'Alamat EVM tidak valid.',
    invalidAmount: 'Masukkan jumlah yang valid.',
    recentActivity: 'Riwayat Transaksi Terkini',
    txHash: 'Hash Transaksi',
    status: 'Status',
    type: 'Tipe',
    copyAddress: 'Salin Alamat',
    copied: 'Tersalin!',
    successTitle: 'Transaksi Sukses',
    faucetSuccess: 'Menerima 100 USDC token uji coba!',
    faucetRequesting: 'Meminta USDC dari kran pengembang...',
    searchInvoiceFound: 'Faktur dimuat: Meminta %amount% USDC untuk "%desc%"',
    nativeUsdc: 'USDC On-Chain (Gas)',
    wrappedUsdc: 'Wrapped USDC On-Chain',
    faucetUsdc: 'Saldo Kran Simulasi',
    quickActions: 'Tindakan Cepat',
    depositQrDesc: 'Pindai kode QR atau salin alamat untuk deposit USDC. Pastikan pengirim menggunakan Arc Testnet.',
    invoiceDesc: 'Isi detail di bawah ini untuk membuat tautan pembayaran yang dapat dibagikan. Orang lain dapat membuka tautan ini untuk mengisi formulir kirim secara otomatis.',
    expiry: 'Masa Berlaku',
    oneHour: '1 Jam',
    oneDay: '24 Jam',
    oneWeek: '7 Hari',
    never: 'Tidak Kadaluarsa',
    noActivity: 'Belum ada aktivitas transaksi.',
    faucetRequest: 'Minta +100 USDC',
    faucetCircle: 'Kran Circle ↗',
    sendP2pTitle: 'Pembayaran USDC P2P Langsung',
    sendP2pDesc: 'Kirim USDC langsung ke alamat EVM lain di Arc Testnet.',
    loadingTx: 'Menyiarkan transaksi...',
    gasLabel: 'Biaya Gas Dibayar dengan USDC',
    gasDesc: 'Biaya transaksi otomatis diselesaikan menggunakan USDC.'
  }
};

function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('arc_pay_theme') || 'dark');
  const [selectedLang, setSelectedLang] = useState(() => {
    const saved = localStorage.getItem('arc_pay_lang');
    if (saved) {
      const found = LANGUAGES.find(l => l.flagCode === saved);
      if (found) return found;
    }
    return LANGUAGES[0]; // Default to Vietnam
  });
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Wallet Connection States
  const [account, setAccount] = useState(() => localStorage.getItem('arc_pay_account') || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Balance States
  const [nativeBalance, setNativeBalance] = useState('0.0000');
  const [erc20Balance, setErc20Balance] = useState('0.00');
  const [mockUSDC, setMockUSDC] = useState(() => parseFloat(localStorage.getItem('arc_pay_mock_usdc') || '100'));
  const [network, setNetwork] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Send USDC Form States
  const [p2pRecipient, setP2pRecipient] = useState('');
  const [p2pAmount, setP2pAmount] = useState('');
  const [p2pMemo, setP2pMemo] = useState('');
  const [isSendingTx, setIsSendingTx] = useState(false);

  // Dynamic Payment Link / QR Request Generator States
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDesc, setInvoiceDesc] = useState('');
  const [invoiceExpiry, setInvoiceExpiry] = useState('24h');
  const [generatedInvoiceLink, setGeneratedInvoiceLink] = useState('');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // Recent Transactions History Ledger
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('arc_pay_txs_v2');
    return saved ? JSON.parse(saved) : [
      { id: 'tx-1', type: 'received', amount: '25.00', recipient: '0x3f5c862f928e18ef772b10a1bd626b1f237aa1b2', status: 'completed', hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', time: '2 hours ago', memo: 'Coffee shop sale' },
      { id: 'tx-2', type: 'sent', amount: '12.50', recipient: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b', status: 'completed', hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', time: '1 day ago', memo: 'Dinner split' }
    ];
  });

  const langDropdownRef = useRef(null);

  // i18n Translation Helper
  const t = (key, replacements = {}) => {
    const code = selectedLang.code;
    const translationSet = TRANSLATIONS[code] || TRANSLATIONS.en;
    let text = translationSet[key] ?? TRANSLATIONS.en[key] ?? key;
    Object.keys(replacements).forEach(rKey => {
      text = text.replace(`%${rKey}%`, replacements[rKey]);
    });
    return text;
  };

  // Click outside language selector dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync theme
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('arc_pay_theme', theme);
  }, [theme]);

  // Sync simulated faucet balance
  useEffect(() => {
    localStorage.setItem('arc_pay_mock_usdc', mockUSDC.toString());
  }, [mockUSDC]);

  // Sync transactions ledger
  useEffect(() => {
    localStorage.setItem('arc_pay_txs_v2', JSON.stringify(transactions));
  }, [transactions]);

  // Toast notifier
  const addToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Poll balances when account is connected
  useEffect(() => {
    if (account) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 8000);
      return () => clearInterval(interval);
    }
  }, [account]);

  // Parse URL payment link params on page load
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
      addToast('info', t('searchInvoiceFound', { amount: payAmount, desc: payDesc || 'payment' }));
    }
  }, []);

  // Balance query native and ERC-20
  const fetchBalances = async () => {
    if (!account) return;

    try {
      const providerEnv = window.okxwallet || window.ethereum;
      let provider;
      if (providerEnv) {
        provider = new ethers.BrowserProvider(providerEnv);
      } else {
        provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network');
      }

      // 1. Fetch native balance
      const nativeVal = await provider.getBalance(account);
      const formattedNative = parseFloat(ethers.formatEther(nativeVal)).toFixed(4);
      setNativeBalance(formattedNative);

      // 2. Fetch system Wrapped USDC token contract balance
      const usdcContract = new ethers.Contract(
        USDC_SYSTEM_CONTRACT,
        ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
        provider
      );
      
      let formattedErc20 = '0.00';
      try {
        const erc20Val = await usdcContract.balanceOf(account);
        const decimals = await usdcContract.decimals().catch(() => 6);
        formattedErc20 = parseFloat(ethers.formatUnits(erc20Val, decimals)).toFixed(2);
      } catch (err) {
        // Fallback if system contract call fails
      }
      setErc20Balance(formattedErc20);

      // 3. Fetch Network Parameters
      let isCorrect = false;
      let chainName = 'Unknown';
      let chainId = 0;
      
      if (providerEnv) {
        const net = await provider.getNetwork();
        chainId = Number(net.chainId);
        isCorrect = chainId === 5042002;
        chainName = isCorrect ? 'Arc Testnet' : net.name;
      }
      setNetwork({ name: chainName, chainId, isCorrect });

    } catch (err) {
      console.error('Failed to query balances:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBalances();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Connect wallet
  const connectWeb3Wallet = async () => {
    const providerEnv = window.okxwallet || window.ethereum;
    if (!providerEnv) {
      addToast('error', 'No Web3 Provider detected. Install OKX Wallet or MetaMask.');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(providerEnv);
      const accounts = await providerEnv.request({ method: 'eth_requestAccounts' });
      const activeAccount = accounts[0];

      const chainIdHex = await providerEnv.request({ method: 'eth_chainId' });
      if (chainIdHex !== ARC_TESTNET_PARAMS.chainId) {
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
          }
        }
      }

      setAccount(activeAccount);
      localStorage.setItem('arc_pay_account', activeAccount);
      addToast('success', `Connected: ${activeAccount.substring(0, 6)}...${activeAccount.substring(38)}`);
      await fetchBalances();
    } catch (err) {
      addToast('error', `Connection error: ${err.message || err}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setNativeBalance('0.0000');
    setErc20Balance('0.00');
    setNetwork(null);
    localStorage.removeItem('arc_pay_account');
    addToast('info', 'Wallet disconnected.');
  };

  // Simulated Faucet Claim
  const triggerFaucet = async () => {
    addToast('info', t('faucetRequesting'));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMockUSDC(prev => prev + 100);
    addToast('success', t('faucetSuccess'));
    
    const faucetTx = {
      id: `tx-faucet-${Date.now()}`,
      type: 'received',
      amount: '100.00',
      recipient: account,
      status: 'completed',
      hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      time: 'Just now',
      memo: 'Arc Dev Faucet'
    };
    setTransactions(prev => [faucetTx, ...prev].slice(0, 20));
  };

  // Sign & broadcast on-chain transaction
  const handleSendUSDC = async (e) => {
    e.preventDefault();
    if (!account) {
      addToast('error', t('walletNotConnected'));
      return;
    }

    const cleanedRecipient = p2pRecipient.trim();
    if (!ethers.isAddress(cleanedRecipient)) {
      addToast('error', t('invalidAddress'));
      return;
    }

    const parsedAmt = parseFloat(p2pAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      addToast('error', t('invalidAmount'));
      return;
    }

    const totalBalance = parseFloat(nativeBalance) + parseFloat(erc20Balance) + mockUSDC;
    if (parsedAmt > totalBalance) {
      addToast('error', `${t('insufficientBalance')}. Available: ${totalBalance.toFixed(2)} USDC`);
      return;
    }

    setIsSendingTx(true);
    try {
      let hash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      const providerEnv = window.okxwallet || window.ethereum;
      if (providerEnv && account) {
        try {
          const provider = new ethers.BrowserProvider(providerEnv);
          const signer = await provider.getSigner();
          
          addToast('info', 'Please sign the transaction in your wallet...');
          const tx = await signer.sendTransaction({
            to: cleanedRecipient,
            value: ethers.parseEther(parsedAmt.toString())
          });
          hash = tx.hash;
          addToast('info', 'Transaction submitted. Awaiting block confirmation...');
          await tx.wait();
        } catch (err) {
          if (mockUSDC >= parsedAmt) {
            setMockUSDC(prev => prev - parsedAmt);
            addToast('info', 'On-chain simulation fallback applied.');
          } else {
            throw err;
          }
        }
      } else {
        setMockUSDC(prev => Math.max(0, prev - parsedAmt));
      }

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      const newTx = {
        id: `tx-${Date.now()}`,
        type: 'sent',
        amount: parsedAmt.toFixed(2),
        recipient: cleanedRecipient,
        status: 'completed',
        hash: hash,
        time: 'Just now',
        memo: p2pMemo || 'USDC P2P Transfer'
      };

      setTransactions(prev => [newTx, ...prev].slice(0, 20));
      addToast('success', t('sendSuccess'));

      // Clean inputs
      setP2pAmount('');
      setP2pRecipient('');
      setP2pMemo('');
      fetchBalances();

    } catch (err) {
      addToast('error', `Payment failed: ${err.message || err}`);
    } finally {
      setIsSendingTx(false);
    }
  };

  // Generate Invoices / Payment Request Links
  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!account) {
      addToast('error', t('walletNotConnected'));
      return;
    }

    const parsedAmt = parseFloat(invoiceAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      addToast('error', t('invalidAmount'));
      return;
    }

    const currentUrl = window.location.origin + window.location.pathname;
    const link = `${currentUrl}?pay=${account}&amount=${parsedAmt}&desc=${encodeURIComponent(invoiceDesc || 'Payment Request')}`;
    setGeneratedInvoiceLink(link);
    setInvoiceModalOpen(true);
  };

  // Clipboard copies
  const copyAddressToClipboard = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopiedAddress(true);
    addToast('success', t('copied'));
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const copyInvoiceToClipboard = () => {
    if (!generatedInvoiceLink) return;
    navigator.clipboard.writeText(generatedInvoiceLink);
    setCopiedInvoice(true);
    addToast('success', t('copied'));
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  const changeLanguage = (lang) => {
    setSelectedLang(lang);
    localStorage.setItem('arc_pay_lang', lang.flagCode);
    setLangDropdownOpen(false);
  };

  return (
    <div className="app-container">
      {/* Background Glowing Accents */}
      <div className="glow-background">
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
      </div>

      {/* Fixed Sidebar navigation */}
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
                    <FileText className="size-5" />
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
                  <button type="button" className={`sidebar-nav-item ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
                    <RefreshCw className="size-5" />
                    <span>{t('activity')}</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div className="sidebar-footer">
            <button 
              type="button" 
              className="stripe-btn-disconnect" 
              onClick={disconnectWallet}
            >
              <X className="size-4" />
              <span>{t('disconnect')}</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Viewport */}
      {account ? (
        <main className="stripe-main-content">
          {/* Top Navbar */}
          <div className="stripe-top-bar">
            
            {/* Network tag and Language dropdown placed together */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: 'auto' }}>
              <span className="built-on-arc" style={{ marginRight: 0 }}>
                Arc Testnet
              </span>
              
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
                    {LANGUAGES.map((lang, idx) => (
                      <button
                        key={`${lang.flagCode}-${idx}`}
                        type="button"
                        className={`lang-option ${selectedLang.flagCode === lang.flagCode ? 'active' : ''}`}
                        onClick={() => changeLanguage(lang)}
                      >
                        <img src={`https://flagcdn.com/w40/${lang.flagCode}.png`} alt={lang.label} className="lang-flag-img" />
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Network switch verification details */}
            {network && (
              <span className={`network-badge-label ${network.isCorrect ? 'active' : ''}`}>
                {network.name}
              </span>
            )}

            {/* Theme selector */}
            <button
              type="button"
              className="lang-selector-trigger"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              style={{ width: '34px', height: '34px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-400" />}
            </button>

            {/* Address bar */}
            <div className="wallet-badge-connected" onClick={copyAddressToClipboard} style={{ cursor: 'pointer' }}>
              <Wallet className="size-4" />
              <span>
                {account.substring(0, 6)}...{account.substring(38)}
              </span>
              {copiedAddress ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            </div>

          </div>

          {/* Conditional rendering of current screen tab */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div className="grid-full-width" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                
                {/* Balance display details card */}
                <div className="stripe-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('availableBalance')}</h3>
                    <span className="updating-status-badge">{t('arcNetwork')}</span>
                  </div>
                  
                  <div className="balance-display-box">
                    <span className="balance-large-amount">
                      ${(parseFloat(nativeBalance) + parseFloat(erc20Balance) + mockUSDC).toFixed(2)}
                    </span>
                    <span className="balance-large-currency">USDC</span>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', marginBottom: '20px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('nativeUsdc')}:</span>
                      <span style={{ fontWeight: 600 }}>{nativeBalance} USDC</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('wrappedUsdc')}:</span>
                      <span style={{ fontWeight: 600 }}>{erc20Balance} USDC</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('faucetUsdc')}:</span>
                      <span style={{ fontWeight: 600, color: 'hsl(var(--secondary))' }}>{mockUSDC.toFixed(2)} USDC</span>
                    </div>
                  </div>

                  {/* Actions shortcuts */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      type="button" 
                      className="stripe-btn-secondary" 
                      style={{ flex: 1 }}
                      onClick={() => setActiveTab('receive')}
                    >
                      <ArrowDownLeft className="size-4" />
                      {t('receive')}
                    </button>
                    <button 
                      type="button" 
                      className="stripe-btn-secondary" 
                      style={{ flex: 1 }}
                      onClick={() => setActiveTab('send')}
                    >
                      <ArrowUpRight className="size-4" />
                      {t('send')}
                    </button>
                  </div>
                </div>

                {/* Faucet details card */}
                <div className="stripe-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h2>
                      <Plus className="text-secondary size-5" style={{ color: 'hsl(var(--secondary))' }} />
                      {t('faucetTitle')}
                    </h2>
                    <p style={{ fontSize: '13.5px', color: 'hsl(var(--text-secondary))', marginBottom: '20px', lineHeight: '1.5' }}>
                      {t('faucetDesc')}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="stripe-btn-primary" 
                      onClick={triggerFaucet}
                    >
                      {t('faucetRequest')}
                    </button>
                    
                    <a 
                      href="https://faucet.circle.com/" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="stripe-btn-secondary" 
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
                    >
                      {t('faucetCircle')}
                    </a>
                  </div>
                </div>

              </div>

              {/* Transactions list on dashboard */}
              <div className="stripe-card stripe-table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 600 }}>{t('recentActivity')}</h3>
                  <button 
                    type="button" 
                    className="stripe-btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '11.5px' }}
                    onClick={handleRefresh}
                  >
                    <RefreshCw className={`size-3.5 ${isRefreshing ? 'spin-animation' : ''}`} />
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="stripe-table">
                    <thead>
                      <tr>
                        <th>{t('type')}</th>
                        <th>{t('amount')}</th>
                        <th>{t('recipientAddress')}</th>
                        <th>{t('memo')}</th>
                        <th>{t('txHash')}</th>
                        <th>{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', padding: '24px' }}>
                            {t('noActivity')}
                          </td>
                        </tr>
                      ) : (
                        transactions.map(tx => (
                          <tr key={tx.id}>
                            <td>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {tx.type === 'sent' ? (
                                  <ArrowUpRight className="text-red-400 size-4" />
                                ) : (
                                  <ArrowDownLeft className="text-emerald-400 size-4" />
                                )}
                                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                  {tx.type === 'sent' ? t('send') : t('receive')}
                                </span>
                              </span>
                            </td>
                            <td style={{ fontWeight: 'bold' }}>
                              {tx.amount} USDC
                            </td>
                            <td>
                              <span style={{ fontFamily: 'monospace' }}>
                                {tx.recipient.substring(0, 8)}...{tx.recipient.substring(tx.recipient.length - 8)}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontStyle: 'italic', fontSize: '12.5px', color: 'hsl(var(--text-secondary))' }}>
                                {tx.memo || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <a 
                                href={`https://testnet.arcscan.app/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tx-link"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                {tx.hash.substring(0, 8)}...
                                <ExternalLink className="size-3" />
                              </a>
                            </td>
                            <td>
                              <span className={`status-badge status-${tx.status}`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'send' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div className="stripe-card">
                <h2>
                  <Send className="text-indigo-400 size-5" />
                  {t('sendP2pTitle')}
                </h2>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13.5px', marginBottom: '24px', lineHeight: '1.5' }}>
                  {t('sendP2pDesc')}
                </p>

                <form onSubmit={handleSendUSDC} className="quick-p2p-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="p2p-recipient">{t('recipientAddress')}</label>
                    <div className="input-container">
                      <div className="input-icon-left"><Wallet className="size-4" /></div>
                      <input 
                        type="text" 
                        id="p2p-recipient"
                        className="input-field" 
                        placeholder={t('addressPlaceholder')} 
                        value={p2pRecipient}
                        onChange={(e) => setP2pRecipient(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" htmlFor="p2p-amount" style={{ marginBottom: 0 }}>{t('amount')}</label>
                      <span style={{ fontSize: '11.5px', color: 'hsl(var(--text-secondary))' }}>
                        {t('availableBalance')}: <strong style={{ color: 'hsl(var(--secondary))' }}>{(parseFloat(nativeBalance) + parseFloat(erc20Balance) + mockUSDC).toFixed(2)} USDC</strong>
                      </span>
                    </div>
                    <div className="input-container">
                      <div className="input-icon-left"><span style={{ fontWeight: 'bold', fontSize: '14px', color: 'hsl(var(--text-muted))' }}>$</span></div>
                      <input 
                        type="number" 
                        id="p2p-amount"
                        className="input-field" 
                        placeholder={t('amountPlaceholder')} 
                        step="0.01"
                        min="0.01"
                        value={p2pAmount}
                        onChange={(e) => setP2pAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="p2p-memo">{t('memo')}</label>
                    <div className="input-container">
                      <div className="input-icon-left"><FileText className="size-4" /></div>
                      <input 
                        type="text" 
                        id="p2p-memo"
                        className="input-field" 
                        placeholder={t('memoPlaceholder')} 
                        value={p2pMemo}
                        onChange={(e) => setP2pMemo(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Gas Details preview */}
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, fontSize: '13.5px' }}>{t('gasLabel')}</span>
                        <span style={{ display: 'block', fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>{t('gasDesc')}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="stripe-btn-primary"
                    disabled={isSendingTx}
                  >
                    {isSendingTx ? (
                      <>
                        <RefreshCw className="size-4 inline mr-1 spin-animation" />
                        {t('loadingTx')}
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        {t('confirmSend')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'receive' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '640px', margin: '0 auto' }}>
              
              {/* Static Deposit Details */}
              <div className="stripe-card" style={{ textAlign: 'center' }}>
                <h2>{t('receive')}</h2>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13.5px', marginBottom: '24px', lineHeight: '1.5' }}>
                  {t('depositQrDesc')}
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

              {/* Dynamic Invoice Builder */}
              <div className="stripe-card">
                <h2>
                  <FileText className="text-indigo-400 size-6" />
                  {t('invoiceTitle')}
                </h2>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13.5px', marginBottom: '24px', lineHeight: '1.5' }}>
                  {t('invoiceDesc')}
                </p>

                <form onSubmit={handleGenerateInvoice}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="inv-amount">{t('amount')}</label>
                    <div className="input-container">
                      <div className="input-icon-left"><span style={{ fontWeight: 'bold', fontSize: '14px', color: 'hsl(var(--text-muted))' }}>$</span></div>
                      <input 
                        type="number" 
                        id="inv-amount"
                        className="input-field" 
                        placeholder={t('amountPlaceholder')} 
                        step="0.01"
                        min="0.01"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="inv-desc">{t('memo')}</label>
                    <div className="input-container">
                      <div className="input-icon-left"><FileText className="size-4" /></div>
                      <input 
                        type="text" 
                        id="inv-desc"
                        className="input-field" 
                        placeholder={t('memoPlaceholder')} 
                        value={invoiceDesc}
                        onChange={(e) => setInvoiceDesc(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="inv-expiry">{t('expiry')}</label>
                    <div className="input-container">
                      <div className="input-icon-left"><ChevronDown className="size-4" style={{ pointerEvents: 'none', zIndex: 1 }} /></div>
                      <select 
                        id="inv-expiry" 
                        className="input-field" 
                        value={invoiceExpiry} 
                        onChange={(e) => setInvoiceExpiry(e.target.value)}
                        style={{ paddingLeft: '38px', appearance: 'none', background: 'rgba(0,0,0,0.25)' }}
                      >
                        <option value="1h">{t('oneHour')}</option>
                        <option value="24h">{t('oneDay')}</option>
                        <option value="7d">{t('oneWeek')}</option>
                        <option value="never">{t('never')}</option>
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

          {activeTab === 'activity' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="stripe-card stripe-table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 600 }}>{t('recentActivity')}</h3>
                  <button 
                    type="button" 
                    className="stripe-btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={handleRefresh}
                  >
                    <RefreshCw className={`size-3.5 ${isRefreshing ? 'spin-animation' : ''}`} />
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="stripe-table">
                    <thead>
                      <tr>
                        <th>{t('type')}</th>
                        <th>{t('amount')}</th>
                        <th>{t('recipientAddress')}</th>
                        <th>{t('memo')}</th>
                        <th>{t('txHash')}</th>
                        <th>{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', padding: '24px' }}>
                            {t('noActivity')}
                          </td>
                        </tr>
                      ) : (
                        transactions.map(tx => (
                          <tr key={tx.id}>
                            <td>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {tx.type === 'sent' ? (
                                  <ArrowUpRight className="text-red-400 size-4" />
                                ) : (
                                  <ArrowDownLeft className="text-emerald-400 size-4" />
                                )}
                                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                  {tx.type === 'sent' ? t('send') : t('receive')}
                                </span>
                              </span>
                            </td>
                            <td style={{ fontWeight: 'bold' }}>
                              {tx.amount} USDC
                            </td>
                            <td>
                              <span style={{ fontFamily: 'monospace' }}>
                                {tx.recipient.substring(0, 8)}...{tx.recipient.substring(tx.recipient.length - 8)}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontStyle: 'italic', fontSize: '12.5px', color: 'hsl(var(--text-secondary))' }}>
                                {tx.memo || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <a 
                                href={`https://testnet.arcscan.app/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tx-link"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                {tx.hash.substring(0, 8)}...
                                <ExternalLink className="size-3" />
                              </a>
                            </td>
                            <td>
                              <span className={`status-badge status-${tx.status}`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      ) : (
        /* Connected Landing Screen */
        <div className="app-landing-screen">
          <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px' }}>
            
            {/* Dark/Light theme toggle */}
            <button
              type="button"
              className="lang-selector-trigger"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              style={{ width: '36px', height: '36px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-400" />}
            </button>

            {/* Language dropdown in landing page */}
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
                  {LANGUAGES.map((lang, idx) => (
                    <button
                      key={`${lang.flagCode}-${idx}`}
                      type="button"
                      className={`lang-option ${selectedLang.flagCode === lang.flagCode ? 'active' : ''}`}
                      onClick={() => changeLanguage(lang)}
                    >
                      <img src={`https://flagcdn.com/w40/${lang.flagCode}.png`} alt={lang.label} className="lang-flag-img" />
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="app-landing-hero">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div className="spinning-globe-container" style={{ width: '80px', height: '80px' }}>
                <div className="spinning-globe" style={{ width: '70px', height: '70px' }}></div>
              </div>
            </div>
            <h1>Arc Pay</h1>
            <p style={{ fontSize: '18px', color: 'hsl(var(--text-secondary))', lineHeight: '1.6', marginBottom: '36px' }}>
              {selectedLang.code === 'vi' ? 'Hệ thống thanh toán stablecoin USDC tức thời chạy trên mạng thử nghiệm Arc Network.' : selectedLang.code === 'id' ? 'Sistem pembayaran stablecoin USDC instan yang berjalan di Arc Network Testnet.' : 'Instant USDC stablecoin payment system running on the Arc Network Testnet.'}
            </p>

            <button 
              type="button" 
              className="btn-landing-primary" 
              onClick={connectWeb3Wallet}
              disabled={isConnecting}
            >
              <Wallet className="size-5" />
              {isConnecting ? (selectedLang.code === 'vi' ? 'Đang kết nối...' : 'Connecting...') : t('connectWallet')}
            </button>
          </div>
        </div>
      )}

      {/* Invoice Modal Popup for sharing created invoice link */}
      {invoiceModalOpen && (
        <div className="modal-overlay" onClick={() => setInvoiceModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <button type="button" className="modal-close-btn" onClick={() => setInvoiceModalOpen(false)}>
              <X className="size-5" />
            </button>
            <h2>{t('invoiceTitle')}</h2>
            <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '24px' }}>
              {t('invoiceDesc')}
            </p>

            <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', marginBottom: '24px', backgroundColor: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              <div style={{ border: '2px solid #000', display: 'inline-block', padding: '12px', borderRadius: '12px', backgroundColor: '#fff', marginBottom: '16px' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(generatedInvoiceLink)}`} 
                  alt="Invoice QR" 
                  style={{ width: '160px', height: '160px', display: 'block' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', width: '100%', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('amount')}:</span>
                <strong style={{ color: 'hsl(var(--secondary))' }}>{invoiceAmount} USDC</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', width: '100%', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('memo')}:</span>
                <span style={{ fontStyle: 'italic' }}>{invoiceDesc || 'N/A'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', width: '100%' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('expiry')}:</span>
                <span>{invoiceExpiry === '1h' ? t('oneHour') : invoiceExpiry === '24h' ? t('oneDay') : invoiceExpiry === '7d' ? t('oneWeek') : t('never')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text" 
                readOnly 
                value={generatedInvoiceLink} 
                className="input-field" 
                style={{ padding: '8px 12px', fontSize: '11.5px', flex: 1 }}
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
              {t('copyClose')}
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Toast system */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && <Check className="text-emerald-400 size-5 shrink-0" />}
            {toast.type === 'error' && <X className="text-red-400 size-5 shrink-0" />}
            <span style={{ fontSize: '13.5px', color: '#fff', fontWeight: 500 }}>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
