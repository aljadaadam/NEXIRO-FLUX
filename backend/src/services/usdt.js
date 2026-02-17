/**
 * ─── USDT Crypto Payment Processor ───
 * يدعم: TRC20 (Tron), ERC20 (Ethereum), BEP20 (BSC)
 * 
 * Flow:
 * 1. createPayment() → يرجع عنوان المحفظة + المبلغ المطلوب
 * 2. العميل يرسل USDT للعنوان
 * 3. checkPayment() → يتحقق من البلوكتشين تلقائياً
 * 
 * APIs المستخدمة:
 * - TRC20: TronGrid API (مجاني)
 * - ERC20: Etherscan API 
 * - BEP20: BSCScan API
 */
const axios = require('axios');

// عقود USDT على كل شبكة
const USDT_CONTRACTS = {
  TRC20: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  ERC20: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  BEP20: '0x55d398326f99059fF775485246999027B3197955',
};

class USDTProcessor {
  constructor(config) {
    this.walletAddress = config.wallet_address;
    this.network = config.network || 'TRC20'; // TRC20, ERC20, BEP20
    this.apiKey = config.api_key || ''; // مفتاح API لـ BscScan / Etherscan / TronGrid
  }

  // ─── إنشاء طلب دفع (عرض العنوان والمبلغ) ───
  createPayment({ amount, referenceId }) {
    return {
      walletAddress: this.walletAddress,
      network: this.network,
      amount: parseFloat(amount).toFixed(2),
      currency: 'USDT',
      referenceId,
      contractAddress: USDT_CONTRACTS[this.network],
      instructions: this._getInstructions(),
      status: 'AWAITING_PAYMENT',
    };
  }

  // ─── التحقق من وصول الدفع ───
  async checkPayment({ amount, sinceTimestamp }) {
    try {
      switch (this.network) {
        case 'TRC20':
          return await this._checkTRC20(amount, sinceTimestamp);
        case 'ERC20':
          return await this._checkERC20(amount, sinceTimestamp);
        case 'BEP20':
          return await this._checkBEP20(amount, sinceTimestamp);
        default:
          throw new Error(`شبكة غير مدعومة: ${this.network}`);
      }
    } catch (error) {
      console.error(`USDT check error (${this.network}):`, error.message);

      // التعامل مع أخطاء API المحددة
      const msg = error.message || '';
      const status = error.response?.status;
      const apiMsg = error.response?.data?.message || error.response?.data?.result || '';

      // Rate limit
      if (status === 429 || msg.includes('rate limit') || apiMsg.includes('rate limit')) {
        return { confirmed: false, error: 'rate_limit', message: 'يرجى المحاولة بعد قليل (حد الطلبات)', messageEn: 'Please try again in a moment (rate limit)' };
      }
      // مفتاح API غير صالح
      if (apiMsg.includes('Invalid API Key') || apiMsg.includes('invalid api key') || apiMsg.includes('NOTOK')) {
        return { confirmed: false, error: 'invalid_api_key', message: 'خطأ في إعدادات بوابة الدفع. تواصل مع الدعم', messageEn: 'Payment gateway configuration error. Contact support' };
      }
      // عنوان محفظة غير صالح
      if (msg.includes('Invalid address') || apiMsg.includes('Error') || status === 400) {
        return { confirmed: false, error: 'invalid_address', message: 'خطأ في إعدادات بوابة الدفع. تواصل مع الدعم', messageEn: 'Payment gateway configuration error. Contact support' };
      }

      return { confirmed: false, error: 'check_failed', message: 'فشل في التحقق. حاول مرة أخرى', messageEn: 'Verification failed. Try again' };
    }
  }

  // ─── TRC20 - Tron Network ───
  async _checkTRC20(expectedAmount, sinceTimestamp) {
    const contractAddr = USDT_CONTRACTS.TRC20;
    const url = `https://api.trongrid.io/v1/accounts/${this.walletAddress}/transactions/trc20`;

    const headers = {};
    if (this.apiKey) headers['TRON-PRO-API-KEY'] = this.apiKey;

    const { data } = await axios.get(url, {
      params: {
        only_confirmed: true,
        limit: 50,
        contract_address: contractAddr,
        min_timestamp: sinceTimestamp || (Date.now() - 1800000), // آخر 30 دقيقة
      },
      headers,
    });

    if (!data.data || data.data.length === 0) {
      return { confirmed: false, transactions: [] };
    }

    // البحث عن تحويل بالمبلغ المطلوب (USDT = 6 decimals على TRC20)
    const targetAmount = parseFloat(expectedAmount);
    const matching = data.data.filter(tx => {
      const txAmount = parseFloat(tx.value) / 1e6;
      const toAddr = tx.to === this.walletAddress;
      return toAddr && Math.abs(txAmount - targetAmount) < 0.01;
    });

    if (matching.length > 0) {
      const tx = matching[0];
      return {
        confirmed: true,
        transactionId: tx.transaction_id,
        amount: parseFloat(tx.value) / 1e6,
        from: tx.from,
        timestamp: tx.block_timestamp,
      };
    }

    return { confirmed: false, transactions: data.data.length };
  }

  // ─── ERC20 - Ethereum Network ───
  async _checkERC20(expectedAmount, sinceTimestamp) {
    const contractAddr = USDT_CONTRACTS.ERC20;
    const url = 'https://api.etherscan.io/api';

    const params = {
      module: 'account',
      action: 'tokentx',
      contractaddress: contractAddr,
      address: this.walletAddress,
      sort: 'desc',
      page: 1,
      offset: 50,
    };
    if (this.apiKey) params.apikey = this.apiKey;

    const { data } = await axios.get(url, { params });

    if (data.status !== '1' || !data.result) {
      return { confirmed: false, transactions: [] };
    }

    const targetAmount = parseFloat(expectedAmount);
    const minTimestamp = sinceTimestamp ? Math.floor(sinceTimestamp / 1000) : Math.floor((Date.now() - 1800000) / 1000);

    const matching = data.result.filter(tx => {
      const txAmount = parseFloat(tx.value) / 1e6; // USDT = 6 decimals
      const toAddr = tx.to.toLowerCase() === this.walletAddress.toLowerCase();
      const afterTime = parseInt(tx.timeStamp) >= minTimestamp;
      return toAddr && afterTime && Math.abs(txAmount - targetAmount) < 0.01;
    });

    if (matching.length > 0) {
      const tx = matching[0];
      return {
        confirmed: true,
        transactionId: tx.hash,
        amount: parseFloat(tx.value) / 1e6,
        from: tx.from,
        timestamp: parseInt(tx.timeStamp) * 1000,
      };
    }

    return { confirmed: false, transactions: data.result.length };
  }

  // ─── BEP20 - BSC Network ───
  async _checkBEP20(expectedAmount, sinceTimestamp) {
    const contractAddr = USDT_CONTRACTS.BEP20;
    const url = 'https://api.bscscan.com/api';

    const params = {
      module: 'account',
      action: 'tokentx',
      contractaddress: contractAddr,
      address: this.walletAddress,
      sort: 'desc',
      page: 1,
      offset: 50,
    };
    if (this.apiKey) params.apikey = this.apiKey;

    const { data } = await axios.get(url, { params });

    if (data.status !== '1' || !data.result) {
      return { confirmed: false, transactions: [] };
    }

    const targetAmount = parseFloat(expectedAmount);
    const minTimestamp = sinceTimestamp ? Math.floor(sinceTimestamp / 1000) : Math.floor((Date.now() - 1800000) / 1000);

    const matching = data.result.filter(tx => {
      const txAmount = parseFloat(tx.value) / 1e18; // BSC USDT = 18 decimals
      const toAddr = tx.to.toLowerCase() === this.walletAddress.toLowerCase();
      const afterTime = parseInt(tx.timeStamp) >= minTimestamp;
      return toAddr && afterTime && Math.abs(txAmount - targetAmount) < 0.01;
    });

    if (matching.length > 0) {
      const tx = matching[0];
      return {
        confirmed: true,
        transactionId: tx.hash,
        amount: parseFloat(tx.value) / 1e18,
        from: tx.from,
        timestamp: parseInt(tx.timeStamp) * 1000,
      };
    }

    return { confirmed: false, transactions: data.result.length };
  }

  // ─── تعليمات الدفع حسب الشبكة ───
  _getInstructions() {
    const networkNames = {
      TRC20: 'Tron (TRC20)',
      ERC20: 'Ethereum (ERC20)',
      BEP20: 'BSC (BEP20)',
    };
    return {
      ar: `أرسل المبلغ المطلوب من USDT إلى العنوان أعلاه عبر شبكة ${networkNames[this.network]}. تأكد من اختيار الشبكة الصحيحة لتجنب فقدان الأموال.`,
      en: `Send the required USDT amount to the address above via ${networkNames[this.network]} network. Make sure to select the correct network to avoid losing funds.`,
    };
  }
}

module.exports = USDTProcessor;
