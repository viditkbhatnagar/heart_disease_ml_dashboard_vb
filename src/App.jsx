import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Brain, 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  FileCheck,
  Heart,
  Activity,
  Shield
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ModelTraining from './components/ModelTraining';
import ModelCard from './components/ModelCard';
import RiskRegister from './components/RiskRegister';
import Analytics from './components/Analytics';
import ExecutiveSummary from './components/ExecutiveSummary';
import BiasMitigation from './components/BiasMitigation';

import modelData from './data/modelData.json';
import heartData from './data/heartData.json';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'training', label: 'Model Training', icon: Brain },
  { id: 'modelcard', label: 'Model Card', icon: FileText },
  { id: 'risk', label: 'Risk Register', icon: AlertTriangle },
  { id: 'bias', label: 'Bias Mitigation', icon: Shield },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'summary', label: 'Executive Summary', icon: FileCheck },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const modelNames = Object.keys(modelData.model_results || {});
  const [riskRegisters, setRiskRegisters] = useState(() => {
    if (!modelNames.length) {
      const base = modelData.risk_register || [];
      return { Default: base.map((risk, idx) => ({ ...risk, id: risk.id ?? idx + 1 })) };
    }
    const baseRisks = modelData.risk_register || [];
    return modelNames.reduce((acc, name) => {
      acc[name] = baseRisks.map((risk, idx) => ({
        ...risk,
        id: risk.id ?? idx + 1
      }));
      return acc;
    }, {});
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard modelData={modelData} heartData={heartData} />;
      case 'training':
        return <ModelTraining modelData={modelData} heartData={heartData} />;
      case 'modelcard':
        return <ModelCard modelData={modelData} />;
      case 'risk':
        return (
          <RiskRegister
            risksByModel={riskRegisters}
            setRisksByModel={setRiskRegisters}
            modelResults={modelData.model_results}
          />
        );
      case 'bias':
        return <BiasMitigation modelData={modelData} />;
      case 'analytics':
        return <Analytics modelData={modelData} heartData={heartData} />;
      case 'summary':
        return <ExecutiveSummary modelData={modelData} riskRegister={riskRegisters} />;
      default:
        return <Dashboard modelData={modelData} heartData={heartData} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Heart Disease ML Dashboard</h1>
                <p className="text-teal-100 text-sm">AI-Powered Cardiovascular Risk Assessment</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Model v1.0</span>
              </div>
              <div className="text-sm text-teal-100">
                Last Updated: {modelData.model_card.last_updated}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'bias' && (
                    <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">New</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-teal-400" />
              <span className="font-medium">Heart Disease Prediction System</span>
            </div>
            <div className="text-sm text-slate-400">
              Developed for AI in Healthcare Operations | UCI Heart Disease Dataset
            </div>
            <div className="text-sm">
              © 2026 AI Healthcare Analytics Team
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
