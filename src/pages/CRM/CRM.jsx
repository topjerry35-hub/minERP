import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Flame, 
  Clock, 
  Plus, 
  CheckCircle2 
} from 'lucide-react';

import DealsPipelineBoard from '../../components/CRM/DealsPipelineBoard';
import LeadList from '../../components/CRM/LeadList';
import ActivityLogList from '../../components/CRM/ActivityLogList';
import NewDealModal from '../../components/CRM/NewDealModal';
import NewLeadModal from '../../components/CRM/NewLeadModal';
import LogActivityModal from '../../components/CRM/LogActivityModal';
import LeadDetailModal from '../../components/CRM/LeadDetailModal';
import { 
  fetchDeals, 
  createDeal, 
  updateDealStage, 
  fetchLeads, 
  createLead, 
  fetchActivities, 
  createActivity 
} from '../../services/api';

import { 
  generateDeals, 
  generateLeads, 
  generateActivities 
} from '../../utils/mockDataGenerator';

export default function CRM({ searchQuery, setSearchQuery }) {
  const [activeSubTab, setActiveSubTab] = useState('pipeline');

  // Modal triggers
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  // Database Datasets
  const [deals, setDeals] = useState(() => generateDeals(100));
  const [leads, setLeads] = useState(() => generateLeads(100));
  const [activities, setActivities] = useState(() => generateActivities(100));

  useEffect(() => {
    async function loadDbData() {
      const fetchedDeals = await fetchDeals();
      if (fetchedDeals && fetchedDeals.length > 0) setDeals(fetchedDeals);

      const fetchedLeads = await fetchLeads();
      if (fetchedLeads && fetchedLeads.length > 0) setLeads(fetchedLeads);

      const fetchedActs = await fetchActivities();
      if (fetchedActs && fetchedActs.length > 0) setActivities(fetchedActs);
    }
    loadDbData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateDeal = async (newDealData) => {
    const savedDeal = await createDeal(newDealData);
    setDeals(prev => [savedDeal, ...prev]);
    showToast(`New Deal opportunity "${savedDeal.title}" (₹${(savedDeal.amount || 0).toLocaleString()}) added!`);
  };

  const handleAddLead = async (newLeadData) => {
    const savedLead = await createLead(newLeadData);
    setLeads(prev => [savedLead, ...prev]);
    showToast(`Sales Lead "${savedLead.name}" registered successfully!`);
  };

  const handleLogActivity = async (newActivityData) => {
    const savedAct = await createActivity(newActivityData);
    setActivities(prev => [savedAct, ...prev]);
    showToast(`Logged ${savedAct.type} interaction with ${savedAct.contact}!`);
  };

  const handleMoveDealStage = async (dealId, nextStage) => {
    await updateDealStage(dealId, nextStage);
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: nextStage } : d));
    showToast(`Deal moved to stage: ${nextStage}`);
  };

  const handleConvertLeadToCustomer = (lead) => {
    // Remove from leads
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    
    // Automatically generate a new Deal from converted lead
    const newDeal = {
      id: `DEAL-${Math.floor(100 + Math.random() * 900)}`,
      title: `${lead.company} Contract Opportunity`,
      company: lead.company,
      contact: lead.name,
      amount: lead.estimatedValue,
      stage: 'Qualified',
      probability: 50
    };
    setDeals(prev => [newDeal, ...prev]);

    showToast(`Converted Lead "${lead.name}" (${lead.company}) into Customer & Deal!`);
  };

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
          <h1>CRM & Deals Pipeline</h1>
          <p>Manage customer relationships, sales leads, pipeline stages, and interaction logs</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => setIsNewLeadOpen(true)}>
            <Flame size={16} color="#f59e0b" />
            + New Lead
          </button>
          <button className="btn-secondary" onClick={() => setIsLogActivityOpen(true)}>
            <Clock size={16} color="#3b82f6" />
            Log Activity
          </button>
          <button className="btn-primary" onClick={() => setIsNewDealOpen(true)}>
            <Plus size={16} />
            New Deal
          </button>
        </div>
      </div>

      {/* Sub-tabs navigation */}
      <div className="inventory-nav-tabs">
        {[
          { id: 'pipeline', label: 'Deals Pipeline Board', icon: Briefcase },
          { id: 'leads', label: 'Leads Directory', icon: Flame },
          { id: 'activities', label: 'Activity & Interaction Feed', icon: Clock },
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

      {/* Sub-tab Views */}
      {activeSubTab === 'pipeline' && (
        <DealsPipelineBoard 
          deals={deals}
          onNewDealClick={() => setIsNewDealOpen(true)}
          onMoveDealStage={handleMoveDealStage}
          searchQuery={searchQuery}
        />
      )}

      {activeSubTab === 'leads' && (
        <LeadList 
          leads={leads}
          onAddLeadClick={() => setIsNewLeadOpen(true)}
          onConvertLeadToCustomer={handleConvertLeadToCustomer}
          onSelectLead={(lead) => setSelectedLeadForDetail(lead)}
          searchQuery={searchQuery}
        />
      )}

      {activeSubTab === 'activities' && (
        <ActivityLogList 
          activities={activities}
          onLogActivityClick={() => setIsLogActivityOpen(true)}
          searchQuery={searchQuery}
        />
      )}

      {/* Modals */}
      <NewDealModal 
        isOpen={isNewDealOpen}
        onClose={() => setIsNewDealOpen(false)}
        onCreateDeal={handleCreateDeal}
      />

      <NewLeadModal 
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onAddLead={handleAddLead}
      />

      <LogActivityModal 
        isOpen={isLogActivityOpen}
        onClose={() => setIsLogActivityOpen(false)}
        onLogActivity={handleLogActivity}
      />

      <LeadDetailModal 
        isOpen={!!selectedLeadForDetail}
        lead={selectedLeadForDetail}
        onClose={() => setSelectedLeadForDetail(null)}
        onConvert={handleConvertLeadToCustomer}
      />
    </div>
  );
}
