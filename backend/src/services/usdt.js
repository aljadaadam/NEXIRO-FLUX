/**
 * ─── USDT Crypto Payment Processor ───
 * يدعم: TRC20 (Tron), ERC20 (Ethereum), BEP20 (BSC)
 * 
 * Flow:
 * 1. createPayment() → يرجع عنوان المحفظة + المبلغ المطلوب
 * 2. العميل يرسل USDT للعنوان
 * 3. checkPayment() → يتحقق من البلوكتشين (بهاش المعاملة أو تلقائياً)
 * 
 * APIs المستخدمة:
 * - TRC20: TronGrid API (مجاني، كشف تلقائي)
 * - ERC20: ETH RPC + eth_getTransactionReceipt (مجاني، بهاش المعاملة)
 * - BEP20: BSC RPC + eth_getTransactionReceipt (مجاني، بهاش المعاملة)
 */
const axios = require('axios');

// عقود USDT على كل شبكة
const USDT_CONTRACTS = {
  TRC20: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  ERC20: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  BEP20: '0x55d398326f99059fF775485246999027B3197955',
};

// USDT decimals per network
const USDT_DECIMALS = {
  TRC20: 6,
  ERC20: 6,
  BEP20: 18,
};

// Public RPC endpoints (no API key needed)
const RPC_ENDPOINTS = {
  ERC20: 'https://eth.llamarpc.com',
  BEP20: 'https://bsc-dataseed1.binance.org/',
};

// ERC20 Transfer event topic hash
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

class USDTProcessor {
  constructor(config) {
    this.walletAddress = config.wallet_address;
    this.network = config.network || 'TRC20'; // TRC20, ERC20, BEP20
    this.apiKey = config.api_key || ''; // مفتاح API لـ TronGrid (اختياري)
  }

  // ─── توليد مبلغ فريد (إضافة سنتات عشوائية) ───
  // هذا يساعد في تمييز كل عملية دفع عن الأخرى على البلوكتشين
  _generateUniqueAmount(amount) {
    const base = parseFloat(amount);
    // إضافة مبلغ عشوائي بين 0.001 و 0.099 (أقل من 10 سنتات)
    const randomMils = (Math.floor(Math.random() * 99) + 1) / 1000;
    const uniqueAmount = base + randomMils;
    return uniqueAmount.toFixed(3);
  }

  // ─── إنشاء طلب دفع ───
  // TRC20: مبلغ فريد (للكشف التلقائي)
  // BEP20/ERC20: المبلغ الأصلي (التحقق عبر TX Hash)
  createPayment({ amount, referenceId }) {
    const needsUniqueAmount = this.network === 'TRC20';
    const finalAmount = needsUniqueAmount
      ? this._generateUniqueAmount(amount)
      : parseFloat(amount).toFixed(2);
    return {
      walletAddress: this.walletAddress,
      network: this.network,
      originalAmount: parseFloat(amount).toFixed(2),
      amount: finalAmount,
      currency: 'USDT',
      referenceId,
      contractAddress: USDT_CONTRACTS[this.network],
      instructions: this._getInstructions(),
      status: 'AWAITING_PAYMENT',
    };
  }

  // ─── التحقق من وصول الدفع ───
  async checkPayment({ amount, sinceTimestamp, txHash }) {
    try {
      switch (this.network) {
        case 'TRC20':
          // TRC20: كشف تلقائي عبر TronGrid (أو بالهاش إذا متوفر)
          if (txHash) return await this._verifyTRC20ByHash(txHash, amount);
          return await this._checkTRC20(amount, sinceTimestamp);
        case 'ERC20':
          // ERC20: التحقق بهاش المعاملة عبر ETH RPC
          if (!txHash) {
            return { confirmed: false, error: 'tx_hash_required', message: 'يرجى إدخال هاش المعاملة (Transaction Hash) للتحقق', messageEn: 'Please enter the Transaction Hash to verify payment' };
          }
          return await this._verifyEvmByHash(txHash, amount, 'ERC20');
        case 'BEP20':
          // BEP20: التحقق بهاش المعاملة عبر BSC RPC
          if (!txHash) {
            return { confirmed: false, error: 'tx_hash_required', message: 'يرجى إدخال هاش المعاملة (Transaction Hash) للتحقق', messageEn: 'Please enter the Transaction Hash to verify payment' };
          }
          return await this._verifyEvmByHash(txHash, amount, 'BEP20');
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
      return toAddr && Math.abs(txAmount - targetAmount) < 0.001;
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

  // ─── EVM (ETH/BSC) - التحقق بهاش المعاملة عبر RPC ───
  async _verifyEvmByHash(txHash, expectedAmount, network) {
    const rpcUrl = RPC_ENDPOINTS[network];
    const contractAddr = USDT_CONTRACTS[network].toLowerCase();
    const decimals = USDT_DECIMALS[network];
    const divisor = Math.pow(10, decimals);

    // Validate tx hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return { confirmed: false, error: 'invalid_tx_hash', message: 'هاش المعاملة غير صالح', messageEn: 'Invalid transaction hash format' };
    }

    console.log(`[USDT/${network}] Verifying tx: ${txHash} via RPC: ${rpcUrl}`);

    // Call eth_getTransactionReceipt
    const { data: receiptResp } = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [txHash],
      id: 1,
    }, { timeout: 15000 });

    if (receiptResp.error) {
      console.log(`[USDT/${network}] RPC error:`, receiptResp.error);
      return { confirmed: false, error: 'rpc_error', message: 'خطأ في الاتصال بالشبكة', messageEn: 'Network connection error' };
    }

    const receipt = receiptResp.result;
    if (!receipt) {
      return { confirmed: false, error: 'tx_not_found', message: 'المعاملة غير موجودة أو لم تُؤكد بعد. انتظر دقيقة وحاول مجدداً', messageEn: 'Transaction not found or not confirmed yet. Wait a minute and try again' };
    }

    // Check transaction status (0x1 = success)
    if (receipt.status !== '0x1') {
      return { confirmed: false, error: 'tx_failed', message: 'المعاملة فشلت على البلوكتشين', messageEn: 'Transaction failed on blockchain' };
    }

    // Parse logs to find USDT Transfer event to our wallet
    const walletPadded = '0x' + this.walletAddress.slice(2).toLowerCase().padStart(64, '0');
    const targetAmount = parseFloat(expectedAmount);

    for (const log of receipt.logs) {
      // Check: is this a Transfer event on the USDT contract to our wallet?
      if (
        log.address.toLowerCase() === contractAddr &&
        log.topics[0] === TRANSFER_TOPIC &&
        log.topics.length >= 3 &&
        log.topics[2].toLowerCase() === walletPadded
      ) {
        const amountWei = BigInt(log.data);
        const txAmount = Number(amountWei) / divisor;
        const fromAddr = '0x' + log.topics[1].slice(26);

        console.log(`[USDT/${network}] Found transfer: ${txAmount} USDT from ${fromAddr}`);

        // Verify amount matches (tolerance 0.001)
        if (Math.abs(txAmount - targetAmount) < 0.001) {
          return {
            confirmed: true,
            transactionId: txHash,
            amount: txAmount,
            from: fromAddr,
            timestamp: Date.now(),
          };
        } else {
          return {
            confirmed: false,
            error: 'amount_mismatch',
            message: `المبلغ المرسل (${txAmount.toFixed(3)}) لا يتطابق مع المبلغ المطلوب (${targetAmount.toFixed(3)})`,
            messageEn: `Amount sent (${txAmount.toFixed(3)}) does not match required amount (${targetAmount.toFixed(3)})`,
          };
        }
      }
    }

    // No matching Transfer event found
    return {
      confirmed: false,
      error: 'no_matching_transfer',
      message: 'لم يُعثر على تحويل USDT مطابق في هذه المعاملة. تأكد من الهاش الصحيح',
      messageEn: 'No matching USDT transfer found in this transaction. Please check the correct hash',
    };
  }

  // ─── TRC20 - التحقق بهاش المعاملة عبر TronGrid ───
  async _verifyTRC20ByHash(txHash, expectedAmount) {
    const url = `https://api.trongrid.io/v1/transactions/${txHash}/events`;
    const headers = {};
    if (this.apiKey) headers['TRON-PRO-API-KEY'] = this.apiKey;

    const { data } = await axios.get(url, { headers, timeout: 15000 });

    if (!data.data || data.data.length === 0) {
      return { confirmed: false, error: 'tx_not_found', message: 'المعاملة غير موجودة أو لم تُؤكد بعد', messageEn: 'Transaction not found or not confirmed yet' };
    }

    const targetAmount = parseFloat(expectedAmount);
    const contractAddr = USDT_CONTRACTS.TRC20;

    for (const event of data.data) {
      if (
        event.event_name === 'Transfer' &&
        event.contract_address === contractAddr &&
        event.result
      ) {
        const toAddr = event.result.to || event.result._to;
        const value = event.result.value || event.result._value;
        if (toAddr === this.walletAddress) {
          const txAmount = parseFloat(value) / 1e6;
          if (Math.abs(txAmount - targetAmount) < 0.001) {
            return {
              confirmed: true,
              transactionId: txHash,
              amount: txAmount,
              from: event.result.from || event.result._from,
              timestamp: event.block_timestamp,
            };
          }
        }
      }
    }

    return { confirmed: false, error: 'no_matching_transfer', message: 'لم يُعثر على تحويل USDT مطابق', messageEn: 'No matching USDT transfer found' };
  }

  // ─── تعليمات الدفع حسب الشبكة ───
  _getInstructions() {
    const networkNames = {
      TRC20: 'Tron (TRC20)',
      ERC20: 'Ethereum (ERC20)',
      BEP20: 'BSC (BEP20)',
    };
    const isTRC20 = this.network === 'TRC20';
    return {
      ar: isTRC20
        ? `⚠️ مهم جداً: أرسل المبلغ المحدد بالضبط (بما في ذلك السنتات) إلى العنوان أعلاه عبر شبكة ${networkNames[this.network]}. المبلغ فريد لعمليتك ويُستخدم للتحقق التلقائي. تأكد من اختيار الشبكة الصحيحة لتجنب فقدان الأموال.`
        : `⚠️ مهم: أرسل المبلغ إلى العنوان أعلاه عبر شبكة ${networkNames[this.network]}. بعد الإرسال، انسخ هاش المعاملة (Transaction Hash) من محفظتك والصقه في خانة التحقق. تأكد من اختيار الشبكة الصحيحة لتجنب فقدان الأموال.`,
      en: isTRC20
        ? `⚠️ Important: Send the EXACT amount shown (including cents) to the address above via ${networkNames[this.network]} network. The amount is unique to your transaction and used for automatic verification. Make sure to select the correct network to avoid losing funds.`
        : `⚠️ Important: Send the amount to the address above via ${networkNames[this.network]} network. After sending, copy the Transaction Hash from your wallet and paste it in the verification field. Make sure to select the correct network to avoid losing funds.`,
    };
  }
}

module.exports = USDTProcessor;