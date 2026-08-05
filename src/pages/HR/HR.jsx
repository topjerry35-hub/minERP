import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  IndianRupee, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Check, 
  X 
} from 'lucide-react';

import EmployeeProfileModal from '../../components/HR/EmployeeProfileModal';
import RequestLeaveModal from '../../components/HR/RequestLeaveModal';
import MarkAttendanceModal from '../../components/HR/MarkAttendanceModal';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { 
  fetchEmployees, 
  createEmployee, 
  fetchAttendanceLogs, 
  createAttendanceLog, 
  fetchLeaveRequests, 
  createLeaveRequest, 
  fetchPayrollHistory 
} from '../../services/api';

import { 
  generateEmployees, 
  generateAttendanceLogs, 
  generateLeaveRequests, 
  generatePayrollHistory 
} from '../../utils/mockDataGenerator';

export default function HR({ searchQuery, setSearchQuery }) {
  const [activeSubTab, setActiveSubTab] = useState('employees');

  // Modal State
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isRunPayrollOpen, setIsRunPayrollOpen] = useState(false);
  const [isRequestLeaveOpen, setIsRequestLeaveOpen] = useState(false);
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  // New Employee Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [salary, setSalary] = useState('75000');

  // Database Datasets
  const [employees, setEmployees] = useState(() => generateEmployees(100));
  const [attendanceLogs, setAttendanceLogs] = useState(() => generateAttendanceLogs(100));
  const [leaveRequests, setLeaveRequests] = useState(() => generateLeaveRequests(100));
  const [payrollHistory, setPayrollHistory] = useState(() => generatePayrollHistory(100));

  useEffect(() => {
    async function loadDbData() {
      const emps = await fetchEmployees();
      if (emps && emps.length > 0) setEmployees(emps);

      const atts = await fetchAttendanceLogs();
      if (atts && atts.length > 0) setAttendanceLogs(atts);

      const lvs = await fetchLeaveRequests();
      if (lvs && lvs.length > 0) setLeaveRequests(lvs);

      const pay = await fetchPayrollHistory();
      if (pay && pay.length > 0) setPayrollHistory(pay);
    }
    loadDbData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!name || !role) return;

    const newEmp = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name,
      role,
      department,
      salary: parseFloat(salary) || 60000,
      status: 'Active',
      hireDate: new Date().toISOString().split('T')[0]
    };

    const saved = await createEmployee(newEmp);
    if (saved && saved.employee) {
      setEmployees(prev => [saved.employee, ...prev]);
      setIsAddEmployeeOpen(false);
      setName('');
      setRole('');
      showToast(`Registered new employee ${saved.employee.name} (${saved.employee.role})!`);
    } else {
      showToast(`Failed to register employee on database!`);
    }
  };

  const handleRequestLeave = async (newLeaveData) => {
    const savedLeave = await createLeaveRequest(newLeaveData);
    setLeaveRequests(prev => [savedLeave, ...prev]);
    showToast(`Leave application submitted for ${savedLeave.employee}!`);
  };

  const handleMarkAttendanceSubmit = async (newAttData) => {
    const savedAtt = await createAttendanceLog(newAttData);
    setAttendanceLogs(prev => [savedAtt, ...prev]);
    showToast(`Attendance marked for ${savedAtt.employee} (${savedAtt.status})!`);
  };

  const handleLeaveStatusChange = (leaveId, newStatus) => {
    setLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status: newStatus } : l));
    showToast(`Leave request ${leaveId} updated to ${newStatus}`);
  };

  const handleClockInOut = (employeeName) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendanceLogs(prev => {
      const existing = prev.find(a => a.employee === employeeName && a.date === new Date().toISOString().split('T')[0]);
      if (existing) {
        return prev.map(a => a.id === existing.id ? { ...a, clockOut: timeNow } : a);
      } else {
        const newAtt = {
          id: `ATT-${Math.floor(100 + Math.random() * 900)}`,
          employee: employeeName,
          date: new Date().toISOString().split('T')[0],
          clockIn: timeNow,
          clockOut: '--:--',
          status: 'Present',
          mode: 'On-Site'
        };
        return [newAtt, ...prev];
      }
    });
    showToast(`Attendance updated for ${employeeName} at ${timeNow}`);
  };

  const handleRunPayroll = () => {
    const grossSum = employees.reduce((sum, e) => sum + (e.salary / 12), 0);
    const taxSum = grossSum * 0.20;
    const netSum = grossSum - taxSum;

    const newRun = {
      period: 'July 2026',
      totalEmployees: employees.length,
      grossPay: grossSum,
      taxDeductions: taxSum,
      netPay: netSum,
      status: 'Completed'
    };

    setPayrollHistory(prev => [newRun, ...prev]);
    setIsRunPayrollOpen(false);
    showToast(`July 2026 Monthly Payroll executed successfully! Disbursed ${formatCurrency(netSum)}.`);
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.department.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1>Human Resources & Personnel Suite</h1>
          <p>Employee records, daily attendance tracking, leave applications, and monthly payroll</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => setIsMarkAttendanceOpen(true)}>
            <Clock size={16} color="#10b981" />
            + Mark Attendance
          </button>
          <button className="btn-secondary" onClick={() => setIsRequestLeaveOpen(true)}>
            <Calendar size={16} color="#3b82f6" />
            + Apply Leave
          </button>
          <button className="btn-secondary" onClick={() => setIsRunPayrollOpen(true)}>
            <IndianRupee size={16} color="#10b981" />
            Run Payroll
          </button>
          <button className="btn-primary" onClick={() => setIsAddEmployeeOpen(true)}>
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Sub-tabs navigation */}
      <div className="inventory-nav-tabs">
        {[
          { id: 'employees', label: 'Employee Records', icon: Users },
          { id: 'attendance', label: 'Daily Attendance Tracker', icon: Clock },
          { id: 'leave', label: 'Leave Management', icon: Calendar },
          { id: 'payroll', label: 'Payroll Processing Ledger', icon: IndianRupee },
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

      {/* View 1: Employee Records Directory */}
      {activeSubTab === 'employees' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Employee Records ({filteredEmployees.length})</h2>
          </div>
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Job Position</th>
                  <th>Department</th>
                  <th>Base Salary</th>
                  <th>Status</th>
                  <th>Hire Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{emp.id}</td>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{emp.name}</td>
                    <td>{emp.role}</td>
                    <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{emp.department}</td>
                    <td style={{ fontWeight: '800', color: '#10b981' }}>
                      {formatCurrency(emp.salary)}/yr
                    </td>
                    <td>
                      <span className="status-badge completed">
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(emp.hireDate)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => setSelectedProfileEmployee(emp)}
                      >
                        <Eye size={14} />
                        View Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Attendance Tracker */}
      {activeSubTab === 'attendance' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">Daily Attendance & Time Tracking Log</h2>
              <span className="card-subtitle">Real-time clock-in/out records</span>
            </div>

            <button className="btn-primary" onClick={() => setIsMarkAttendanceOpen(true)}>
              <Plus size={16} />
              + Mark Attendance
            </button>
          </div>
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Log Ref</th>
                  <th>Employee Name</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Location Mode</th>
                  <th>Attendance Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.map(att => (
                  <tr key={att.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{att.id}</td>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{att.employee}</td>
                    <td>{formatDate(att.date)}</td>
                    <td style={{ color: '#10b981', fontWeight: '700' }}>{att.clockIn}</td>
                    <td style={{ color: '#ef4444', fontWeight: '700' }}>{att.clockOut}</td>
                    <td><span className="status-badge info">{att.mode}</span></td>
                    <td>
                      <span className={`status-badge ${att.status === 'Present' ? 'completed' : 'low_stock'}`}>
                        {att.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleClockInOut(att.employee)}
                      >
                        <Clock size={12} />
                        Toggle Clock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Leave Management */}
      {activeSubTab === 'leave' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">Leave Applications & Approval Workflow</h2>
              <span className="card-subtitle">Manage employee vacation and sick leave</span>
            </div>

            <button className="btn-primary" onClick={() => setIsRequestLeaveOpen(true)}>
              <Plus size={16} />
              + Apply for Leave
            </button>
          </div>
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Leave Ref</th>
                  <th>Employee Name</th>
                  <th>Leave Category</th>
                  <th>Duration</th>
                  <th>Dates Requested</th>
                  <th>Approval Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map(lv => (
                  <tr key={lv.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{lv.id}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{lv.employee}</td>
                    <td>{lv.type}</td>
                    <td>{lv.duration}</td>
                    <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{lv.dates}</td>
                    <td>
                      <span className={`status-badge ${lv.status === 'Approved' ? 'completed' : lv.status === 'Rejected' ? 'cancelled' : 'pending'}`}>
                        {lv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {lv.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '3px 8px', fontSize: '0.75rem', borderColor: '#10b98150', color: '#10b981' }}
                            onClick={() => handleLeaveStatusChange(lv.id, 'Approved')}
                          >
                            <Check size={14} />
                            Approve
                          </button>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '3px 8px', fontSize: '0.75rem', borderColor: '#ef444450', color: '#ef4444' }}
                            onClick={() => handleLeaveStatusChange(lv.id, 'Rejected')}
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 4: Payroll Ledger */}
      {activeSubTab === 'payroll' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Monthly Payroll Run History</h2>
          </div>
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Pay Period</th>
                  <th>Active Employees</th>
                  <th>Gross Salary Sum</th>
                  <th>Tax Deductions (20%)</th>
                  <th>Net Disbursed Pay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollHistory.map((pr, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{pr.period}</td>
                    <td>{pr.totalEmployees} Staff</td>
                    <td style={{ fontWeight: '700' }}>{formatCurrency(pr.grossPay)}</td>
                    <td style={{ color: '#ef4444' }}>-{formatCurrency(pr.taxDeductions)}</td>
                    <td style={{ fontWeight: '800', color: '#10b981', fontSize: '1rem' }}>
                      {formatCurrency(pr.netPay)}
                    </td>
                    <td>
                      <span className="status-badge paid">
                        <CheckCircle2 size={12} />
                        {pr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <EmployeeProfileModal 
        employee={selectedProfileEmployee}
        onClose={() => setSelectedProfileEmployee(null)}
      />

      <RequestLeaveModal 
        isOpen={isRequestLeaveOpen}
        onClose={() => setIsRequestLeaveOpen(false)}
        employees={employees}
        onRequestLeave={handleRequestLeave}
      />

      <MarkAttendanceModal 
        isOpen={isMarkAttendanceOpen}
        onClose={() => setIsMarkAttendanceOpen(false)}
        employees={employees}
        onMarkAttendance={handleMarkAttendanceSubmit}
      />

      {/* Add Employee Modal */}
      {isAddEmployeeOpen && (
        <div className="modal-overlay" onClick={() => setIsAddEmployeeOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Company Employee</h2>
              <button className="modal-close" onClick={() => setIsAddEmployeeOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label>Employee Full Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Robert Chen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Job Title / Position *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Senior Software Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Department</label>
                    <select 
                      className="form-control"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="Operations">Operations</option>
                      <option value="Logistics">Logistics / Warehouse</option>
                      <option value="Sales">Sales & Marketing</option>
                      <option value="Finance">Finance & Accounting</option>
                      <option value="Engineering">Engineering / IT</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Annual Gross Salary (₹ INR)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddEmployeeOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  Save Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Run Payroll Confirm Modal */}
      {isRunPayrollOpen && (
        <div className="modal-overlay" onClick={() => setIsRunPayrollOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Execute Monthly Payroll Run</h2>
              <button className="modal-close" onClick={() => setIsRunPayrollOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                You are about to process monthly salary disbursement for <strong>{employees.length} active employees</strong>.
              </p>

              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Gross Salary Sum:</span>
                  <span style={{ fontWeight: '700' }}>{formatCurrency(employees.reduce((sum, e) => sum + (e.salary / 12), 0))}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ef4444' }}>
                  <span>Tax & Withholdings (20%):</span>
                  <span>-{formatCurrency(employees.reduce((sum, e) => sum + (e.salary / 12), 0) * 0.20)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '800', color: '#10b981', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <span>Total Net Disbursement:</span>
                  <span>{formatCurrency(employees.reduce((sum, e) => sum + (e.salary / 12), 0) * 0.80)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsRunPayrollOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={handleRunPayroll}>
                <CheckCircle2 size={16} />
                Authorize & Disburse Payroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
