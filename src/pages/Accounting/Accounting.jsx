import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  IndianRupee, 
  Landmark, 
  Truck, 
  Clock, 
  X, 
  PieChart 
} from 'lucide-react';

import CashBankList from '../../components/Accounting/CashBankList';
import ArAgingTable from '../../components/Accounting/ArAgingTable';
import ApBillsTable from '../../components/Accounting/ApBillsTable';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { 
  fetchBankAccounts, 
  updateBankAccountBalance, 
  createBankAccount,
  fetchArInvoices, 
  fetchApBills, 
  updateApBill,
  createSupplierPayment,
  fetchAccounts, 
  fetchJournalEntries, 
  createJournalEntry 
} from '../../services/api';

const defaultGLAccounts = [
  { code: '1010', name: 'Cash & Cash Equivalents', type: 'Asset', category: 'Current Assets', balance: 0.00 },
  { code: '1020', name: 'Accounts Receivable (AR)', type: 'Asset', category: 'Current Assets', balance: 0.00 },
  { code: '1030', name: 'Merchandise Inventory Asset', type: 'Asset', category: 'Current Assets', balance: 0.00 },
  { code: '2010', name: 'Accounts Payable (AP)', type: 'Liability', category: 'Current Liabilities', balance: 0.00 },
  { code: '2020', name: 'GST / VAT Tax Payable', type: 'Liability', category: 'Current Liabilities', balance: 0.00 },
  { code: '3010', name: 'Owners Equity & Retained Earnings', type: 'Equity', category: 'Equity', balance: 0.00 },
  { code: '4010', name: 'Sales Revenue', type: 'Revenue', category: 'Operating Income', balance: 0.00 },
  { code: '4020', name: 'Services & Consulting Revenue', type: 'Revenue', category: 'Operating Income', balance: 0.00 },
  { code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'Expense', category: 'Cost of Sales', balance: 0.00 },
  { code: '5020', name: 'Salaries & Payroll Expenses', type: 'Expense', category: 'Operating Expenses', balance: 0.00 },
  { code: '5030', name: 'Office Rent & Utility Expenses', type: 'Expense', category: 'Operating Expenses', balance: 0.00 }
];

export default function Accounting({ searchQuery, setSearchQuery }) {
  const [activeSubTab, setActiveSubTab] = useState('pnl');
  const [isAddJournalOpen, setIsAddJournalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Journal Entry Form State
  const [jeDescription, setJeDescription] = useState('');
  const [jeDebitAccount, setJeDebitAccount] = useState('1010 - Cash & Cash Equivalents');
  const [jeCreditAccount, setJeCreditAccount] = useState('4010 - Sales Revenue');
  const [jeAmount, setJeAmount] = useState('');

  // Database Datasets
  const [bankAccounts, setBankAccounts] = useState([]);
  const [arInvoices, setArInvoices] = useState([]);
  const [apBills, setApBills] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);

  const activeAccountList = (accounts && accounts.length > 0) ? accounts : defaultGLAccounts;

  useEffect(() => {
    async function loadDbData() {
      const banks = await fetchBankAccounts();
      if (banks) setBankAccounts(banks);

      const ars = await fetchArInvoices();
      if (ars) setArInvoices(ars);

      const aps = await fetchApBills();
      if (aps) setApBills(aps);

      const accs = await fetchAccounts();
      if (accs && accs.length > 0) {
        setAccounts(accs);
      } else {
        setAccounts(defaultGLAccounts);
      }

      const jrn = await fetchJournalEntries();
      if (jrn) setJournalEntries(jrn);
    }
    loadDbData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTransferFunds = async (fromName, toName, amount) => {
    setBankAccounts(prev => prev.map(acc => {
      if (acc.name === fromName) {
        const newBal = acc.balance - amount;
        updateBankAccountBalance(acc.id, newBal);
        return { ...acc, balance: newBal };
      }
      if (acc.name === toName) {
        const newBal = acc.balance + amount;
        updateBankAccountBalance(acc.id, newBal);
        return { ...acc, balance: newBal };
      }
      return acc;
    }));
    showToast(`Transferred ₹${amount.toFixed(2)} from ${fromName} to ${toName}`);
  };

  const handleDepositFunds = async (accountName, amount) => {
    setBankAccounts(prev => prev.map(acc => {
      if (acc.name === accountName || acc.id === accountName) {
        const newBal = acc.balance + amount;
        updateBankAccountBalance(acc.id, newBal);
        return { ...acc, balance: newBal };
      }
      return acc;
    }));
    showToast(`Successfully deposited ₹${amount.toFixed(2)} into ${accountName}!`);
  };

  const handleAddBankAccount = async (accountData) => {
    const created = await createBankAccount(accountData);
    if (created) {
      setBankAccounts(prev => [created, ...prev]);
      showToast(`Added new bank/cash account: ${created.name}`);
    }
  };

  const handleAddJournalEntry = async (e) => {
    e.preventDefault();
    if (!jeDescription || !jeAmount) return;

    const amt = parseFloat(jeAmount);
    const newEntryData = {
      date: new Date().toISOString().split('T')[0],
      description: jeDescription,
      debitAccount: jeDebitAccount,
      creditAccount: jeCreditAccount,
      amount: amt,
      status: 'Posted'
    };

    const savedResult = await createJournalEntry(newEntryData);
    const savedEntry = savedResult.entry || savedResult;

    setJournalEntries(prev => [savedEntry, ...prev]);

    const debitCode = jeDebitAccount.split(' - ')[0];
    const creditCode = jeCreditAccount.split(' - ')[0];

    setAccounts(prev => prev.map(acc => {
      if (acc.code === debitCode) return { ...acc, balance: acc.balance + amt };
      if (acc.code === creditCode) return { ...acc, balance: acc.balance + amt };
      return acc;
    }));

    setIsAddJournalOpen(false);
    setJeDescription('');
    setJeAmount('');
    showToast(`Journal Entry ${savedEntry.id} posted successfully to General Ledger!`);
  };

  const handlePayApBill = async (bill) => {
    if (!bill || bill.status === 'Paid') return;
    const billAmt = parseFloat(bill.amountDue !== undefined ? bill.amountDue : (bill.amount || 0));

    // 1. Update apBills state
    setApBills(prev => prev.map(b => b.id === bill.id ? { ...b, status: 'Paid', amountDue: 0 } : b));
    await updateApBill(bill.id, { status: 'Paid', amountDue: 0 });

    // 2. Record vendor payment in database
    await createSupplierPayment({
      supplier: bill.supplier,
      amount: billAmt,
      method: 'Bank Wire / ACH',
      referenceNumber: `AP-${bill.id}`,
      date: new Date().toISOString().split('T')[0]
    });

    // 3. Update Chart of Accounts (Accounts Payable liability reduced, Cash reduced)
    setAccounts(prev => prev.map(acc => {
      if (acc.code === '2010') return { ...acc, balance: Math.max(0, acc.balance - billAmt) };
      if (acc.code === '1010') return { ...acc, balance: Math.max(0, acc.balance - billAmt) };
      return acc;
    }));

    showToast(`Vendor Bill ${bill.id} (₹${billAmt.toFixed(2)}) paid to ${bill.supplier}! AP Ledger & Bank updated.`);
  };

  // P&L Calculations
  const totalRevenue = accounts.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = accounts.filter(a => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalRevenue - totalExpenses;

  const filteredAccounts = activeAccountList.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.code.includes(searchQuery) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-body">
      {toastMessage && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle2 size={20} />
          {toastMessage}
        </div>
      )}

      {/* Header title */}
      <div className="dashboard-header-title">
        <div>
          <h1>Finance & Accounting Hub</h1>
          <p>Comprehensive overview of Income & Expenses, Accounts Receivable (AR), Accounts Payable (AP), Cash & Bank accounts, and P&L Statements</p>
        </div>

        <button className="btn-primary" onClick={() => setIsAddJournalOpen(true)}>
          <Plus size={16} />
          Post Journal Entry
        </button>
      </div>

      {/* Sub-tabs navigation */}
      <div className="inventory-nav-tabs">
        {[
          { id: 'pnl', label: 'Profit & Loss (P&L)', icon: TrendingUp },
          { id: 'cash_bank', label: 'Cash & Bank Accounts', icon: Landmark },
          { id: 'ar', label: 'Accounts Receivable (AR)', icon: Clock },
          { id: 'ap', label: 'Accounts Payable (AP)', icon: Truck },
          { id: 'chart_of_accounts', label: 'Chart of Accounts & Ledger', icon: BookOpen },
        ].map(tab => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              className={`inventory-tab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              <IconComp size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* View 1: P&L Statement */}
      {activeSubTab === 'pnl' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Gross Operating Income</span>
                <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <IndianRupee size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#3b82f6' }}>
                ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Total Operating Expenses</span>
                <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                  <IndianRupee size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#ef4444' }}>
                ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Net Operating Profit</span>
                <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#10b981' }}>
                ₹{netIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Income Statement (Profit & Loss Summary)</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: '8px', fontWeight: '700' }}>
                <span>Total Operating Revenue</span>
                <span style={{ color: '#3b82f6' }}>+₹{totalRevenue.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: '8px', color: '#94a3b8' }}>
                <span>Cost of Goods Sold (COGS)</span>
                <span>-₹{(activeAccountList.find(a => a.code === '5010')?.balance || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card-hover)', borderRadius: '8px', fontWeight: '800' }}>
                <span>Gross Profit Margin</span>
                <span>₹{(totalRevenue - (activeAccountList.find(a => a.code === '5010')?.balance || 0)).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: '8px', color: '#94a3b8' }}>
                <span>Salaries & Payroll Expense</span>
                <span>-₹{(activeAccountList.find(a => a.code === '5020' || a.code === '6010')?.balance || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: '8px', color: '#94a3b8' }}>
                <span>Office Utilities & Operations Expense</span>
                <span>-₹{(activeAccountList.find(a => a.code === '5030' || a.code === '6050')?.balance || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b98150', borderRadius: '10px', fontWeight: '800', fontSize: '1.2rem', color: '#10b981' }}>
                <span>NET INCOME (PROFIT)</span>
                <span>₹{netIncome.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Cash & Bank Accounts */}
      {activeSubTab === 'cash_bank' && (
        <CashBankList 
          bankAccounts={bankAccounts}
          onTransferFunds={handleTransferFunds}
          onDepositFunds={handleDepositFunds}
          onAddBankAccount={handleAddBankAccount}
        />
      )}

      {/* View 3: Accounts Receivable (AR) */}
      {activeSubTab === 'ar' && (
        <ArAgingTable 
          arInvoices={arInvoices}
          onSendReminder={(inv) => showToast(`Payment reminder dispatched to ${inv.customer} for Invoice ${inv.id}`)}
        />
      )}

      {/* View 4: Accounts Payable (AP) */}
      {activeSubTab === 'ap' && (
        <ApBillsTable 
          apBills={apBills}
          onPayBill={handlePayApBill}
        />
      )}

      {/* View 5: Chart of Accounts */}
      {activeSubTab === 'chart_of_accounts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">General Ledger Chart of Accounts</h2>
            </div>
            <div className="table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Account Code</th>
                    <th>Account Name</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Current Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map(acc => (
                    <tr key={acc.code}>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{acc.code}</td>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{acc.name}</td>
                      <td>
                        <span className={`status-badge ${acc.type === 'Asset' ? 'completed' : acc.type === 'Revenue' ? 'paid' : acc.type === 'Expense' ? 'unpaid' : 'info'}`}>
                          {acc.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{acc.category}</td>
                      <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--text-primary)' }}>
                        ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Journal Entries Ledger Log</h2>
            </div>
            <div className="table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Entry Ref</th>
                    <th>Posting Date</th>
                    <th>Description</th>
                    <th>Debit (+)</th>
                    <th>Credit (-)</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.map(je => (
                    <tr key={je.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{je.id}</td>
                      <td>{formatDate(je.date)}</td>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{je.description}</td>
                      <td style={{ color: '#10b981', fontSize: '0.82rem' }}>{je.debitAccount}</td>
                      <td style={{ color: '#ef4444', fontSize: '0.82rem' }}>{je.creditAccount}</td>
                      <td style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{formatCurrency(je.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Journal Entry Modal */}
      {isAddJournalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddJournalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Post Double-Entry Journal Transaction</h2>
              <button className="modal-close" onClick={() => setIsAddJournalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddJournalEntry}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Transaction Memo / Description *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Received Client Payment for Invoice #INV-2026-001"
                    value={jeDescription}
                    onChange={(e) => setJeDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Debit Account (+ Increase Asset/Expense) *</label>
                    <select 
                      className="form-control"
                      value={jeDebitAccount}
                      onChange={(e) => setJeDebitAccount(e.target.value)}
                    >
                      {activeAccountList.map(a => (
                        <option key={a.code} value={`${a.code} - ${a.name}`}>{a.code} - {a.name} ({a.type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Credit Account (- Increase Revenue/Liability) *</label>
                    <select 
                      className="form-control"
                      value={jeCreditAccount}
                      onChange={(e) => setJeCreditAccount(e.target.value)}
                    >
                      {activeAccountList.map(a => (
                        <option key={a.code} value={`${a.code} - ${a.name}`}>{a.code} - {a.name} ({a.type})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Transaction Amount (₹ INR) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    placeholder="1000.00"
                    value={jeAmount}
                    onChange={(e) => setJeAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddJournalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <CheckCircle2 size={16} />
                  Post Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
