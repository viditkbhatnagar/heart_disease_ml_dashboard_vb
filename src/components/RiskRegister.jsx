import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  AlertTriangle,
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const RiskRegister = ({ risksByModel, setRisksByModel, modelResults }) => {
  const modelNames = Object.keys(risksByModel || {});
  const [selectedModel, setSelectedModel] = useState(modelNames[0] || '');
  const [viewMode, setViewMode] = useState('focused'); // focused | all
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    risk: '',
    category: 'Bias',
    impact: 3,
    likelihood: 3,
    mitigation: ''
  });

  const categories = ['Bias', 'Model Drift', 'Misclassification', 'Automation Bias', 'Privacy', 'Generalization', 'Data Quality', 'Operational'];

  // Keep selection in sync with available models
  useEffect(() => {
    if (!selectedModel && modelNames.length) {
      setSelectedModel(modelNames[0]);
    } else if (selectedModel && !modelNames.includes(selectedModel) && modelNames.length) {
      setSelectedModel(modelNames[0]);
    }
  }, [modelNames, selectedModel]);

  // Clear editing state when switching models
  useEffect(() => {
    setEditingId(null);
    setIsAdding(false);
    setExpandedId(null);
    resetForm();
  }, [selectedModel]);

  const risks = risksByModel[selectedModel] || [];

  const updateRisks = (updater) => {
    setRisksByModel(prev => {
      const current = prev[selectedModel] || [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [selectedModel]: next };
    });
  };

  // Calculate RPN and sort
  const sortedRisks = useMemo(() => {
    return [...risks]
      .map(r => ({ ...r, rpn: r.impact * r.likelihood }))
      .sort((a, b) => b.rpn - a.rpn);
  }, [risks]);

  const sortedByModel = useMemo(() => {
    return modelNames.reduce((acc, name) => {
      const list = risksByModel[name] || [];
      acc[name] = [...list]
        .map(r => ({ ...r, rpn: r.impact * r.likelihood }))
        .sort((a, b) => b.rpn - a.rpn);
      return acc;
    }, {});
  }, [modelNames, risksByModel]);

  const modelComparison = useMemo(() => {
    return modelNames.map(name => {
      const list = risksByModel[name] || [];
      const total = list.length;
      const high = list.filter(r => r.impact * r.likelihood >= 15).length;
      const medium = list.filter(r => r.impact * r.likelihood >= 10 && r.impact * r.likelihood < 15).length;
      const low = list.filter(r => r.impact * r.likelihood < 10).length;
      const avgRpn = total ? list.reduce((acc, r) => acc + r.impact * r.likelihood, 0) / total : 0;
      const metrics = modelResults?.[name];

      return {
        name,
        total,
        high,
        medium,
        low,
        avgRpn,
        accuracy: metrics?.accuracy,
        f1: metrics?.f1_score
      };
    });
  }, [modelNames, modelResults, risksByModel]);

  // Get RPN color class
  const getRPNClass = (rpn) => {
    if (rpn >= 20) return 'rpn-critical';
    if (rpn >= 15) return 'rpn-high';
    if (rpn >= 10) return 'rpn-medium';
    return 'rpn-low';
  };

  // Get RPN label
  const getRPNLabel = (rpn) => {
    if (rpn >= 20) return 'Critical';
    if (rpn >= 15) return 'High';
    if (rpn >= 10) return 'Medium';
    return 'Low';
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'impact' || name === 'likelihood' ? parseInt(value) : value
    }));
  };

  // Add new risk
  const handleAdd = () => {
    const nextId = risks.length ? Math.max(...risks.map(r => r.id || 0)) + 1 : 1;
    const newRisk = {
      id: nextId,
      ...formData,
      rpn: formData.impact * formData.likelihood
    };
    updateRisks(prev => [...prev, newRisk].sort((a, b) => (b.impact * b.likelihood) - (a.impact * a.likelihood)));
    setIsAdding(false);
    resetForm();
  };

  // Edit existing risk
  const handleEdit = (risk) => {
    setEditingId(risk.id);
    setFormData({
      risk: risk.risk,
      category: risk.category,
      impact: risk.impact,
      likelihood: risk.likelihood,
      mitigation: risk.mitigation
    });
  };

  // Save edited risk
  const handleSave = (id) => {
    updateRisks(prev => prev.map(r => 
      r.id === id 
        ? { ...r, ...formData, rpn: formData.impact * formData.likelihood }
        : r
    ));
    setEditingId(null);
    resetForm();
  };

  // Delete risk
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this risk?')) {
      updateRisks(prev => prev.filter(r => r.id !== id));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      risk: '',
      category: 'Bias',
      impact: 3,
      likelihood: 3,
      mitigation: ''
    });
  };

  // Risk matrix chart
  const riskMatrixOption = {
    title: {
      text: 'Risk Priority Matrix',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      formatter: (params) => {
        const risk = sortedRisks.find(r => r.impact === params.data[0] && r.likelihood === params.data[1]);
        if (risk) {
          return `<strong>${risk.risk.substring(0, 50)}...</strong><br/>Impact: ${risk.impact}<br/>Likelihood: ${risk.likelihood}<br/>RPN: ${risk.rpn}`;
        }
        return '';
      }
    },
    grid: {
      left: '15%',
      right: '10%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      type: 'value',
      name: 'Impact',
      min: 0,
      max: 6,
      interval: 1,
      axisLabel: { formatter: (val) => val === 0 ? '' : val }
    },
    yAxis: {
      type: 'value',
      name: 'Likelihood',
      min: 0,
      max: 6,
      interval: 1,
      axisLabel: { formatter: (val) => val === 0 ? '' : val }
    },
    visualMap: {
      min: 1,
      max: 25,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#10b981', '#f59e0b', '#ef4444', '#7c2d12']
      },
      text: ['High RPN', 'Low RPN']
    },
    series: [{
      type: 'scatter',
      symbolSize: (data) => Math.min(data[2] * 3 + 20, 60),
      data: sortedRisks.map(r => [r.impact, r.likelihood, r.rpn]),
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffsetY: 5
      }
    }]
  };

  // RPN distribution chart
  const rpnDistributionOption = {
    title: {
      text: 'Risk Priority Distribution',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} risks ({d}%)'
    },
    legend: {
      bottom: 0
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{c}'
      },
      data: [
        { 
          value: sortedRisks.filter(r => r.rpn >= 20).length, 
          name: 'Critical',
          itemStyle: { color: '#7c2d12' }
        },
        { 
          value: sortedRisks.filter(r => r.rpn >= 15 && r.rpn < 20).length, 
          name: 'High',
          itemStyle: { color: '#ef4444' }
        },
        { 
          value: sortedRisks.filter(r => r.rpn >= 10 && r.rpn < 15).length, 
          name: 'Medium',
          itemStyle: { color: '#f59e0b' }
        },
        { 
          value: sortedRisks.filter(r => r.rpn < 10).length, 
          name: 'Low',
          itemStyle: { color: '#10b981' }
        }
      ]
    }]
  };

  // Category breakdown chart
  const categoryBreakdownOption = {
    title: {
      text: 'Risks by Category',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: [...new Set(sortedRisks.map(r => r.category))],
      axisLabel: { rotate: 45, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: 'Count'
    },
    series: [{
      type: 'bar',
      data: [...new Set(sortedRisks.map(r => r.category))].map(cat => ({
        value: sortedRisks.filter(r => r.category === cat).length,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#0d9488' },
              { offset: 1, color: '#5eead4' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      }))
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Risk Register</h2>
          <p className="text-slate-500 mt-1">
            Identify, assess, and mitigate AI model risks with automatic RPN calculation
          </p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setViewMode('focused'); resetForm(); }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Risk
        </button>
      </div>

      {/* Model Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {modelNames.map(name => (
            <button
              key={name}
              onClick={() => { setSelectedModel(name); setViewMode('focused'); }}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                selectedModel === name && viewMode === 'focused'
                  ? 'border-teal-400 bg-teal-50 text-teal-700 shadow-sm' 
                  : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{name}</span>
                {modelResults?.[name] && (
                  <span className="text-xs text-slate-500">
                    {(modelResults[name].accuracy * 100).toFixed(1)}% acc
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-500">View:</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            <button
              onClick={() => setViewMode('focused')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'focused' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600'}`}
            >
              Focused
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'all' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600'}`}
            >
              All Models
            </button>
          </div>
        </div>
      </div>

      {/* Model Comparison Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modelComparison.map(model => (
          <div
            key={model.name}
            className={`card ${selectedModel === model.name ? 'border-teal-300 shadow-md' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-slate-800">{model.name}</p>
              <span className="text-xs text-slate-500">
                Acc {(model.accuracy * 100 || 0).toFixed(1)}% · F1 {(model.f1 * 100 || 0).toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 rounded bg-red-50 text-center">
                <p className="font-bold text-red-600">{model.high}</p>
                <p className="text-xs text-red-500">High</p>
              </div>
              <div className="p-2 rounded bg-amber-50 text-center">
                <p className="font-bold text-amber-600">{model.medium}</p>
                <p className="text-xs text-amber-600">Medium</p>
              </div>
              <div className="p-2 rounded bg-emerald-50 text-center">
                <p className="font-bold text-emerald-600">{model.low}</p>
                <p className="text-xs text-emerald-600">Low</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Avg RPN: <span className="font-semibold text-slate-700">{model.avgRpn.toFixed(1)}</span> · Total {model.total}
            </p>
          </div>
        ))}
      </div>

      {viewMode === 'all' && (
        <div className="card">
          <h3 className="card-header">Risks by Model</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modelNames.map(name => {
              const list = sortedByModel[name] || [];
              const metrics = modelResults?.[name];
              return (
                <div key={name} className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-800">{name}</p>
                    {metrics && (
                      <span className="text-xs text-slate-500">
                        Acc {(metrics.accuracy * 100).toFixed(1)}% · F1 {(metrics.f1_score * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-auto pr-1">
                    {list.length === 0 && (
                      <p className="text-xs text-slate-500">No risks defined</p>
                    )}
                    {list.map((risk, idx) => (
                      <div key={risk.id || idx} className="border border-slate-200 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <span className={`badge ${
                            risk.rpn >= 15 ? 'badge-danger' : 
                            risk.rpn >= 10 ? 'badge-warning' : 
                            'badge-success'
                          }`}>
                            {risk.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRPNClass(risk.rpn)}`}>
                            RPN: {risk.rpn}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 mt-1">{risk.risk}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{risk.mitigation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-3">Switch to Focused view to edit risks for a specific model.</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <p className="metric-value">{sortedRisks.length}</p>
          <p className="metric-label">Total Risks</p>
        </div>
        <div className="metric-card bg-red-50">
          <p className="metric-value text-red-600">{sortedRisks.filter(r => r.rpn >= 15).length}</p>
          <p className="metric-label">High Priority</p>
        </div>
        <div className="metric-card bg-amber-50">
          <p className="metric-value text-amber-600">{sortedRisks.filter(r => r.rpn >= 10 && r.rpn < 15).length}</p>
          <p className="metric-label">Medium Priority</p>
        </div>
        <div className="metric-card bg-emerald-50">
          <p className="metric-value text-emerald-600">{sortedRisks.filter(r => r.rpn < 10).length}</p>
          <p className="metric-label">Low Priority</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="chart-container">
          <ReactECharts option={riskMatrixOption} style={{ height: '300px' }} />
        </div>
        <div className="chart-container">
          <ReactECharts option={rpnDistributionOption} style={{ height: '300px' }} />
        </div>
        <div className="chart-container">
          <ReactECharts option={categoryBreakdownOption} style={{ height: '300px' }} />
        </div>
      </div>

      {/* Add Risk Form */}
      {isAdding && (
        <div className="card border-2 border-teal-500">
          <h3 className="card-header flex items-center justify-between">
            <span className="flex items-center">
              <Plus className="w-5 h-5 text-teal-600 mr-2" />
              Add New Risk
            </span>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Risk Description</label>
              <input
                type="text"
                name="risk"
                value={formData.risk}
                onChange={handleInputChange}
                placeholder="Describe the risk..."
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="input">
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Impact (1-5)</label>
                <select name="impact" value={formData.impact} onChange={handleInputChange} className="input">
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Likelihood (1-5)</label>
                <select name="likelihood" value={formData.likelihood} onChange={handleInputChange} className="input">
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mitigation Strategy</label>
              <textarea
                name="mitigation"
                value={formData.mitigation}
                onChange={handleInputChange}
                placeholder="Describe mitigation measures..."
                rows={3}
                className="input"
              />
            </div>
            
            <div className="md:col-span-2 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-slate-500">Calculated RPN: </span>
                <span className={`font-bold px-2 py-1 rounded ${getRPNClass(formData.impact * formData.likelihood)}`}>
                  {formData.impact * formData.likelihood}
                </span>
              </div>
              <button onClick={handleAdd} className="btn btn-primary" disabled={!formData.risk || !formData.mitigation}>
                <Save className="w-4 h-4 mr-2" />
                Save Risk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Risk Table */}
      <div className="card">
        <h3 className="card-header flex items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
          Risk Items (Sorted by RPN)
        </h3>
        
        <div className="space-y-3">
          {sortedRisks.map((risk, index) => (
            <div 
              key={risk.id} 
              className={`border rounded-lg overflow-hidden ${
                risk.rpn >= 15 ? 'border-red-200 bg-red-50/50' : 
                risk.rpn >= 10 ? 'border-amber-200 bg-amber-50/50' : 
                'border-slate-200'
              }`}
            >
              {/* Risk Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === risk.id ? null : risk.id)}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${
                        risk.rpn >= 15 ? 'badge-danger' : 
                        risk.rpn >= 10 ? 'badge-warning' : 
                        'badge-success'
                      }`}>
                        {risk.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRPNClass(risk.rpn)}`}>
                        RPN: {risk.rpn} ({getRPNLabel(risk.rpn)})
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium mt-1">
                      {editingId === risk.id ? (
                        <input
                          type="text"
                          name="risk"
                          value={formData.risk}
                          onChange={handleInputChange}
                          className="input"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        risk.risk
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {editingId === risk.id ? (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSave(risk.id); }}
                        className="btn btn-primary btn-sm"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingId(null); resetForm(); }}
                        className="btn btn-secondary btn-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(risk); }}
                        className="text-slate-400 hover:text-teal-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(risk.id); }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {expandedId === risk.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedId === risk.id && (
                <div className="px-4 pb-4 border-t border-slate-200 bg-white">
                  {editingId === risk.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select name="category" value={formData.category} onChange={handleInputChange} className="input">
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Impact</label>
                        <select name="impact" value={formData.impact} onChange={handleInputChange} className="input">
                          {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Likelihood</label>
                        <select name="likelihood" value={formData.likelihood} onChange={handleInputChange} className="input">
                          {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mitigation</label>
                        <textarea
                          name="mitigation"
                          value={formData.mitigation}
                          onChange={handleInputChange}
                          rows={2}
                          className="input"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-2xl font-bold text-slate-800">{risk.impact}</p>
                          <p className="text-sm text-slate-500">Impact</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-2xl font-bold text-slate-800">{risk.likelihood}</p>
                          <p className="text-sm text-slate-500">Likelihood</p>
                        </div>
                        <div className={`text-center p-3 rounded-lg ${getRPNClass(risk.rpn)}`}>
                          <p className="text-2xl font-bold">{risk.rpn}</p>
                          <p className="text-sm opacity-90">RPN Score</p>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          <Shield className="w-4 h-4 inline mr-1" />
                          Mitigation Strategy
                        </p>
                        <p className="text-sm text-slate-600">{risk.mitigation}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RPN Scale Reference */}
      <div className="card">
        <h3 className="card-header">RPN Scale Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-lg bg-emerald-500 text-white">
            <p className="font-bold">1-9</p>
            <p className="text-sm">Low Priority</p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-500 text-slate-900">
            <p className="font-bold">10-14</p>
            <p className="text-sm">Medium Priority</p>
          </div>
          <div className="p-4 rounded-lg bg-orange-500 text-white">
            <p className="font-bold">15-19</p>
            <p className="text-sm">High Priority</p>
          </div>
          <div className="p-4 rounded-lg bg-red-700 text-white">
            <p className="font-bold">20-25</p>
            <p className="text-sm">Critical Priority</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-4 text-center">
          RPN (Risk Priority Number) = Impact × Likelihood. Higher values indicate greater urgency for mitigation.
        </p>
      </div>
    </div>
  );
};

export default RiskRegister;
