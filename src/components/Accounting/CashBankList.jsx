import React, { useState, useEffect } from 'react';
import { Landmark, ArrowLeftRight, CheckCircle2, IndianRupee, Plus, X, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

const defaultBankAccounts = [
  { id: 'BNK-001', name: 'Operating Checking Account', accountNumber: '****-4921', type: 'Checking', balance: 50000.00 },
  { id: 'BNK-002', name: 'Corporate Reserve Savings', accountNumber: '****-8812', type: 'Savings', balance: 25000.00 },
  { id: 'BNK-003', name: 'Petty Cash Liquidity Vault', accountNumber: 'CASH-001', type: 'Cash Vault', balance: 5000.00 }
];

export default function CashBankList({ bankAccounts = [], onTransferFunds, onDepositFunds, onAddBankAccount }) {
  const activeBanks = (bankAccounts && bankAccounts.length > 0) ? bankAccounts : defaultBankAccounts;

  // Modal States
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);

  // Transfer State
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMemo, setTransferMemo] = useState('');
  const [transferError, setTransferError] = useState('');

  // Deposit State
  const [depositAccount, setDepositAccount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMemo, setDepositMemo] = useState('');
  const [depositError, setDepositError] = useState('');

  // New Bank Account State
  const [newBankName, setNewBankName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newBankType, setNewBankType] = useState('Checking');
  const [newInitialBalance, setNewInitialBalance] = useState('');
  const [addBankError, setAddBankError] = useState('');

  const [transferLogs, setTransferLogs] = useState([]);

  // Sync Transfer Modal State
  useEffect(() => {
    if (isTransferOpen) {
      const first = activeBanks[0]?.name || '';
      const second = activeBanks[1]?.name || activeBanks[0]?.name || '';
      setFromAccount(first);
      setToAccount(second);
      setTransferAmount('');
      setTransferMemo('');
      setTransferError('');
    }
  }, [isTransferOpen, bankAccounts]);

  // Sync Deposit Modal State
  useEffect(() => {
    if (isDepositOpen) {
      setDepositAccount(activeBanks[0]?.name || '');
      setDepositAmount('');
      setDepositMemo('');
      setDepositError('');
    }
  }, [isDepositOpen, bankAccounts]);

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    setTransferError('');

    if (!fromAccount || !toAccount) {
      setTransferError('Please select source and destination bank accounts.');
      return;
    }

    if (fromAccount === toAccount) {
      setTransferError('Source account and Destination account cannot be the same.');
      return;
    }

    const transferAmt = parseFloat(transferAmount);
    if (isNaN(transferAmt) || transferAmt <= 0) {
      setTransferError('Please enter a valid transfer amount greater than 0.');
      return;
    }

    const sourceAcc = activeBanks.find(a => a.name === fromAccount);
    if (sourceAcc && sourceAcc.balance < transferAmt) {
      setTransferError(`Insufficient balance in ${fromAccount}. Available balance: ₹${sourceAcc.balance.toLocaleString()}`);
      return;
    }

    onTransferFunds(fromAccount, toAccount, transferAmt);

    const newLog = {
      id: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      from: fromAccount,
      to: toAccount,
      amount: transferAmt,
      date: new Date().toISOString().split('T')[0],
      memo: transferMemo || 'Inter-account liquidity transfer'
    };

    setTransferLogs(prev => [newLog, ...prev]);
    setIsTransferOpen(false);
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    setDepositError('');

    if (!depositAccount) {
      setDepositError('Please select a Bank Account for funds deposit.');
      return;
    }

    const depAmt = parseFloat(depositAmount);
    if (isNaN(depAmt) || depAmt <= 0) {
      setDepositError('Please enter a valid deposit amount greater than 0.');
      return;
    }

    if (onDepositFunds) {
      onDepositFunds(depositAccount, depAmt, depositMemo);
    }

    const newLog = {
      id: `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
      from: 'External Capital Deposit',
      to: depositAccount,
      amount: depAmt,
      date: new Date().toISOString().split('T')[0],
      memo: depositMemo || 'Direct Bank Capital Deposit'
    };

    setTransferLogs(prev => [newLog, ...prev]);
    setIsDepositOpen(false);
  };

  const handleAddBankSubmit = (e) => {
    e.preventDefault();
    setAddBankError('');

    if (!newBankName.trim()) {
      setAddBankError('Please enter a Bank / Cash Account Name.');
      return;
    }

    const initialBal = parseFloat(newInitialBalance || '0');
    const newAcc = {
      id: `BNK-${Math.floor(100 + Math.random() * 900)}`,
      name: newBankName.trim(),
      accountNumber: newAccNumber.trim() || `****-${Math.floor(1000 + Math.random() * 9000)}`,
      type: newBankType,
      balance: isNaN(initialBal) ? 0 : initialBal
    };

    if (onAddBankAccount) {
      onAddBankAccount(newAcc);
    }

    setIsAddBankOpen(false);
    setNewBankName('');
    setNewAccNumber('');
    setNewInitialBalance('');
  };

  const totalLiquidity = activeBanks.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="card-title-group">
            <h2 className="card-title">Cash & Bank Liquidity Accounts</h2>
            <span className="card-subtitle">Total Liquid Reserve: {formatCurrency(totalLiquidity)}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => setIsAddBankOpen(true)}>
              <Plus size={16} />
              Add Bank Account
            </button>
            <button className="btn-secondary" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }} onClick={() => setIsDepositOpen(true)}>
              <ArrowDownRight size={16} />
              Add Money / Deposit
            </button>
            <button className="btn-primary" onClick={() => setIsTransferOpen(true)}>
              <ArrowLeftRight size={16} />
              Transfer Funds
            </button>
          </div>
        </div>

        {/* Bank Account Cards Grid */}
        <div className="kpi-grid">
          {activeBanks.map(acc => (
            <div key={acc.id || acc.name} className="card" style={{ padding: '20px', background: 'var(--bg-input)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {acc.type}
                </span>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
                  <Landmark size={20} />
                </div>
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {acc.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Account #: {acc.accountNumber}
              </div>

              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>
                {formatCurrency(acc.balance || 0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer History Log Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Inter-Account & Liquidity Transaction Log</h2>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Transaction Ref</th>
                <th>From Source Account</th>
                <th>To Destination Account</th>
                <th>Posting Date</th>
                <th>Memo / Reference</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transferLogs.length > 0 ? (
                transferLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{log.id}</td>
                    <td style={{ color: log.from.includes('Deposit') ? '#3b82f6' : '#ef4444', fontWeight: '600' }}>{log.from}</td>
                    <td style={{ color: '#10b981', fontWeight: '600' }}>{log.to}</td>
                    <td>{formatDate(log.date)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.memo}</td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: '#10b981' }}>
                      {formatCurrency(log.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No liquidity transfer or deposit transactions recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Funds Modal */}
      {isTransferOpen && (
        <div className="modal-overlay" onClick={() => setIsTransferOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeftRight size={20} color="#3b82f6" />
                <h2 className="modal-title">Transfer Funds Between Accounts</h2>
              </div>
              <button className="modal-close" onClick={() => setIsTransferOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit}>
              <div className="modal-body">
                {transferError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', fontWeight: '600' }}>
                    ⚠️ {transferError}
                  </div>
                )}

                <div className="grid-2">
                  <div className="form-group">
                    <label>From Source Account *</label>
                    <select 
                      className="form-control"
                      value={fromAccount}
                      onChange={(e) => setFromAccount(e.target.value)}
                    >
                      {activeBanks.map(a => (
                        <option key={a.id || a.name} value={a.name}>{a.name} (₹{(a.balance || 0).toLocaleString()})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>To Destination Account *</label>
                    <select 
                      className="form-control"
                      value={toAccount}
                      onChange={(e) => setToAccount(e.target.value)}
                    >
                      {activeBanks.map(a => (
                        <option key={a.id || a.name} value={a.name}>{a.name} (₹{(a.balance || 0).toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Transfer Amount (₹ INR) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    placeholder="5000.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Transfer Memo / Reference</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Operating liquidity replenishment"
                    value={transferMemo}
                    onChange={(e) => setTransferMemo(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsTransferOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <CheckCircle2 size={16} />
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit / Add Money Modal */}
      {isDepositOpen && (
        <div className="modal-overlay" onClick={() => setIsDepositOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowDownRight size={20} color="#10b981" />
                <h2 className="modal-title">Add Money / Deposit into Bank Account</h2>
              </div>
              <button className="modal-close" onClick={() => setIsDepositOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit}>
              <div className="modal-body">
                {depositError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', fontWeight: '600' }}>
                    ⚠️ {depositError}
                  </div>
                )}

                <div className="form-group">
                  <label>Select Target Bank Account *</label>
                  <select 
                    className="form-control"
                    value={depositAccount}
                    onChange={(e) => setDepositAccount(e.target.value)}
                    required
                  >
                    {activeBanks.map(a => (
                      <option key={a.id || a.name} value={a.name}>{a.name} (Current: ₹{(a.balance || 0).toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Deposit Amount (₹ INR) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    placeholder="10000.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Deposit Source / Memo</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Owner Capital Injection / Direct Cash Deposit"
                    value={depositMemo}
                    onChange={(e) => setDepositMemo(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDepositOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#10b981' }}>
                  <CheckCircle2 size={16} />
                  Deposit Funds Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Bank Account Modal */}
      {isAddBankOpen && (
        <div className="modal-overlay" onClick={() => setIsAddBankOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Landmark size={20} color="#3b82f6" />
                <h2 className="modal-title">Create / Add New Bank Account</h2>
              </div>
              <button className="modal-close" onClick={() => setIsAddBankOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBankSubmit}>
              <div className="modal-body">
                {addBankError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', fontWeight: '600' }}>
                    ⚠️ {addBankError}
                  </div>
                )}

                <div className="form-group">
                  <label>Bank or Cash Account Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. HDFC Current Business Account"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Account Number / Ref</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. 50100239482"
                      value={newAccNumber}
                      onChange={(e) => setNewAccNumber(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Account Type *</label>
                    <select 
                      className="form-control"
                      value={newBankType}
                      onChange={(e) => setNewBankType(e.target.value)}
                    >
                      <option value="Checking">Checking Account</option>
                      <option value="Savings">Savings Account</option>
                      <option value="Cash Vault">Cash / Petty Vault</option>
                      <option value="Credit Card">Business Credit Card</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Initial Opening Balance (₹ INR)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    placeholder="0.00"
                    value={newInitialBalance}
                    onChange={(e) => setNewInitialBalance(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddBankOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  Add Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
