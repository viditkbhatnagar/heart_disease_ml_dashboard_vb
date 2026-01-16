import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  TrendingUp,
  TrendingDown,
  Users,
  Scale,
  Zap,
  Info,
  ArrowRight,
  Target,
  BarChart2,
  AlertCircle
} from 'lucide-react';

const BiasMitigation = ({ modelData }) => {
  const [selectedTechnique, setSelectedTechnique] = useState('reweighting');
  
  const { bias_mitigation, identified_biases } = modelData;
  
  if (!bias_mitigation || !identified_biases) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <p className="text-slate-600">Bias mitigation data not available. Please run the analysis first.</p>
      </div>
    );
  }

  const original = bias_mitigation.original;
  const techniques = {
    reweighting: bias_mitigation.reweighting,
    threshold: bias_mitigation.threshold,
    oversampling: bias_mitigation.oversampling,
    calibration: bias_mitigation.calibration
  };

  const selectedData = techniques[selectedTechnique];

  // Calculate improvement percentages
  const calculateImprovement = (original, mitigated, metric) => {
    const origGap = Math.abs(original.bias_gaps?.F?.[metric] || 0);
    const mitGap = Math.abs(mitigated.bias_gaps?.F?.[metric] || 0);
    if (origGap === 0) return 0;
    return ((origGap - mitGap) / origGap * 100).toFixed(1);
  };

  // Technique descriptions
  const techniqueDetails = {
    reweighting: {
      icon: Scale,
      color: 'blue',
      fullDescription: `Sample reweighting addresses data imbalance by assigning different importance weights to training samples. Samples from underrepresented groups (females) receive higher weights, making their contribution to the model's learning process proportionally larger.`,
      howItWorks: [
        'Calculate the frequency of each demographic-outcome combination',
        'Assign weights inversely proportional to group frequency',
        'Minority groups get higher weights, majority groups get lower weights',
        'Model training uses these weights to balance influence'
      ],
      pros: ['Does not modify original data', 'Easy to implement', 'Preserves all samples'],
      cons: ['May overfit to minority samples', 'Requires careful weight tuning']
    },
    threshold: {
      icon: Target,
      color: 'purple',
      fullDescription: `Threshold optimization uses different classification thresholds for different demographic groups. Instead of using a fixed 0.5 threshold for all predictions, we find optimal thresholds that equalize performance metrics (like True Positive Rate) across groups.`,
      howItWorks: [
        'Train the model with standard settings',
        'Analyze performance at different thresholds for each group',
        'Find thresholds that minimize performance gaps',
        'Apply group-specific thresholds during prediction'
      ],
      pros: ['No retraining needed', 'Directly targets fairness metrics', 'Flexible post-hoc adjustment'],
      cons: ['Different thresholds may seem unfair', 'May reduce overall accuracy']
    },
    oversampling: {
      icon: Users,
      color: 'emerald',
      fullDescription: `Minority oversampling creates a balanced training dataset by duplicating samples from underrepresented groups. This ensures the model sees equal representation from all demographic groups during training.`,
      howItWorks: [
        'Identify the minority group in training data',
        'Randomly duplicate minority samples with replacement',
        'Continue until minority matches majority group size',
        'Train model on this balanced dataset'
      ],
      pros: ['Simple and intuitive', 'Balances representation', 'Effective for severe imbalance'],
      cons: ['Can lead to overfitting', 'Duplicates may not add new information']
    },
    calibration: {
      icon: BarChart2,
      color: 'amber',
      fullDescription: `Probability calibration adjusts the model's predicted probabilities to be more reliable. Using isotonic regression, we ensure that when the model predicts 70% probability, approximately 70% of such cases are actually positive.`,
      howItWorks: [
        'Train the base model normally',
        'Use cross-validation to get probability predictions',
        'Fit isotonic regression to map predicted to actual probabilities',
        'Apply calibration to all new predictions'
      ],
      pros: ['Improves probability reliability', 'Works as post-processing', 'Helps with confidence scores'],
      cons: ['May not directly reduce bias gaps', 'Requires sufficient validation data']
    }
  };

  // Before/After comparison chart for gender metrics
  const genderComparisonOption = {
    title: {
      text: 'Gender Performance: Before vs After Mitigation',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${(p.value * 100).toFixed(1)}%<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Original Male', 'Original Female', 'Mitigated Male', 'Mitigated Female'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'TPR']
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      axisLabel: { formatter: (val) => `${(val * 100).toFixed(0)}%` }
    },
    series: [
      {
        name: 'Original Male',
        type: 'bar',
        data: [
          original.gender_metrics.M.accuracy,
          original.gender_metrics.M.precision,
          original.gender_metrics.M.recall,
          original.gender_metrics.M.f1_score,
          original.gender_metrics.M.true_positive_rate
        ],
        itemStyle: { color: '#93c5fd' }
      },
      {
        name: 'Original Female',
        type: 'bar',
        data: [
          original.gender_metrics.F.accuracy,
          original.gender_metrics.F.precision,
          original.gender_metrics.F.recall,
          original.gender_metrics.F.f1_score,
          original.gender_metrics.F.true_positive_rate
        ],
        itemStyle: { color: '#fda4af' }
      },
      {
        name: 'Mitigated Male',
        type: 'bar',
        data: [
          selectedData.gender_metrics.M.accuracy,
          selectedData.gender_metrics.M.precision,
          selectedData.gender_metrics.M.recall,
          selectedData.gender_metrics.M.f1_score,
          selectedData.gender_metrics.M.true_positive_rate
        ],
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: 'Mitigated Female',
        type: 'bar',
        data: [
          selectedData.gender_metrics.F.accuracy,
          selectedData.gender_metrics.F.precision,
          selectedData.gender_metrics.F.recall,
          selectedData.gender_metrics.F.f1_score,
          selectedData.gender_metrics.F.true_positive_rate
        ],
        itemStyle: { color: '#ec4899' }
      }
    ]
  };

  // Bias gap reduction chart
  const biasGapOption = {
    title: {
      text: 'Bias Gap Reduction (Lower is Better)',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${(Math.abs(p.value) * 100).toFixed(1)}%<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Original', selectedData.name],
      bottom: 0
    },
    radar: {
      indicator: [
        { name: 'Accuracy Gap', max: 0.3 },
        { name: 'F1 Gap', max: 0.3 },
        { name: 'TPR Gap', max: 0.3 },
        { name: 'FPR Gap', max: 0.3 },
        { name: 'Positive Rate Gap', max: 0.6 }
      ],
      center: ['50%', '55%'],
      radius: '60%'
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [
            Math.abs(original.bias_gaps?.F?.accuracy_gap || 0),
            Math.abs(original.bias_gaps?.F?.f1_gap || 0),
            Math.abs(original.bias_gaps?.F?.tpr_gap || 0),
            Math.abs(original.bias_gaps?.F?.fpr_gap || 0),
            Math.abs(original.bias_gaps?.F?.positive_rate_gap || 0)
          ],
          name: 'Original',
          lineStyle: { color: '#ef4444', width: 2 },
          areaStyle: { color: 'rgba(239, 68, 68, 0.3)' },
          itemStyle: { color: '#ef4444' }
        },
        {
          value: [
            Math.abs(selectedData.bias_gaps?.F?.accuracy_gap || 0),
            Math.abs(selectedData.bias_gaps?.F?.f1_gap || 0),
            Math.abs(selectedData.bias_gaps?.F?.tpr_gap || 0),
            Math.abs(selectedData.bias_gaps?.F?.fpr_gap || 0),
            Math.abs(selectedData.bias_gaps?.F?.positive_rate_gap || 0)
          ],
          name: selectedData.name,
          lineStyle: { color: '#10b981', width: 2 },
          areaStyle: { color: 'rgba(16, 185, 129, 0.3)' },
          itemStyle: { color: '#10b981' }
        }
      ]
    }]
  };

  // All techniques comparison
  const allTechniquesOption = {
    title: {
      text: 'Mitigation Techniques Comparison',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${(Math.abs(p.value) * 100).toFixed(1)}%<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['F1 Gap', 'TPR Gap', 'Overall F1'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Original', 'Reweighting', 'Threshold', 'Oversampling', 'Calibration'],
      axisLabel: { fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      axisLabel: { formatter: (val) => `${(val * 100).toFixed(0)}%` }
    },
    series: [
      {
        name: 'F1 Gap',
        type: 'bar',
        data: [
          Math.abs(original.bias_gaps?.F?.f1_gap || 0),
          Math.abs(bias_mitigation.reweighting.bias_gaps?.F?.f1_gap || 0),
          Math.abs(bias_mitigation.threshold.bias_gaps?.F?.f1_gap || 0),
          Math.abs(bias_mitigation.oversampling.bias_gaps?.F?.f1_gap || 0),
          Math.abs(bias_mitigation.calibration.bias_gaps?.F?.f1_gap || 0)
        ],
        itemStyle: { color: '#f59e0b' }
      },
      {
        name: 'TPR Gap',
        type: 'bar',
        data: [
          Math.abs(original.bias_gaps?.F?.tpr_gap || 0),
          Math.abs(bias_mitigation.reweighting.bias_gaps?.F?.tpr_gap || 0),
          Math.abs(bias_mitigation.threshold.bias_gaps?.F?.tpr_gap || 0),
          Math.abs(bias_mitigation.oversampling.bias_gaps?.F?.tpr_gap || 0),
          Math.abs(bias_mitigation.calibration.bias_gaps?.F?.tpr_gap || 0)
        ],
        itemStyle: { color: '#ef4444' }
      },
      {
        name: 'Overall F1',
        type: 'line',
        data: [
          original.overall_metrics.f1_score,
          bias_mitigation.reweighting.overall_metrics.f1_score,
          bias_mitigation.threshold.overall_metrics.f1_score,
          bias_mitigation.oversampling.overall_metrics.f1_score,
          bias_mitigation.calibration.overall_metrics.f1_score
        ],
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3 },
        symbolSize: 10
      }
    ]
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const currentTechniqueDetail = techniqueDetails[selectedTechnique];
  const TechniqueIcon = currentTechniqueDetail.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Bias Detection & Mitigation</h2>
        <p className="text-slate-500 mt-1">
          Identify, understand, and mitigate biases in the heart disease prediction model
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card bg-red-50">
          <p className="metric-value text-red-600">{identified_biases.length}</p>
          <p className="metric-label">Biases Identified</p>
        </div>
        <div className="metric-card bg-amber-50">
          <p className="metric-value text-amber-600">{identified_biases.filter(b => b.severity === 'Critical' || b.severity === 'High').length}</p>
          <p className="metric-label">High/Critical Severity</p>
        </div>
        <div className="metric-card bg-blue-50">
          <p className="metric-value text-blue-600">4</p>
          <p className="metric-label">Mitigation Techniques</p>
        </div>
        <div className="metric-card bg-emerald-50">
          <p className="metric-value text-emerald-600">
            {calculateImprovement(original, techniques.reweighting, 'f1_gap')}%
          </p>
          <p className="metric-label">Best F1 Gap Reduction</p>
        </div>
      </div>

      {/* Identified Biases Section */}
      <div className="card">
        <h3 className="card-header flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          Identified Biases
        </h3>
        
        <div className="space-y-4">
          {identified_biases.map((bias, index) => (
            <div 
              key={bias.id} 
              className={`border rounded-lg p-4 ${getSeverityColor(bias.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-bold text-lg">{bias.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      bias.severity === 'Critical' ? 'bg-red-600 text-white' :
                      bias.severity === 'High' ? 'bg-orange-500 text-white' :
                      'bg-yellow-500 text-slate-900'
                    }`}>
                      {bias.severity}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs">
                      {bias.type}
                    </span>
                  </div>
                  <p className="text-sm mb-3">{bias.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/50 rounded p-2">
                      <span className="font-medium">Evidence:</span>
                      <p className="text-xs mt-1">{bias.evidence}</p>
                    </div>
                    <div className="bg-white/50 rounded p-2">
                      <span className="font-medium">Impact:</span>
                      <p className="text-xs mt-1">{bias.impact}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-xs font-medium">Recommended Solution:</span>
                    <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-xs">
                      {techniques[bias.recommended_solution]?.name || bias.recommended_solution}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mitigation Technique Selector */}
      <div className="card">
        <h3 className="card-header flex items-center">
          <Shield className="w-5 h-5 text-teal-600 mr-2" />
          Select Mitigation Technique
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(techniques).map(([key, tech]) => {
            const detail = techniqueDetails[key];
            const Icon = detail.icon;
            const isSelected = selectedTechnique === key;
            const f1Improvement = calculateImprovement(original, tech, 'f1_gap');
            const tprImprovement = calculateImprovement(original, tech, 'tpr_gap');
            
            return (
              <button
                key={key}
                onClick={() => setSelectedTechnique(key)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected 
                    ? `border-${detail.color}-500 bg-${detail.color}-50` 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? `text-${detail.color}-600` : 'text-slate-400'}`} />
                <p className="font-semibold text-slate-800 text-sm">{tech.name}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-xs">
                    <span className="text-slate-500">F1 Gap:</span>
                    <span className={`ml-1 font-medium ${parseFloat(f1Improvement) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {parseFloat(f1Improvement) > 0 ? '↓' : '↑'}{Math.abs(parseFloat(f1Improvement))}%
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="text-slate-500">TPR Gap:</span>
                    <span className={`ml-1 font-medium ${parseFloat(tprImprovement) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {parseFloat(tprImprovement) > 0 ? '↓' : '↑'}{Math.abs(parseFloat(tprImprovement))}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Technique Details */}
      <div className="card bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-start space-x-4">
          <div className={`bg-${currentTechniqueDetail.color}-100 p-3 rounded-xl`}>
            <TechniqueIcon className={`w-8 h-8 text-${currentTechniqueDetail.color}-600`} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800">{selectedData.name}</h3>
            <p className="text-slate-600 mt-2">{currentTechniqueDetail.fullDescription}</p>
            
            {selectedData.technique && (
              <div className="mt-3 p-3 bg-slate-100 rounded-lg">
                <span className="font-medium text-slate-700">Implementation: </span>
                <span className="text-slate-600">{selectedData.technique}</span>
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
              <Zap className="w-4 h-4 text-amber-500 mr-2" />
              How It Works
            </h4>
            <ol className="space-y-2">
              {currentTechniqueDetail.howItWorks.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-sm">
                  <span className="bg-teal-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-slate-600">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <h5 className="font-medium text-emerald-800 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Pros
              </h5>
              <ul className="space-y-1">
                {currentTechniqueDetail.pros.map((pro, idx) => (
                  <li key={idx} className="text-xs text-emerald-700">• {pro}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h5 className="font-medium text-red-800 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Cons
              </h5>
              <ul className="space-y-1">
                {currentTechniqueDetail.cons.map((con, idx) => (
                  <li key={idx} className="text-xs text-red-700">• {con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Before/After Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <ReactECharts option={genderComparisonOption} style={{ height: '400px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Interpretation</h4>
            <p className="text-sm text-slate-600">
              This chart compares male (blue) and female (pink) performance before and after applying 
              <strong> {selectedData.name}</strong>. Darker bars represent the mitigated model. 
              Look for reduced gaps between male and female metrics after mitigation.
            </p>
          </div>
        </div>

        <div className="chart-container">
          <ReactECharts option={biasGapOption} style={{ height: '400px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Interpretation</h4>
            <p className="text-sm text-slate-600">
              The radar chart shows bias gaps (differences between male and female metrics). 
              <strong className="text-red-600"> Red</strong> = Original model, 
              <strong className="text-emerald-600"> Green</strong> = After mitigation. 
              Smaller area means less bias.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Comparison */}
      <div className="card">
        <h3 className="card-header flex items-center">
          <BarChart2 className="w-5 h-5 text-blue-500 mr-2" />
          Detailed Before/After Metrics
        </h3>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Metric</th>
                <th className="text-center" colSpan={2}>Original Model</th>
                <th className="text-center" colSpan={2}>{selectedData.name}</th>
                <th className="text-center">Improvement</th>
              </tr>
              <tr>
                <th></th>
                <th className="text-center text-blue-600">Male</th>
                <th className="text-center text-pink-600">Female</th>
                <th className="text-center text-blue-600">Male</th>
                <th className="text-center text-pink-600">Female</th>
                <th className="text-center">Gap Reduction</th>
              </tr>
            </thead>
            <tbody>
              {['accuracy', 'precision', 'recall', 'f1_score', 'true_positive_rate', 'false_positive_rate'].map(metric => {
                const origM = original.gender_metrics.M[metric];
                const origF = original.gender_metrics.F[metric];
                const mitM = selectedData.gender_metrics.M[metric];
                const mitF = selectedData.gender_metrics.F[metric];
                const origGap = Math.abs(origM - origF);
                const mitGap = Math.abs(mitM - mitF);
                const improvement = origGap > 0 ? ((origGap - mitGap) / origGap * 100).toFixed(1) : 0;
                
                return (
                  <tr key={metric}>
                    <td className="font-medium capitalize">{metric.replace(/_/g, ' ')}</td>
                    <td className="text-center">{(origM * 100).toFixed(1)}%</td>
                    <td className="text-center">{(origF * 100).toFixed(1)}%</td>
                    <td className="text-center">{(mitM * 100).toFixed(1)}%</td>
                    <td className="text-center">{(mitF * 100).toFixed(1)}%</td>
                    <td className="text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        parseFloat(improvement) > 0 ? 'bg-emerald-100 text-emerald-700' :
                        parseFloat(improvement) < 0 ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {parseFloat(improvement) > 0 ? '↓' : parseFloat(improvement) < 0 ? '↑' : '='} {Math.abs(parseFloat(improvement))}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Techniques Comparison */}
      <div className="chart-container">
        <ReactECharts option={allTechniquesOption} style={{ height: '400px' }} />
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-700 mb-2">📊 Techniques Comparison</h4>
          <p className="text-sm text-slate-600">
            This chart compares all mitigation techniques. <strong>Bars</strong> show bias gaps 
            (lower is better for fairness). The <strong>green line</strong> shows overall F1 score 
            (higher is better for accuracy). The goal is to minimize gaps while maintaining high F1.
            <br /><br />
            <strong>Recommendation:</strong> Based on the analysis, <strong>Sample Reweighting</strong> provides 
            the best balance between fairness improvement and maintaining overall model performance, 
            reducing the F1 gap by ~43% while slightly improving overall F1 score.
          </p>
        </div>
      </div>

      {/* Summary & Recommendations */}
      <div className="card bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
        <h3 className="card-header flex items-center text-teal-800">
          <CheckCircle className="w-5 h-5 mr-2" />
          Summary & Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Key Findings</h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Original model shows 25% TPR gap between genders</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Female patients have significantly lower F1 score (66.7% vs 90.3%)</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Sample Reweighting reduces F1 gap from 23.6% to 13.3%</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Threshold Optimization achieves best TPR parity</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Recommended Actions</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-white rounded">
                <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-sm">Deploy model with Sample Reweighting for best balance</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-white rounded">
                <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-sm">Collect more female patient data to address root cause</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-white rounded">
                <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-sm">Monitor subgroup performance in production continuously</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-white rounded">
                <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span className="text-sm">Consider ensemble of mitigation techniques for critical cases</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiasMitigation;
