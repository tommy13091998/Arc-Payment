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
  Lock
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

// Global network map coordinates
const MAP_NODES = [
  { id: 'us', name: 'United States', code: 'US', x: '37.5%', y: '33.3%' },
  { id: 'uk', name: 'United Kingdom', code: 'UK', x: '45.8%', y: '25.0%' },
  { id: 'id', name: 'Indonesia',      code: 'ID', x: '64.5%', y: '68.0%' },
  { id: 'in', name: 'India',          code: 'IN', x: '58.3%', y: '41.7%' },
  { id: 'vn', name: 'Vietnam',        code: 'VN', x: '63.5%', y: '55.0%' },
  { id: 'ph', name: 'Philippines',    code: 'PH', x: '66.7%', y: '65.0%' },
  { id: 'sg', name: 'Singapore',      code: 'SG', x: '64.0%', y: '61.5%' },
];

// Supported UI languages
const LANGUAGES = [
  { code: 'en', label: 'English',    flagCode: 'us' },
  { code: 'vi', label: 'Tiếng Việt', flagCode: 'vn' },
  { code: 'zh', label: '中文',        flagCode: 'cn' },
  { code: 'ja', label: '日本語',      flagCode: 'jp' },
  { code: 'es', label: 'Español',    flagCode: 'mx' },
  { code: 'hi', label: 'हिन्दी',     flagCode: 'in' },
  { code: 'tl', label: 'Filipino',   flagCode: 'ph' },
  { code: 'sw', label: 'Swahili',    flagCode: 'ke' },
];

// i18n Translations
const TRANSLATIONS = {
  en: {
    dashboard:'Dashboard', balance:'Balance', p2pSend:'P2P Direct Send', invoices:'Invoices', fxMarket:'Live FX Market', allActivity:'All Activity', disconnect:'Disconnect',
    connectWallet:'Connect OKX / MetaMask', connectingWallet:'Connecting wallet...', availableBalance:'Available Balance', arcNetwork:'Arc network',
    receiveUsdc:'Receive USDC', requestInvoice:'Request Invoice', remittanceTitle:'Wise Remittance Calculator',
    demoWarning:'Simulated demo on Arc Testnet. Direct fiat conversion or local payouts are currently simulating mock rates.',
    youSend:'You send', recipientGets:'Recipient gets', gasFee:'Gas / Remit Fee', conversionRate:'Conversion Rate',
    transferMode:'Transfer Mode', gasNative:'Gas Native', erc20Sys:'ERC20 Sys',
    recipientAddress:'Recipient EVM Wallet Address', recipientPlaceholder:'0x recipient address',
    remitFunds:'Remit Funds to', processing:'Processing Settlement...',
    recentRemittances:'Recent Remittances', refresh:'Refresh',
    globalRoute:'Global Settlement Route', fxSparkline:'FX Sparkline Chart',
    p2pTitle:'Intra-chain USDC Payout',
    p2pDesc:'Transfer USDC directly to another EVM address on the Arc Network. Gas fees will be settled directly in USDC.',
    recipientAddressLabel:'Recipient Address (EVM / Address)', amountLabel:'Amount (USDC)', transferModeLabel:'Transfer Mode',
    nativeGasFull:'Native Gas (18 decimals)', erc20ContractFull:'ERC20 Contract (6 decimals)',
    sendDirect:'Send USDC Direct', broadcasting:'Broadcasting direct tx...',
    invoiceTitle:'USDC Request Invoice Generator',
    invoiceDesc:'Fill in the details to generate a payment request. Other users can copy this link and pay you instantly on the Arc network.',
    requestAmountLabel:'Request Amount (USDC)', memoLabel:'Requested Memo / Services', memoPlaceholder:'e.g. Website development contract',
    generateInvoice:'Generate Invoice Link & QR',
    invoiceGenerated:'USDC Request Generated', invoiceShare:'Send this request URL or QR to your client.',
    requestAmountText:'Request Amount:', memoText:'Memo:', copyClose:'Copy & Close', close:'Close',
    trendsTitle:'Live Conversion Charts', fxDayLabel:'7-day',
    historyTitle:'Full Transaction Ledger Activity',
    colType:'Type', colAmount:'USDC Amount', colPayout:'Payout value', colCountry:'Country', colTxHash:'Transaction hash', colStatus:'Status',
    landingDesc:'Instant cross-border stablecoin remittance powered by USDC native gas on Arc network.',
    updating:'Arc network', done:'Done', remitLockedMessage:'Remittance services are temporarily disabled. Wallet signing is locked for this feature.',
  },
  vi: {
    dashboard:'Tổng quan', balance:'Số dư', p2pSend:'Gửi P2P trực tiếp', invoices:'Hóa đơn', fxMarket:'Thị trường FX', allActivity:'Tất cả giao dịch', disconnect:'Ngắt kết nối',
    connectWallet:'Kết nối OKX / MetaMask', connectingWallet:'Đang kết nối...', availableBalance:'Số dư khả dụng', arcNetwork:'Mạng Arc',
    receiveUsdc:'Nhận USDC', requestInvoice:'Tạo hóa đơn', remittanceTitle:'Công cụ chuyển tiền quốc tế',
    demoWarning:'Demo mô phỏng trên Arc Testnet. Tỷ giá quy đổi fiat hiện đang dùng tỷ giá giả lập.',
    youSend:'Bạn gửi', recipientGets:'Người nhận được', gasFee:'Phí Gas / Chuyển tiền', conversionRate:'Tỷ giá quy đổi',
    transferMode:'Hình thức chuyển', gasNative:'Gas gốc', erc20Sys:'Hệ thống ERC20',
    recipientAddress:'Địa chỉ ví EVM người nhận', recipientPlaceholder:'Địa chỉ 0x người nhận',
    remitFunds:'Chuyển tiền tới', processing:'Đang xử lý...',
    recentRemittances:'Giao dịch gần đây', refresh:'Làm mới',
    globalRoute:'Tuyến thanh toán toàn cầu', fxSparkline:'Biểu đồ tỷ giá',
    p2pTitle:'Chuyển USDC trong chuỗi',
    p2pDesc:'Chuyển USDC trực tiếp đến địa chỉ EVM khác trên mạng Arc. Phí gas được thanh toán bằng USDC.',
    recipientAddressLabel:'Địa chỉ người nhận (EVM)', amountLabel:'Số lượng (USDC)', transferModeLabel:'Hình thức chuyển',
    nativeGasFull:'Gas gốc (18 số thập phân)', erc20ContractFull:'Hợp đồng ERC20 (6 số thập phân)',
    sendDirect:'Gửi USDC trực tiếp', broadcasting:'Đang phát giao dịch...',
    invoiceTitle:'Tạo hóa đơn yêu cầu USDC',
    invoiceDesc:'Điền thông tin để tạo yêu cầu thanh toán. Người khác có thể sao chép liên kết và thanh toán ngay.',
    requestAmountLabel:'Số tiền yêu cầu (USDC)', memoLabel:'Ghi chú / Dịch vụ', memoPlaceholder:'VD: Hợp đồng phát triển website',
    generateInvoice:'Tạo liên kết & mã QR',
    invoiceGenerated:'Đã tạo yêu cầu USDC', invoiceShare:'Gửi URL hoặc mã QR này cho khách hàng của bạn.',
    requestAmountText:'Số tiền yêu cầu:', memoText:'Ghi chú:', copyClose:'Sao chép & Đóng', close:'Đóng',
    trendsTitle:'Biểu đồ tỷ giá trực tiếp', fxDayLabel:'7 ngày',
    historyTitle:'Lịch sử giao dịch đầy đủ',
    colType:'Loại', colAmount:'Số USDC', colPayout:'Giá trị nhận', colCountry:'Quốc gia', colTxHash:'Mã giao dịch', colStatus:'Trạng thái',
    landingDesc:'Chuyển tiền xuyên biên giới tức thì bằng USDC trên mạng Arc, phí gas bằng 0.',
    updating:'Mạng Arc', done:'Xong', remitLockedMessage:'Dịch vụ chuyển tiền quốc tế hiện đã bị khóa. Tính năng ký ví không được hỗ trợ cho mục này.',
  },
  zh: {
    dashboard:'控制台', balance:'余额', p2pSend:'P2P 直接发送', invoices:'发票', fxMarket:'实时外汇市场', allActivity:'所有活动', disconnect:'断开连接',
    connectWallet:'连接 OKX / MetaMask', connectingWallet:'连接中...', availableBalance:'可用余额', arcNetwork:'Arc 网络',
    receiveUsdc:'接收 USDC', requestInvoice:'请求发票', remittanceTitle:'汇款计算器',
    demoWarning:'Arc 测试网模拟演示。法币转换目前使用模拟汇率。',
    youSend:'您发送', recipientGets:'收款方收到', gasFee:'燃气/汇款费用', conversionRate:'汇率',
    transferMode:'转账方式', gasNative:'原生 Gas', erc20Sys:'ERC20 系统',
    recipientAddress:'收款人 EVM 钱包地址', recipientPlaceholder:'0x 收款地址',
    remitFunds:'汇款至', processing:'处理中...',
    recentRemittances:'近期汇款', refresh:'刷新',
    globalRoute:'全球结算路线', fxSparkline:'外汇走势图',
    p2pTitle:'链内 USDC 支付（Cash App 风格）',
    p2pDesc:'在 Arc 网络上直接将 USDC 转账到另一个 EVM 地址。',
    recipientAddressLabel:'收款人地址 (EVM)', amountLabel:'金额 (USDC)', transferModeLabel:'转账方式',
    nativeGasFull:'原生 Gas（18 位小数）', erc20ContractFull:'ERC20 合约（6 位小数）',
    sendDirect:'直接发送 USDC', broadcasting:'广播交易中...',
    invoiceTitle:'USDC 请求发票生成器（PayPal 风格）',
    invoiceDesc:'填写详情以生成付款请求，其他用户可复制链接立即支付。',
    requestAmountLabel:'请求金额 (USDC)', memoLabel:'备注/服务说明', memoPlaceholder:'例：网站开发合同',
    generateInvoice:'生成发票链接和二维码',
    invoiceGenerated:'已生成 USDC 请求', invoiceShare:'将此请求 URL 或二维码发送给您的客户。',
    requestAmountText:'请求金额：', memoText:'备注：', copyClose:'复制并关闭', close:'关闭',
    trendsTitle:'实时汇率图表', fxDayLabel:'7天',
    historyTitle:'完整交易记录',
    colType:'类型', colAmount:'USDC 数量', colPayout:'支付金额', colCountry:'国家', colTxHash:'交易哈希', colStatus:'状态',
    landingDesc:'通过 Arc 网络上的 USDC 原生 Gas 实现即时跨境稳定币汇款。',
    updating:'Arc 网络', done:'完成', remitLockedMessage:'跨境汇款服务已暂时禁用。该功能已锁定钱包签名。',
  },
  ja: {
    dashboard:'ダッシュボード', balance:'残高', p2pSend:'P2P 直接送金', invoices:'請求書', fxMarket:'FX マーケット', allActivity:'全取引', disconnect:'切断',
    connectWallet:'OKX / MetaMask に接続', connectingWallet:'接続中...', availableBalance:'利用可能残高', arcNetwork:'Arc ネットワーク',
    receiveUsdc:'USDC を受け取る', requestInvoice:'請求書を作成', remittanceTitle:'送金計算機',
    demoWarning:'Arc テストネットのシミュレーションデモ。法定通貨の変換はモックレートで動作しています。',
    youSend:'送金額', recipientGets:'受取額', gasFee:'ガス/送金手数料', conversionRate:'換算レート',
    transferMode:'転送モード', gasNative:'ネイティブ Gas', erc20Sys:'ERC20 システム',
    recipientAddress:'受取人 EVM ウォレットアドレス', recipientPlaceholder:'0x 受取アドレス',
    remitFunds:'送金先', processing:'処理中...',
    recentRemittances:'最近の送金', refresh:'更新',
    globalRoute:'グローバル決済ルート', fxSparkline:'FX スパークラインチャート',
    p2pTitle:'USDC チェーン内送金（Cash App スタイル）',
    p2pDesc:'Arc ネットワーク上の別の EVM アドレスに USDC を直接転送します。',
    recipientAddressLabel:'受取人アドレス (EVM)', amountLabel:'金額 (USDC)', transferModeLabel:'転送モード',
    nativeGasFull:'ネイティブ Gas（18桁）', erc20ContractFull:'ERC20 コントラクト（6桁）',
    sendDirect:'USDC を直接送金', broadcasting:'トランザクション放送中...',
    invoiceTitle:'USDC 請求書ジェネレーター（PayPal スタイル）',
    invoiceDesc:'支払いリクエストを生成するために詳細を入力してください。',
    requestAmountLabel:'リクエスト金額 (USDC)', memoLabel:'メモ/サービス内容', memoPlaceholder:'例：Webサイト開発契約',
    generateInvoice:'請求書リンクと QR コードを生成',
    invoiceGenerated:'USDC リクエストが生成されました', invoiceShare:'このリクエスト URL または QR をクライアントに送信してください。',
    requestAmountText:'請求金額：', memoText:'メモ：', copyClose:'コピーして閉じる', close:'閉じる',
    trendsTitle:'リアルタイム換算チャート', fxDayLabel:'7日間',
    historyTitle:'完全な取引元帳',
    colType:'種類', colAmount:'USDC 金額', colPayout:'受取金額', colCountry:'国', colTxHash:'トランザクションハッシュ', colStatus:'ステータス',
    landingDesc:'Arc ネットワーク上の USDC ネイティブ Gas による即時クロスボーダー送金。',
    updating:'Arc ネットワーク', done:'完了', remitLockedMessage:'海外送金サービスは一時的に無効になっています。この機能のウォレット署名はロックされています。',
  },
  es: {
    dashboard:'Panel', balance:'Saldo', p2pSend:'Envío P2P Directo', invoices:'Facturas', fxMarket:'Mercado FX en Vivo', allActivity:'Toda la Actividad', disconnect:'Desconectar',
    connectWallet:'Conectar OKX / MetaMask', connectingWallet:'Conectando...', availableBalance:'Saldo Disponible', arcNetwork:'Red Arc',
    receiveUsdc:'Recibir USDC', requestInvoice:'Solicitar Factura', remittanceTitle:'Calculadora de Remesas',
    demoWarning:'Demo simulada en Arc Testnet. Las conversiones a moneda local usan tasas ficticias.',
    youSend:'Tú envías', recipientGets:'El destinatario recibe', gasFee:'Gas / Comisión de envío', conversionRate:'Tasa de cambio',
    transferMode:'Modo de transferencia', gasNative:'Gas Nativo', erc20Sys:'Sistema ERC20',
    recipientAddress:'Dirección de cartera EVM del destinatario', recipientPlaceholder:'Dirección 0x del destinatario',
    remitFunds:'Remitir fondos a', processing:'Procesando...',
    recentRemittances:'Remesas recientes', refresh:'Actualizar',
    globalRoute:'Ruta de liquidación global', fxSparkline:'Gráfico de divisas',
    p2pTitle:'Pago USDC en cadena (estilo Cash App)',
    p2pDesc:'Transfiere USDC directamente a otra dirección EVM en la red Arc.',
    recipientAddressLabel:'Dirección del destinatario (EVM)', amountLabel:'Monto (USDC)', transferModeLabel:'Modo de transferencia',
    nativeGasFull:'Gas Nativo (18 decimales)', erc20ContractFull:'Contrato ERC20 (6 decimales)',
    sendDirect:'Enviar USDC Directo', broadcasting:'Difundiendo transacción...',
    invoiceTitle:'Generador de Facturas USDC (estilo PayPal)',
    invoiceDesc:'Completa los detalles para generar una solicitud de pago. Otros usuarios pueden pagar al instante.',
    requestAmountLabel:'Monto solicitado (USDC)', memoLabel:'Nota / Servicios', memoPlaceholder:'Ej. Contrato de desarrollo web',
    generateInvoice:'Generar enlace y QR de factura',
    invoiceGenerated:'Solicitud USDC generada', invoiceShare:'Envía esta URL o QR a tu cliente.',
    requestAmountText:'Monto solicitado:', memoText:'Nota:', copyClose:'Copiar y cerrar', close:'Cerrar',
    trendsTitle:'Gráficos de conversión en vivo', fxDayLabel:'7 días',
    historyTitle:'Registro completo de transacciones',
    colType:'Tipo', colAmount:'Monto USDC', colPayout:'Valor de pago', colCountry:'País', colTxHash:'Hash de transacción', colStatus:'Estado',
    landingDesc:'Remesas instantáneas de stablecoins entre fronteras con gas nativo USDC en la red Arc.',
    updating:'Red Arc', done:'Listo', remitLockedMessage:'Los servicios de remesas están temporalmente deshabilitados. La firma de cartera está bloqueada para esta función.',
  },
  hi: {
    dashboard:'डैशबोर्ड', balance:'शेष', p2pSend:'P2P डायरेक्ट भेजें', invoices:'चालान', fxMarket:'FX बाज़ार', allActivity:'सभी गतिविधि', disconnect:'डिसकनेक्ट',
    connectWallet:'OKX / MetaMask कनेक्ट करें', connectingWallet:'कनेक्ट हो रहा है...', availableBalance:'उपलब्ध शेष', arcNetwork:'Arc नेटवर्क',
    receiveUsdc:'USDC प्राप्त करें', requestInvoice:'चालान अनुरोध', remittanceTitle:'प्रेषण कैलकुलेटर',
    demoWarning:'Arc Testnet पर सिम्युलेटेड डेमो। फ़िएट रूपांतरण मॉक दरों का उपयोग कर रहा है।',
    youSend:'आप भेजें', recipientGets:'प्राप्तकर्ता को मिलता है', gasFee:'गैस / प्रेषण शुल्क', conversionRate:'विनिमय दर',
    transferMode:'ट्रांसफर मोड', gasNative:'नेटिव गैस', erc20Sys:'ERC20 सिस्टम',
    recipientAddress:'प्राप्तकर्ता EVM वॉलेट पता', recipientPlaceholder:'0x प्राप्तकर्ता पता',
    remitFunds:'धन भेजें', processing:'प्रोसेस हो रहा है...',
    recentRemittances:'हाल के प्रेषण', refresh:'रिफ्रेश',
    globalRoute:'ग्लोबल सेटलमेंट रूट', fxSparkline:'FX स्पार्कलाइन चार्ट',
    p2pTitle:'इंट्रा-चेन USDC पेमेंट',
    p2pDesc:'Arc नेटवर्क पर किसी अन्य EVM पते पर USDC ट्रांसफर करें।',
    recipientAddressLabel:'प्राप्तकर्ता पता (EVM)', amountLabel:'राशि (USDC)', transferModeLabel:'ट्रांसफर मोड',
    nativeGasFull:'नेटिव गैस (18 दशमलव)', erc20ContractFull:'ERC20 कॉन्ट्रैक्ट (6 दशमलव)',
    sendDirect:'USDC डायरेक्ट भेजें', broadcasting:'ट्रांजेक्शन ब्रॉडकास्ट हो रहा है...',
    invoiceTitle:'USDC चालान जेनरेटर',
    invoiceDesc:'भुगतान अनुरोध बनाने के लिए विवरण भरें। अन्य उपयोगकर्ता लिंक कॉपी करके तुरंत भुगतान कर सकते हैं।',
    requestAmountLabel:'अनुरोध राशि (USDC)', memoLabel:'मेमो / सेवाएं', memoPlaceholder:'उदा. वेबसाइट विकास अनुबंध',
    generateInvoice:'चालान लिंक और QR बनाएं',
    invoiceGenerated:'USDC अनुरोध बनाया गया', invoiceShare:'यह URL या QR अपने क्लाइंट को भेजें।',
    requestAmountText:'अनुरोध राशि:', memoText:'मेमो:', copyClose:'कॉपी करें और बंद करें', close:'बंद करें',
    trendsTitle:'लाइव रूपांतरण चार्ट', fxDayLabel:'7 दिन',
    historyTitle:'पूर्ण लेनदेन बहीखाता',
    colType:'प्रकार', colAmount:'USDC राशि', colPayout:'भुगतान मूल्य', colCountry:'देश', colTxHash:'ट्रांजेक्शन हैश', colStatus:'स्थिति',
    landingDesc:'Arc नेटवर्क पर USDC नेटिव Gas द्वारा तत्काल क्रॉस-बॉर्डर स्टेबलकॉइन प्रेषण।',
    updating:'Arc नेटवर्क', done:'ठीक है', remitLockedMessage:'प्रेषण सेवा अस्थायी रूप से अक्षम है। इस सुविधा के लिए वॉलेट हस्ताक्षर लॉक है।',
  },
  tl: {
    dashboard:'Dashboard', balance:'Balanse', p2pSend:'P2P Direktang Pagpapadala', invoices:'Mga Invoice', fxMarket:'FX Merkado', allActivity:'Lahat ng Aktibidad', disconnect:'Idiskonekta',
    connectWallet:'Ikonekta ang OKX / MetaMask', connectingWallet:'Nagkokonekta...', availableBalance:'Available na Balanse', arcNetwork:'Arc Network',
    receiveUsdc:'Tumanggap ng USDC', requestInvoice:'Humiling ng Invoice', remittanceTitle:'Kalkulador ng Remittance',
    demoWarning:'Simuladong demo sa Arc Testnet. Ang fiat conversion ay gumagamit ng mock rates.',
    youSend:'Ipadala mo', recipientGets:'Tatanggapin ng tatanggap', gasFee:'Gas / Bayad sa Remittance', conversionRate:'Rate ng Konbersyon',
    transferMode:'Mode ng Paglipat', gasNative:'Native Gas', erc20Sys:'ERC20 Sistema',
    recipientAddress:'EVM Wallet Address ng Tatanggap', recipientPlaceholder:'0x address ng tatanggap',
    remitFunds:'Magpadala ng Pondo sa', processing:'Pinoproseso...',
    recentRemittances:'Mga Kamakailang Remittance', refresh:'I-refresh',
    globalRoute:'Global Settlement Route', fxSparkline:'FX Sparkline Chart',
    p2pTitle:'Intra-chain na USDC Bayad',
    p2pDesc:'Ilipat ang USDC nang direkta sa ibang EVM address sa Arc Network.',
    recipientAddressLabel:'Address ng Tatanggap (EVM)', amountLabel:'Halaga (USDC)', transferModeLabel:'Mode ng Paglipat',
    nativeGasFull:'Native Gas (18 decimal)', erc20ContractFull:'ERC20 Kontrata (6 decimal)',
    sendDirect:'Direktang Magpadala ng USDC', broadcasting:'Nagbo-broadcast ng transaksyon...',
    invoiceTitle:'USDC Invoice Generator',
    invoiceDesc:'Punan ang mga detalye para makabuo ng kahilingan sa pagbabayad.',
    requestAmountLabel:'Halagang Hinihingi (USDC)', memoLabel:'Memo / Mga Serbisyo', memoPlaceholder:'Hal. Kontrata sa pagbuo ng website',
    generateInvoice:'Bumuo ng Invoice Link at QR',
    invoiceGenerated:'USDC Request ay Nabuo', invoiceShare:'Ipadala ang URL o QR na ito sa iyong kliyente.',
    requestAmountText:'Halagang Hinihingi:', memoText:'Memo:', copyClose:'Kopyahin at Isara', close:'Isara',
    trendsTitle:'Live na Tsart ng Konbersyon', fxDayLabel:'7 araw',
    historyTitle:'Kumpletong Talaan ng Transaksyon',
    colType:'Uri', colAmount:'Halaga ng USDC', colPayout:'Halaga ng Bayad', colCountry:'Bansa', colTxHash:'Hash ng Transaksyon', colStatus:'Katayuan',
    landingDesc:'Instant na cross-border stablecoin remittance gamit ang USDC native gas sa Arc network.',
    updating:'Arc Network', done:'Tapos na', remitLockedMessage:'Ang mga serbisyo ng remittance ay pansamantalang hindi pinagana. Ang wallet signing ay naka-lock para sa tampok na ito.',
  },
  sw: {
    dashboard:'Dashibodi', balance:'Salio', p2pSend:'Tuma P2P Moja kwa Moja', invoices:'Ankara', fxMarket:'Soko la FX', allActivity:'Shughuli Zote', disconnect:'Ondoa Muunganisho',
    connectWallet:'Unganisha OKX / MetaMask', connectingWallet:'Inaunganisha...', availableBalance:'Salio Linaloweza Kutumika', arcNetwork:'Mtandao wa Arc',
    receiveUsdc:'Pokea USDC', requestInvoice:'Omba Ankara', remittanceTitle:'Kikokotoo cha Uhamishaji',
    demoWarning:'Onyesho la mfano kwenye Arc Testnet. Ubadilishaji wa fedha unatumia viwango vya mazoezi.',
    youSend:'Unatuma', recipientGets:'Mpokeaji anapata', gasFee:'Gas / Ada ya Uhamishaji', conversionRate:'Kiwango cha Ubadilishaji',
    transferMode:'Hali ya Uhamishaji', gasNative:'Gas ya Asili', erc20Sys:'Mfumo wa ERC20',
    recipientAddress:'Anwani ya Pochi ya EVM ya Mpokeaji', recipientPlaceholder:'0x anwani ya mpokeaji',
    remitFunds:'Hamisha Fedha kwenda', processing:'Inachakata...',
    recentRemittances:'Uhamishaji wa Hivi Karibuni', refresh:'Onyesha upya',
    globalRoute:'Njia ya Makubaliano ya Kimataifa', fxSparkline:'Chati ya FX',
    p2pTitle:'Malipo ya USDC Ndani ya Mnyororo',
    p2pDesc:'Hamisha USDC moja kwa moja kwa anwani nyingine ya EVM kwenye Mtandao wa Arc.',
    recipientAddressLabel:'Anwani ya Mpokeaji (EVM)', amountLabel:'Kiasi (USDC)', transferModeLabel:'Hali ya Uhamishaji',
    nativeGasFull:'Gas ya Asili (desimali 18)', erc20ContractFull:'Mkataba wa ERC20 (desimali 6)',
    sendDirect:'Tuma USDC Moja kwa Moja', broadcasting:'Inasambaza muamala...',
    invoiceTitle:'Jenereta ya Ankara ya USDC',
    invoiceDesc:'Jaza maelezo ili kuunda ombi la malipo. Watumiaji wengine wanaweza kulipa mara moja.',
    requestAmountLabel:'Kiasi Kinachoombwa (USDC)', memoLabel:'Kumbukumbu / Huduma', memoPlaceholder:'Mf. Mkataba wa maendeleo ya tovuti',
    generateInvoice:'Tengeneza Kiungo cha Ankara na QR',
    invoiceGenerated:'Ombi la USDC Limeundwa', invoiceShare:'Tuma URL au QR hii kwa mteja wako.',
    requestAmountText:'Kiasi Kinachoombwa:', memoText:'Kumbukumbu:', copyClose:'Nakili na Funga', close:'Funga',
    trendsTitle:'Chati za Ubadilishaji wa Moja kwa Moja', fxDayLabel:'Siku 7',
    historyTitle:'Daftari Kamili la Muamala',
    colType:'Aina', colAmount:'Kiasi cha USDC', colPayout:'Thamani ya Malipo', colCountry:'Nchi', colTxHash:'Hash ya Muamala', colStatus:'Hali',
    landingDesc:'Uhamishaji wa fedha wa haraka wa stablecoin kwa kutumia USDC native gas kwenye mtandao wa Arc.',
    updating:'Mtandao wa Arc', done:'Imekamilika', remitLockedMessage:'Huduma za utumaji pesa zimezimwa kwa muda. Utiaji saini wa mkoba umefungwa kwa kipengele hiki.',
  },
};

function App() {

  // Navigation: 'dashboard', 'remit', 'p2p', 'invoice', 'trends', 'history'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Wallet & Connection State
  const [account, setAccount] = useState('');
  const [nativeBalance, setNativeBalance] = useState('0.00');
  const [erc20Balance, setErc20Balance] = useState('0.00');
  const [balanceToUse, setBalanceToUse] = useState('native'); // 'native' or 'erc20'
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Wise Remittance State
  const [remitAmount, setRemitAmount] = useState('100');
  const [remitRecipient, setRemitRecipient] = useState('');
  const [targetCountryId, setTargetCountryId] = useState('VN');
  const [remitTransferType, setRemitTransferType] = useState('native'); // 'native' or 'erc20'
  const [isRemitting, setIsRemitting] = useState(false);
  
  // Direct P2P State
  const [p2pRecipient, setP2pRecipient] = useState('');
  const [p2pAmount, setP2pAmount] = useState('');
  const [p2pTransferType, setP2pTransferType] = useState('native');
  const [isP2pSending, setIsP2pSending] = useState(false);

  // Invoice / Payment Request State
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDesc, setInvoiceDesc] = useState('');
  const [generatedInvoiceLink, setGeneratedInvoiceLink] = useState('');
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('arc_pay_theme') || 'dark';
  });

  // Copy flags & Modals
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeChartTab, setActiveChartTab] = useState('VND');
  
  // Custom dropdown triggers
  const [wiseDropdownOpen, setWiseDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

  const wiseDropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const nodeTimerRef = useRef(null);

  // i18n helper
  const t = (key) => TRANSLATIONS[selectedLang.code]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  // Node jumping state
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);

  // Transactions list with LocalStorage fallback
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('arc_pay_txs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out demo transactions
        return parsed.filter(tx => !['tx-1', 'tx-2', 'tx-3', 'tx-4'].includes(tx.id));
      } catch (e) {
        console.error('Failed parsing cached transactions:', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('arc_pay_txs', JSON.stringify(transactions));
  }, [transactions]);

  const selectedCountry = COUNTRIES.find(c => c.id === targetCountryId);

  // Set up event listeners for OKX / MetaMask account changes
  useEffect(() => {
    const provider = window.okxwallet || window.ethereum;
    if (provider) {
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      
      // Auto-connect if already authorized
      provider.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch(err => console.error('Error auto-connecting:', err));
    }
    
    // Parse URL for invoice parameters
    const params = new URLSearchParams(window.location.search);
    const payAddress = params.get('pay');
    const payAmount = params.get('amount');
    const payDesc = params.get('desc');
    
    if (payAddress && payAmount) {
      setRemitRecipient(payAddress);
      setRemitAmount(payAmount);
      setActiveTab('dashboard');
      addToast('info', `Invoice loaded: Requesting ${payAmount} USDC for "${payDesc || 'Payment'}"`);
    }

    return () => {
      const provider = window.okxwallet || window.ethereum;
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Fetch balances when account or network changes
  useEffect(() => {
    if (account) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 8000);
      return () => clearInterval(interval);
    }
  }, [account, network]);

  // Close country select dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wiseDropdownRef.current && !wiseDropdownRef.current.contains(event.target)) {
        setWiseDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync theme with body class list
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('arc_pay_theme', theme);
  }, [theme]);

  // Node jumping timer
  useEffect(() => {
    nodeTimerRef.current = setInterval(() => {
      setActiveNodeIndex((prev) => (prev + 1) % MAP_NODES.length);
    }, 4000);
    return () => clearInterval(nodeTimerRef.current);
  }, []);

  // Toast System Helper
  const addToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      addToast('success', `Wallet connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
    } else {
      setAccount('');
      setNativeBalance('0.00');
      setErc20Balance('0.00');
      addToast('warning', 'Wallet disconnected.');
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  // Connect Wallet & Switch to Arc Testnet
  const connectWallet = async () => {
    const provider = window.okxwallet || window.ethereum;
    if (!provider) {
      addToast('error', 'Web3 provider not found. Please install OKX Wallet or MetaMask.');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const activeAccount = accounts[0];

      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      
      if (chainIdHex !== ARC_TESTNET_PARAMS.chainId) {
        addToast('info', 'Switching network to Arc Testnet...');
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ARC_TESTNET_PARAMS.chainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [ARC_TESTNET_PARAMS],
              });
            } catch (addError) {
              addToast('error', `Failed to add Arc Testnet: ${addError.message}`);
              setIsConnecting(false);
              return;
            }
          } else {
            addToast('error', `Failed to switch network: ${switchError.message}`);
            setIsConnecting(false);
            return;
          }
        }
      }

      // Request user signature to authenticate/verify identity
      addToast('info', 'Please sign the message in your wallet...');
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      await signer.signMessage('Welcome to Arc Payment! Click sign to securely authenticate your wallet.');
      
      setAccount(activeAccount);
      setNetwork({ name: 'Arc Testnet', chainId: 5042002, isCorrect: true });
      addToast('success', 'Wallet successfully connected and signed!');
      await fetchBalances();

    } catch (err) {
      addToast('error', `Connection or sign error: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setNativeBalance('0.00');
    setErc20Balance('0.00');
    setNetwork(null);
    addToast('info', 'Wallet disconnected.');
  };

  // Fetch balances
  const fetchBalances = async () => {
    const providerEnv = window.okxwallet || window.ethereum;
    if (!providerEnv || !account) return;

    try {
      const provider = new ethers.BrowserProvider(providerEnv);
      
      const nativeVal = await provider.getBalance(account);
      const formattedNative = parseFloat(ethers.formatEther(nativeVal)).toFixed(2);
      setNativeBalance(formattedNative);

      const usdcContract = new ethers.Contract(
        USDC_SYSTEM_CONTRACT,
        [
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)'
        ],
        provider
      );
      
      let formattedErc20 = '0.00';
      try {
        const erc20Val = await usdcContract.balanceOf(account);
        const decimals = await usdcContract.decimals().catch(() => 6);
        formattedErc20 = parseFloat(ethers.formatUnits(erc20Val, decimals)).toFixed(2);
      } catch (err) {
        console.warn('System contract check skipped/failed:', err);
      }
      setErc20Balance(formattedErc20);

      const networkData = await provider.getNetwork();
      const isCorrectNetwork = Number(networkData.chainId) === 5042002;
      setNetwork({
        name: isCorrectNetwork ? 'Arc Testnet' : networkData.name,
        chainId: Number(networkData.chainId),
        isCorrect: isCorrectNetwork
      });

    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBalances();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

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
    addToast('success', 'Invoice payment link copied!');
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  // Trigger cross-border Wise remittance
  const handleRemitTransfer = async (e) => {
    e.preventDefault();
    addToast('error', t('remitLockedMessage'));
  };

  // Trigger P2P Direct Payout
  const handleP2pTransfer = async (e) => {
    e.preventDefault();

    if (!account) {
      addToast('error', 'Please connect your wallet first.');
      return;
    }

    if (!network?.isCorrect) {
      addToast('error', 'Incorrect network. Please switch to Arc Testnet.');
      return;
    }

    let cleanedRecipient = p2pRecipient.trim();
    if (/^[oO]x/i.test(cleanedRecipient)) {
      cleanedRecipient = '0x' + cleanedRecipient.substring(2);
      setP2pRecipient(cleanedRecipient);
    }

    if (!ethers.isAddress(cleanedRecipient)) {
      addToast('error', 'Invalid EVM address.');
      return;
    }

    const parsedAmount = parseFloat(p2pAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast('error', 'Please enter a valid amount.');
      return;
    }

    const balanceAvailable = parseFloat(balanceToUse === 'native' ? nativeBalance : erc20Balance);
    if (parsedAmount > balanceAvailable) {
      addToast('error', `Insufficient balance. Available: ${balanceAvailable} USDC.`);
      return;
    }

    setIsP2pSending(true);
    try {
      const providerEnv = window.okxwallet || window.ethereum;
      const provider = new ethers.BrowserProvider(providerEnv);
      const signer = await provider.getSigner();
      
      let txHash = '';
      
      if (p2pTransferType === 'native') {
        const valueInWei = ethers.parseEther(p2pAmount);
        addToast('info', `Sending direct native USDC transfer...`);
        const tx = await signer.sendTransaction({
          to: p2pRecipient,
          value: valueInWei
        });
        txHash = tx.hash;
        addToast('info', `Transaction submitted. Waiting for inclusion...`);
        await tx.wait();
      } else {
        const usdcContract = new ethers.Contract(
          USDC_SYSTEM_CONTRACT,
          [
            'function transfer(address, uint256) returns (bool)',
            'function decimals() view returns (uint8)'
          ],
          signer
        );
        const decimals = await usdcContract.decimals().catch(() => 6);
        const valueInUnits = ethers.parseUnits(p2pAmount, decimals);
        addToast('info', `Sending direct ERC-20 contract transfer...`);
        const tx = await usdcContract.transfer(p2pRecipient, valueInUnits);
        txHash = tx.hash;
        addToast('info', `Transaction submitted. Waiting for inclusion...`);
        await tx.wait();
      }

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      const newTx = {
        id: `tx-${Date.now()}`,
        type: 'sent',
        amount: parsedAmount.toFixed(2),
        recipient: p2pRecipient,
        country: 'Intra-chain',
        localAmount: parsedAmount.toFixed(2),
        localSymbol: '$',
        status: 'completed',
        hash: txHash,
        time: 'Just now',
        transferType: p2pTransferType
      };

      setTransactions(prev => [newTx, ...prev]);
      addToast('success', `Sent $${p2pAmount} USDC direct to ${p2pRecipient.substring(0, 6)}...`);
      
      setP2pAmount('');
      setP2pRecipient('');
      setActiveTab('dashboard');
      fetchBalances();

    } catch (err) {
      console.error('Direct transfer failed:', err);
      addToast('error', `Transaction failed: ${err.reason || err.message}`);
    } finally {
      setIsP2pSending(false);
    }
  };

  // Generate shareable invoice payment link
  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!account) {
      addToast('error', 'Please connect your wallet first.');
      return;
    }
    
    const parsedAmt = parseFloat(invoiceAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      addToast('error', 'Please enter a valid amount.');
      return;
    }

    const currentUrl = window.location.origin + window.location.pathname;
    const link = `${currentUrl}?pay=${account}&amount=${parsedAmt}&desc=${encodeURIComponent(invoiceDesc || 'Services')}`;
    setGeneratedInvoiceLink(link);
    setInvoiceModalOpen(true);
  };

  // Render SVG Path based on selected rate chart
  const renderChartPath = () => {
    const data = HISTORICAL_RATES[activeChartTab];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const padding = (max - min) * 0.1 || 10;
    const yMin = min - padding;
    const yMax = max + padding;
    
    const points = data.map((val, index) => {
      const x = (index / (data.length - 1)) * 340 + 40; // width of 340, offset 40
      const y = 180 - ((val - yMin) / (yMax - yMin)) * 140; // height of 180, offset 140
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const activeNode = MAP_NODES[activeNodeIndex];
  
  // Calculator inputs helper
  const parsedRemitAmount = parseFloat(remitAmount) || 0;
  const remitResultValue = (parsedRemitAmount * selectedCountry.rate).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: selectedCountry.id === 'MX' || selectedCountry.id === 'IN' ? 2 : 0
  });

  return (
    <div className="app-container">
      {/* Background Glowing Effects */}
      <div className="glow-background">
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
      </div>

      {/* Stripe-style Left Sidebar Nav (Only visible when connected) */}
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
                  <button type="button" className={`sidebar-nav-item ${activeTab === 'p2p' ? 'active' : ''}`} onClick={() => setActiveTab('p2p')}>
                    <ArrowUpRight className="size-5" />
                    <span>{t('p2pSend')}</span>
                  </button>
                </li>
                <li>
                  <button type="button" className={`sidebar-nav-item ${activeTab === 'invoice' ? 'active' : ''}`} onClick={() => setActiveTab('invoice')}>
                    <FileText className="size-5" />
                    <span>{t('invoices')}</span>
                  </button>
                </li>
                <li>
                  <button type="button" className={`sidebar-nav-item ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>
                    <TrendingUp className="size-5" />
                    <span>{t('fxMarket')}</span>
                  </button>
                </li>
                <li>
                  <button type="button" className={`sidebar-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    <List className="size-5" />
                    <span>{t('allActivity')}</span>
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

      {/* Main Panel Viewport */}
      {account ? (
        <main className="stripe-main-content">
          {/* Top Bar for address and network details */}
          <div className="stripe-top-bar">
            <span className="built-on-arc">
              Built on Arc
            </span>
            {network && (
              <span className="network-badge-label">
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
                id="lang-selector-btn"
                className="lang-selector-trigger"
                onClick={() => setLangDropdownOpen(prev => !prev)}
                aria-label="Select language"
              >
                <img src={`https://flagcdn.com/w40/${selectedLang.flagCode}.png`} alt={selectedLang.label} className="lang-flag-img" />
                <span className="lang-label">{selectedLang.label}</span>
                <ChevronDown className={`size-3 lang-chevron ${langDropdownOpen ? 'open' : ''}`} />
              </button>
              {langDropdownOpen && (
                <div className="lang-dropdown" role="listbox" aria-label="Language options">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      role="option"
                      aria-selected={selectedLang.code === lang.code}
                      className={`lang-option ${selectedLang.code === lang.code ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedLang(lang);
                        setLangDropdownOpen(false);
                        addToast('info', `Language set to ${lang.label}`);
                      }}
                    >
                      <img src={`https://flagcdn.com/w40/${lang.flagCode}.png`} alt={lang.label} className="lang-flag-img" />
                      <span>{lang.label}</span>
                      {selectedLang.code === lang.code && <Check className="size-3" style={{ marginLeft: 'auto', color: 'hsl(var(--secondary))' }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="wallet-badge-connected" onClick={copyAddressToClipboard} style={{ cursor: 'pointer' }}>
              <Wallet className="size-4 text-emerald-400" />
              <span>{account.substring(0, 6)}...{account.substring(38)}</span>
              {copiedAddress ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            </div>
          </div>

          {/* Conditional view rendering */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="dashboard-grid">
                
                {/* Left Column: Balances and Remittance widget */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Balances Card */}
                  <div className="stripe-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('availableBalance')}</h3>
                      <span className="updating-status-badge">{t('arcNetwork')}</span>
                    </div>
                    <div className="balance-display-box">
                      <span className="balance-large-amount">
                        ${nativeBalance}
                      </span>
                      <span className="balance-large-currency">USDC</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        type="button" 
                        className="stripe-btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setReceiveModalOpen(true)}
                      >
                        <ArrowDownLeft className="size-4" />
                        {t('receiveUsdc')}
                      </button>
                      <button 
                        type="button" 
                        className="stripe-btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setActiveTab('invoice')}
                      >
                        <FileText className="size-4" />
                        {t('requestInvoice')}
                      </button>
                    </div>
                  </div>

                  {/* Wise-style Stacked Remittance Calculator */}
                  <div className="stripe-card">
                    <h2>
                      <Send className="text-sky-400 size-5" />
                      {t('remittanceTitle')}
                    </h2>

                    <div className="warning-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.25)', color: 'hsl(var(--text-primary))', display: 'flex', alignItems: 'flex-start' }}>
                      <Lock className="size-4 text-rose-500 shrink-0" style={{ marginTop: '2px' }} />
                      <span>{t('remitLockedMessage')}</span>
                    </div>

                    <form onSubmit={handleRemitTransfer}>
                      <div className="wise-calculator">
                        
                        {/* Box 1: You Send */}
                        <div className="wise-input-box" style={{ opacity: 0.65 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label htmlFor="wise-send-amount" style={{ margin: 0 }}>{t('youSend')}</label>
                            <button 
                              type="button"
                              style={{ background: 'none', border: 'none', padding: 0, fontSize: '11px', color: 'hsl(var(--text-muted))', fontWeight: '500', cursor: 'not-allowed', fontFamily: 'var(--font-body)' }}
                              disabled
                            >
                              {t('balance')}: <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>{nativeBalance}</span> USDC
                            </button>
                          </div>
                          <div className="wise-input-row">
                            <input 
                              type="number" 
                              id="wise-send-amount"
                              className="wise-number-input"
                              placeholder="0.00" 
                              value={remitAmount}
                              onChange={(e) => setRemitAmount(e.target.value)}
                              required
                              disabled
                              style={{ cursor: 'not-allowed' }}
                            />
                            <div className="wise-currency-trigger" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
                              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300E6C3' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 6v12M6 12h12'/%3E%3C/svg%3E" alt="USDC Logo" style={{ width: '16px' }} />
                              <span>USDC</span>
                            </div>
                          </div>
                        </div>

                        {/* Connector flow detail tree */}
                        <div className="wise-flow-tree" style={{ opacity: 0.5 }}>
                          <div className="wise-flow-line"></div>
                          
                          <div className="wise-flow-node active">
                            <div className="wise-flow-bullet"></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                              <span className="wise-flow-label">{t('gasFee')}:</span>
                              <span className="wise-flow-value highlight-green">0.00 USDC Promo</span>
                            </div>
                          </div>

                          <div className="wise-flow-node">
                            <div className="wise-flow-bullet"></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                              <span className="wise-flow-label">{t('conversionRate')}:</span>
                              <span className="wise-flow-value">1 USDC = {selectedCountry.rate.toLocaleString()} {selectedCountry.currency}</span>
                            </div>
                          </div>
                          

                        </div>

                        {/* Box 2: Recipient Gets */}
                        <div className="wise-input-box" style={{ marginBottom: '20px', opacity: 0.65 }}>
                          <label>{t('recipientGets')}</label>
                          <div className="wise-input-row">
                            <input 
                              type="text" 
                              className="wise-number-input"
                              readOnly 
                              disabled
                              value={remitResultValue}
                              style={{ cursor: 'not-allowed' }}
                            />
                            <button
                              type="button"
                              className="wise-currency-trigger"
                              style={{ cursor: 'not-allowed', opacity: 0.7 }}
                              disabled
                            >
                              <span style={{ fontSize: '18px', lineHeight: 1 }}>{selectedCountry.flag}</span>
                              <span>{selectedCountry.currency}</span>
                              <ChevronDown className="size-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>

                      <div className="form-group" style={{ marginBottom: '16px', opacity: 0.65 }}>
                        <label className="form-label" htmlFor="calc-recipient-address">{t('recipientAddress')}</label>
                        <div className="input-container" style={{ margin: 0 }}>
                          <div className="input-icon-left">
                            <Wallet className="size-4" />
                          </div>
                          <input 
                            type="text" 
                            id="calc-recipient-address"
                            className="input-field" 
                            placeholder={t('recipientPlaceholder')} 
                            value={remitRecipient}
                            onChange={(e) => setRemitRecipient(e.target.value)}
                            required
                            disabled
                            style={{ cursor: 'not-allowed' }}
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="stripe-btn-primary" 
                        disabled 
                        style={{ 
                          opacity: 0.6, 
                          cursor: 'not-allowed', 
                          background: 'linear-gradient(135deg, hsl(var(--border-color)) 0%, rgba(100,116,139,0.3) 100%)', 
                          borderColor: 'hsla(var(--border-color), 0.8)',
                          color: 'hsl(var(--text-muted))'
                        }}
                      >
                        <Lock className="size-4 text-rose-500" />
                        {t('remitFunds')} {selectedCountry.name}
                      </button>
                    </form>
                  </div>

                </div>

                {/* Right Column: Ledger centerpiece and rate trends */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  

                  {/* FX Rate Sparkline trends */}
                  <div className="stripe-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2>
                        <TrendingUp className="text-emerald-400 size-5" />
                        {t('fxSparkline')}
                      </h2>
                      <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>{activeChartTab} {t('fxDayLabel')}</span>
                    </div>

                    <div className="chart-card-body">
                      <svg viewBox="0 0 400 200" width="100%" height="100%">
                        <defs>
                          <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>

                        <line x1="40" y1="40" x2="380" y2="40" className="chart-grid-line" />
                        <line x1="40" y1="110" x2="380" y2="110" className="chart-grid-line" />
                        <line x1="40" y1="180" x2="380" y2="180" className="chart-grid-line" />

                        <path d={renderChartPath()} className="chart-path" />

                        {HISTORICAL_RATES[activeChartTab].map((val, index) => {
                          const min = Math.min(...HISTORICAL_RATES[activeChartTab]);
                          const max = Math.max(...HISTORICAL_RATES[activeChartTab]);
                          const padding = (max - min) * 0.1 || 10;
                          const yMin = min - padding;
                          const yMax = max + padding;
                          
                          const x = (index / (HISTORICAL_RATES[activeChartTab].length - 1)) * 340 + 40;
                          const y = 180 - ((val - yMin) / (yMax - yMin)) * 140;

                          return (
                            <g key={index}>
                              <circle cx={x} cy={y} r="3.5" fill="hsl(var(--secondary))" stroke="hsl(var(--bg-card))" strokeWidth="1" />
                            </g>
                          );
                        })}

                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'].map((day, index) => {
                          const x = (index / 6) * 340 + 40;
                          return (
                            <text key={day} x={x} y="196" textAnchor="middle" className="chart-axis-text" style={{ fontSize: '9px' }}>
                              {day}
                            </text>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                </div>
              </div>

              {/* Stripe-style recent transactions table log (Dashboard version) */}
              <div className="stripe-card stripe-table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 600 }}>{t('recentRemittances')}</h3>
                  <button 
                    type="button" 
                    className="stripe-btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={handleRefresh}
                  >
                    <RefreshCw className={`size-3 ${isRefreshing ? 'spin-animation' : ''}`} />
                    {t('refresh')}
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="stripe-table">
                    <thead>
                      <tr>
                        <th>{t('colType')}</th>
                        <th>{t('colAmount')}</th>
                        <th>{t('colPayout')}</th>
                        <th>{t('colCountry')}</th>
                        <th>{t('colTxHash')}</th>
                        <th>{t('colStatus')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map(tx => (
                        <tr key={tx.id}>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {tx.type === 'sent' ? (
                                <ArrowUpRight className="text-red-400 size-4" />
                              ) : (
                                <ArrowDownLeft className="text-emerald-400 size-4" />
                              )}
                              <span style={{ fontWeight: 600 }}>{tx.type}</span>
                            </span>
                          </td>
                          <td style={{ fontWeight: 'bold' }}>
                            ${tx.amount} USDC
                          </td>
                          <td style={{ color: 'hsl(var(--secondary))', fontWeight: 600 }}>
                            {tx.localSymbol}{tx.localAmount}
                          </td>
                          <td>
                            {tx.country === 'Global' ? (
                              <span>🌎 Global</span>
                            ) : tx.country === 'Intra-chain' ? (
                              <span>⛓️ Intra-chain</span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '16px' }}>
                                  {tx.country === 'Vietnam'     ? '🇻🇳' :
                                   tx.country === 'India'       ? '🇮🇳' :
                                   tx.country === 'Philippines' ? '🇵🇭' :
                                   tx.country === 'Indonesia'   ? '🇮🇩' : '🌐'}
                                </span>
                                <span>{tx.country}</span>
                              </span>
                            )}
                          </td>
                          <td>
                            <a 
                              href={`${ARC_TESTNET_PARAMS.blockExplorerUrls[0]}/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tx-link"
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

          {/* Peer to Peer Direct Payout View */}
          {activeTab === 'p2p' && (
            <div className="stripe-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <h2>
                <ArrowUpRight className="text-indigo-400 size-6" />
                {t('p2pTitle')}
              </h2>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13.5px', marginBottom: '24px' }}>
                {t('p2pDesc')}
              </p>

              <form onSubmit={handleP2pTransfer} className="quick-p2p-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="p2p-recipient-address">{t('recipientAddressLabel')}</label>
                  <div className="input-container">
                    <div className="input-icon-left">
                      <Wallet className="size-4" />
                    </div>
                    <input 
                      type="text" 
                      id="p2p-recipient-address"
                      className="input-field" 
                      placeholder={t('recipientPlaceholder')} 
                      value={p2pRecipient}
                      onChange={(e) => setP2pRecipient(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" htmlFor="p2p-amount" style={{ marginBottom: 0 }}>{t('amountLabel')}</label>
                    <button 
                      type="button"
                      onClick={() => setP2pAmount(nativeBalance)}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: '11px', color: 'hsl(var(--text-secondary))', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                    >
                      {t('balance')}: <span style={{ color: 'hsl(var(--secondary))', fontWeight: 'bold' }}>{nativeBalance}</span> USDC
                    </button>
                  </div>
                  <div className="input-container">
                    <div className="input-icon-left">
                      <DollarSign className="size-4" />
                    </div>
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

                <button 
                  type="submit" 
                  className="stripe-btn-primary" 
                  disabled={isP2pSending}
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}
                >
                  <Send className="size-4" />
                  {isP2pSending ? t('broadcasting') : t('sendDirect')}
                </button>
              </form>
            </div>
          )}

          {/* Invoices View */}
          {activeTab === 'invoice' && (
            <div className="stripe-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <h2>
                <FileText className="text-indigo-400 size-6" />
                {t('invoiceTitle')}
              </h2>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13.5px', marginBottom: '24px' }}>
                {t('invoiceDesc')}
              </p>

              <form onSubmit={handleGenerateInvoice}>
                <div className="form-group">
                  <label className="form-label" htmlFor="invoice-amount-box">{t('requestAmountLabel')}</label>
                  <div className="input-container">
                    <div className="input-icon-left">
                      <DollarSign className="size-4" />
                    </div>
                    <input 
                      type="number" 
                      id="invoice-amount-box"
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
                  <label className="form-label" htmlFor="invoice-desc-box">{t('memoLabel')}</label>
                  <div className="input-container">
                    <div className="input-icon-left">
                      <FileText className="size-4" />
                    </div>
                    <input 
                      type="text" 
                      id="invoice-desc-box"
                      className="input-field" 
                      placeholder={t('memoPlaceholder')} 
                      value={invoiceDesc}
                      onChange={(e) => setInvoiceDesc(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="stripe-btn-primary"
                >
                  <QrCode className="size-4" />
                  {t('generateInvoice')}
                </button>
              </form>
            </div>
          )}

          {/* Live FX Rates view */}
          {activeTab === 'trends' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="stripe-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>
                    <TrendingUp className="text-emerald-400 size-5" />
                    {t('trendsTitle')}
                  </h2>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {COUNTRIES.map(c => (
                      <button 
                        key={c.id} 
                        type="button" 
                        className={`stripe-btn-secondary ${activeChartTab === c.currency ? 'active' : ''}`}
                        onClick={() => setActiveChartTab(c.currency)}
                        style={{ padding: '5px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <span style={{ fontSize: '14px' }}>{c.flag}</span>
                        {c.currency}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ height: '320px', width: '100%', marginBottom: '24px' }}>
                  <svg viewBox="0 0 400 200" width="100%" height="100%">
                    <defs>
                      <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>

                    <line x1="40" y1="40" x2="380" y2="40" className="chart-grid-line" />
                    <line x1="40" y1="110" x2="380" y2="110" className="chart-grid-line" />
                    <line x1="40" y1="180" x2="380" y2="180" className="chart-grid-line" />

                    <path d={renderChartPath()} className="chart-path" />

                    {HISTORICAL_RATES[activeChartTab].map((val, index) => {
                      const min = Math.min(...HISTORICAL_RATES[activeChartTab]);
                      const max = Math.max(...HISTORICAL_RATES[activeChartTab]);
                      const padding = (max - min) * 0.1 || 10;
                      const yMin = min - padding;
                      const yMax = max + padding;
                      
                      const x = (index / (HISTORICAL_RATES[activeChartTab].length - 1)) * 340 + 40;
                      const y = 180 - ((val - yMin) / (yMax - yMin)) * 140;

                      return (
                        <g key={index}>
                          <circle cx={x} cy={y} r="5" fill="hsl(var(--secondary))" stroke="hsl(var(--bg-card))" strokeWidth="2" />
                          <text x={x} y={y - 10} textAnchor="middle" fill="#fff" fontSize="10" fontFamily="Space Grotesk" fontWeight="bold">
                            {val.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </text>
                        </g>
                      );
                    })}

                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'].map((day, index) => {
                      const x = (index / 6) * 340 + 40;
                      return (
                        <text key={day} x={x} y="196" textAnchor="middle" className="chart-axis-text" style={{ fontSize: '10px' }}>
                          {day}
                        </text>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <div className="rate-grid">
                {COUNTRIES.map(c => (
                  <div key={c.id} className="rate-item">
                    <div className="rate-item-header">
                      <span className="rate-item-flag">{c.flag}</span>
                      <span className="rate-item-name">{c.name}</span>
                      <span className="rate-item-currency">{c.currency}</span>
                    </div>
                    <div className="rate-item-value">{c.symbol}{c.rate.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Activity View */}
          {activeTab === 'history' && (
            <div className="stripe-card stripe-table-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>
                  <List className="text-sky-300 size-6" />
                  {t('historyTitle')}
                </h2>
                <button 
                  type="button" 
                  className="stripe-btn-secondary" 
                  onClick={handleRefresh}
                >
                  <RefreshCw className={`size-4 mr-2 ${isRefreshing ? 'spin-animation' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="table-responsive">
                <table className="stripe-table">
                  <thead>
                    <tr>
                      <th>{t('colType')}</th>
                      <th>{t('colAmount')}</th>
                      <th>{t('colPayout')}</th>
                      <th>{t('colCountry')}</th>
                      <th>{t('colTxHash')}</th>
                      <th>{t('colStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id}>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {tx.type === 'sent' ? (
                              <ArrowUpRight className="text-red-400 size-4" />
                            ) : (
                              <ArrowDownLeft className="text-emerald-400 size-4" />
                            )}
                            <span style={{ fontWeight: 600 }}>{tx.type}</span>
                          </span>
                        </td>
                        <td style={{ fontWeight: 'bold' }}>
                          ${tx.amount} USDC
                        </td>
                        <td style={{ color: 'hsl(var(--secondary))', fontWeight: 600 }}>
                          {tx.localSymbol}{tx.localAmount}
                        </td>
                        <td>
                          {tx.country === 'Global' ? (
                            <span>🌎 Global</span>
                          ) : tx.country === 'Intra-chain' ? (
                            <span>⛓️ P2P Send</span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '16px' }}>
                                {tx.country === 'Vietnam'     ? '🇻🇳' :
                                 tx.country === 'India'       ? '🇮🇳' :
                                 tx.country === 'Philippines' ? '🇵🇭' :
                                 tx.country === 'Indonesia'   ? '🇮🇩' : '🌐'}
                              </span>
                              <span>{tx.country}</span>
                            </span>
                          )}
                        </td>
                        <td>
                          <a 
                            href={`${ARC_TESTNET_PARAMS.blockExplorerUrls[0]}/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tx-link"
                          >
                            {tx.hash.substring(0, 16)}...
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
          )}

        </main>
      ) : (
        /* Unconnected Landing Page View */
        <div className="app-landing-screen">
          <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
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
              <div className="spinning-globe-container" style={{ width: '64px', height: '64px' }}>
                <div className="spinning-globe"></div>
              </div>
            </div>
            <h1>Arc Pay</h1>
            <p style={{ fontSize: '18px', color: 'hsl(var(--text-secondary))', lineHeight: '1.6', marginBottom: '36px' }}>
              {t('landingDesc')}
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn-landing-primary" 
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <Wallet className="size-5" />
                {isConnecting ? t('connectingWallet') : t('connectWallet')}
              </button>
              <a 
                href="https://docs.arc.io" 
                target="_blank" 
                rel="noreferrer" 
                className="btn-landing-secondary"
              >
                Read Integration Docs
                <ExternalLink className="size-4" />
              </a>
            </div>

            <div className="rate-grid" style={{ marginTop: '56px' }}>
              {COUNTRIES.map(c => (
                <div key={c.id} className="rate-item">
                  <img 
                    src={`https://flagcdn.com/w40/${c.id.toLowerCase()}.png`} 
                    alt="" 
                    style={{ display: 'block', margin: '0 auto 8px', width: '24px', borderRadius: '1.5px' }}
                  />
                  <span className="rate-item-name">{c.name}</span>
                  <span className="rate-item-value">{c.symbol}{c.rate.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Receive USDC Modal (Deposit QR code) */}
      {receiveModalOpen && (
        <div className="modal-overlay" onClick={() => setReceiveModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={() => setReceiveModalOpen(false)}
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
            <h2 style={{ justifyContent: 'center' }}>Receive USDC on Arc</h2>
            <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>
              Scan this QR code or copy the address below to receive USDC. Ensure the sender is using the **Arc Testnet**.
            </p>
            
            <div className="qr-code-wrapper">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${account}`} 
                alt="EVM Deposit QR Code" 
                style={{ display: 'block', width: '160px', height: '160px' }}
              />
            </div>

            <div className="stripe-address-bar" style={{ cursor: 'pointer' }} onClick={copyAddressToClipboard}>
              <span style={{ fontSize: '11px', wordBreak: 'break-all' }}>{account}</span>
              <button type="button" aria-label="Copy address">
                {copiedAddress ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              </button>
            </div>

            <button 
              type="button" 
              className="stripe-btn-primary" 
              style={{ marginTop: '20px' }}
              onClick={() => setReceiveModalOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Invoice Created Modal (Share QR / Payment Link) */}
      {invoiceModalOpen && (
        <div className="modal-overlay" onClick={() => setInvoiceModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={() => setInvoiceModalOpen(false)}
              aria-label="Close invoice modal"
            >
              <X className="size-5" />
            </button>
            <h2 style={{ justifyContent: 'center' }}>USDC Request Generated</h2>
            <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>
              Send this request URL or QR to your client. They can open it directly in this app to approve the payment.
            </p>
            
            <div className="qr-code-wrapper">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(generatedInvoiceLink)}`} 
                alt="USDC Invoice QR Code" 
                style={{ display: 'block', width: '160px', height: '160px' }}
              />
            </div>

            <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid hsla(var(--border-color), 0.5)', borderRadius: '10px', padding: '12px', fontSize: '13px', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('requestAmountText')}</span>
                <span style={{ fontWeight: 'bold' }}>{invoiceAmount} USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>{t('memoText')}</span>
                <span style={{ fontStyle: 'italic' }}>{invoiceDesc || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={generatedInvoiceLink} 
                  className="input-field" 
                  style={{ padding: '8px', fontSize: '11px', flex: 1, paddingLeft: '8px' }}
                />
                <button 
                  type="button" 
                  className="stripe-btn-secondary" 
                  style={{ padding: '8px' }}
                  onClick={copyInvoiceToClipboard}
                  aria-label="Copy invoice link"
                >
                  {copiedInvoice ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="stripe-btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => {
                  setInvoiceModalOpen(false);
                  setActiveTab('dashboard');
                }}
              >
                {t('close')}
              </button>
              <button 
                type="button" 
                className="stripe-btn-primary" 
                style={{ flex: 1 }}
                onClick={() => {
                  copyInvoiceToClipboard();
                  setInvoiceModalOpen(false);
                  setActiveTab('dashboard');
                }}
              >
                {t('copyClose')}
              </button>
            </div>
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
