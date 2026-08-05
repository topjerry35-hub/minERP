import React, { useState } from 'react';
import { Landmark, ArrowLeftRight, CheckCircle2, IndianRupee, Plus, X } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function CashBankList({ bankAccounts, onTransferFunds }) {
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [fromAccount, setFromAccount] = useState(bankAccounts[0]?.name || '');
  const [toAccount, setToAccount] = useState(bankAccounts[1]?.name || '');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const [transferLogs, setTransferLogs] = useState([
    { id: 'TRF-9821', from: 'Operating Checking Account', to: 'Corporate Reserve Savings', amount: 10000.00, date: '2026-07-20', memo: 'Quarterly reserve transfer' }
  ]);

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || fromAccount === toAccount) return;

    const transferAmt = parseFloat(amount);
    onTransferFunds(fromAccount, toAccount, transferAmt);

    const newLog = {
      id: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      from: fromAccount,
      to: toAccount,
      amount: transferAmt,
      date: new Date().toISOString().split('T')[0],
      memo: memo || 'Inter-account liquidity rebalance'
    };

    setTransferLogs(prev => [newLog, ...prev]);
    setIsTransferOpen(false);
    setAmount('');
    setMemo('');
  };

  const totalLiquidity = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">Cash & Bank Liquidity Accounts</h2>
            <span className="card-subtitle">Total Liquid Reserve: {formatCurrency(totalLiquidity)}</span>
          </div>

          <button className="btn-primary" onClick={() => setIsTransferOpen(true)}>
            <ArrowLeftRight size={16} />
            Transfer Funds
          </button>
        </div>

        {/* Bank Account Cards Grid */}
        <div className="kpi-grid">
          {bankAccounts.map(acc => (
            <div key={acc.id} className="card" style={{ padding: '20px', background: 'var(--bg-input)' }}>
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
                {formatCurrency(acc.balance)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer History Log Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Inter-Account Transfer History Log</h2>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Transfer Ref</th>
                <th>From Source Account</th>
                <th>To Destination Account</th>
                <th>Transfer Date</th>
                <th>Memo / Description</th>
                <th style={{ textAlign: 'right' }}>Amount Transferred</th>
              </tr>
            </thead>
            <tbody>
              {transferLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{log.id}</td>
                  <td style={{ color: '#ef4444', fontWeight: '600' }}>{log.from}</td>
                  <td style={{ color: '#10b981', fontWeight: '600' }}>{log.to}</td>
                  <td>{formatDate(log.date)}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.memo}</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#3b82f6' }}>
                    {formatCurrency(log.amount)}
                  </td>
                </tr>
              ))}
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
                <div className="grid-2">
                  <div className="form-group">
                    <label>From Source Account *</label>
                    <select 
                      className="form-control"
                      value={fromAccount}
                      onChange={(e) => setFromAccount(e.target.value)}
                    >
                      {bankAccounts.map(a => (
                        <option key={a.id} value={a.name}>{a.name} (₹{a.balance.toLocaleString()})</option>
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
                      {bankAccounts.map(a => (
                        <option key={a.id} value={a.name}>{a.name} (₹{a.balance.toLocaleString()})</option>
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Transfer Memo / Reference</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Operating liquidity replenishment"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
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
    </div>
  );
}
