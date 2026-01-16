import React, { useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Download, 
  FileText, 
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Shield,
  Heart,
  Printer
} from 'lucide-react';

const ExecutiveSummary = ({ modelData, riskRegister }) => {
  const summaryRef = useRef(null);
  const { model_card, model_results, dataset_stats, subgroup_analysis } = modelData;
  const bestModel = model_results['Gradient Boosting'];

  const resolvedRisks = () => {
    if (Array.isArray(riskRegister)) return riskRegister;
    if (riskRegister && typeof riskRegister === 'object') {
      const preferred = model_card?.best_model;
      if (preferred && riskRegister[preferred]) return riskRegister[preferred];
      const [firstKey] = Object.keys(riskRegister);
      if (firstKey) return riskRegister[firstKey];
    }
    return [];
  };

  const riskList = resolvedRisks();

  // Sort risks by RPN
  const sortedRisks = [...riskList]
    .map(r => ({ ...r, rpn: r.impact * r.likelihood }))
    .sort((a, b) => b.rpn - a.rpn)
    .slice(0, 5);

  // Export to PDF
  const exportToPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Helper function
    const addWrappedText = (text, x, y, maxWidth, lineHeight = 5) => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * lineHeight);
    };

    // Header
    pdf.setFillColor(13, 148, 136);
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    pdf.setFontSize(22);
    pdf.setTextColor(255, 255, 255);
    pdf.text('EXECUTIVE SUMMARY', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text('Heart Disease Prediction Model', pageWidth / 2, 23, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    
    yPosition = 45;

    // Model Overview Section
    pdf.setFontSize(14);
    pdf.setTextColor(13, 148, 136);
    pdf.setFont(undefined, 'bold');
    pdf.text('1. MODEL OVERVIEW', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(51, 65, 85);
    pdf.setFont(undefined, 'normal');
    
    const overviewText = `The Heart Disease Prediction Model is an AI-powered clinical decision support tool designed to assess cardiovascular risk. Built using the UCI Heart Disease dataset with ${dataset_stats.total_samples} patient records, the model analyzes 11 clinical features to predict heart disease likelihood.`;
    yPosition = addWrappedText(overviewText, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 8;

    // Performance Metrics Section
    pdf.setFontSize(14);
    pdf.setTextColor(13, 148, 136);
    pdf.setFont(undefined, 'bold');
    pdf.text('2. PERFORMANCE METRICS', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 65, 85);
    
    // Create metrics table
    const metrics = [
      ['Model', 'Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC AUC'],
      ['Logistic Regression', 
        `${(model_results['Logistic Regression'].accuracy * 100).toFixed(1)}%`,
        `${(model_results['Logistic Regression'].precision * 100).toFixed(1)}%`,
        `${(model_results['Logistic Regression'].recall * 100).toFixed(1)}%`,
        `${(model_results['Logistic Regression'].f1_score * 100).toFixed(1)}%`,
        `${(model_results['Logistic Regression'].roc_auc * 100).toFixed(1)}%`
      ],
      ['Random Forest', 
        `${(model_results['Random Forest'].accuracy * 100).toFixed(1)}%`,
        `${(model_results['Random Forest'].precision * 100).toFixed(1)}%`,
        `${(model_results['Random Forest'].recall * 100).toFixed(1)}%`,
        `${(model_results['Random Forest'].f1_score * 100).toFixed(1)}%`,
        `${(model_results['Random Forest'].roc_auc * 100).toFixed(1)}%`
      ],
      ['Gradient Boosting*', 
        `${(model_results['Gradient Boosting'].accuracy * 100).toFixed(1)}%`,
        `${(model_results['Gradient Boosting'].precision * 100).toFixed(1)}%`,
        `${(model_results['Gradient Boosting'].recall * 100).toFixed(1)}%`,
        `${(model_results['Gradient Boosting'].f1_score * 100).toFixed(1)}%`,
        `${(model_results['Gradient Boosting'].roc_auc * 100).toFixed(1)}%`
      ]
    ];

    const colWidths = [40, 25, 25, 22, 25, 25];
    let xPos = margin;
    
    metrics.forEach((row, rowIdx) => {
      xPos = margin;
      row.forEach((cell, colIdx) => {
        if (rowIdx === 0) {
          pdf.setFont(undefined, 'bold');
          pdf.setFillColor(240, 253, 250);
          pdf.rect(xPos - 1, yPosition - 4, colWidths[colIdx], 6, 'F');
        } else if (rowIdx === 3) {
          pdf.setFont(undefined, 'bold');
          pdf.setFillColor(209, 250, 229);
          pdf.rect(xPos - 1, yPosition - 4, colWidths[colIdx], 6, 'F');
        } else {
          pdf.setFont(undefined, 'normal');
        }
        pdf.text(cell, xPos, yPosition);
        xPos += colWidths[colIdx];
      });
      yPosition += 7;
    });

    pdf.setFontSize(8);
    pdf.setFont(undefined, 'italic');
    pdf.text('* Recommended model based on overall performance', margin, yPosition);
    yPosition += 10;

    // Fairness Analysis Section
    pdf.setFontSize(14);
    pdf.setTextColor(13, 148, 136);
    pdf.setFont(undefined, 'bold');
    pdf.text('3. FAIRNESS ANALYSIS', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 65, 85);
    
    const fairnessText = `Gender Analysis: Model accuracy is ${(subgroup_analysis.gender.M.accuracy * 100).toFixed(1)}% for males and ${(subgroup_analysis.gender.F.accuracy * 100).toFixed(1)}% for females. The dataset contains ${dataset_stats.gender_distribution.M} male and ${dataset_stats.gender_distribution.F} female patients, indicating a gender imbalance that requires attention.`;
    yPosition = addWrappedText(fairnessText, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;

    const ageText = `Age Analysis: Performance varies across age groups, with the model validated for ages ${dataset_stats.age_stats.min}-${dataset_stats.age_stats.max} years (mean: ${dataset_stats.age_stats.mean}).`;
    yPosition = addWrappedText(ageText, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 10;

    // Top Risks Section
    pdf.setFontSize(14);
    pdf.setTextColor(13, 148, 136);
    pdf.setFont(undefined, 'bold');
    pdf.text('4. TOP RISKS (by Priority)', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 65, 85);

    sortedRisks.forEach((risk, idx) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      const rpnColor = risk.rpn >= 15 ? [239, 68, 68] : risk.rpn >= 10 ? [245, 158, 11] : [16, 185, 129];
      pdf.setFillColor(...rpnColor);
      pdf.circle(margin + 3, yPosition - 1.5, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text(`${idx + 1}`, margin + 1.5, yPosition);
      
      pdf.setTextColor(51, 65, 85);
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.text(`RPN ${risk.rpn}: `, margin + 10, yPosition);
      pdf.setFont(undefined, 'normal');
      yPosition = addWrappedText(risk.risk.substring(0, 80) + (risk.risk.length > 80 ? '...' : ''), margin + 28, yPosition - 4, pageWidth - margin - 35, 4);
      yPosition += 3;
    });
    yPosition += 5;

    // Ethical Reflection Section
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setTextColor(13, 148, 136);
    pdf.setFont(undefined, 'bold');
    pdf.text('5. ETHICAL REFLECTION', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 65, 85);

    const ethicalText = `This AI model must be deployed responsibly with the following considerations:

• Human Oversight: The model serves as a decision support tool, not a replacement for clinical judgment. All predictions require physician review before clinical action.

• Bias Awareness: Performance disparities across demographic groups necessitate careful monitoring. The model shows different accuracy rates between genders, requiring ongoing fairness audits.

• Patient Safety: False negatives (missed heart disease cases) pose the greatest risk. The model is optimized for high recall to minimize missed diagnoses, with secondary screening protocols for borderline predictions.

• Transparency: Patients should be informed when AI assists in their diagnosis. Prediction confidence levels and limitations must be communicated clearly.

• Continuous Improvement: The model requires regular retraining with new data to prevent drift and maintain accuracy across evolving patient populations.`;

    yPosition = addWrappedText(ethicalText, margin, yPosition, pageWidth - 2 * margin, 5);
    yPosition += 10;

    // Recommendations Section
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setTextColor(13, 148, 136);
    pdf.setFont(undefined, 'bold');
    pdf.text('6. RECOMMENDATIONS', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 65, 85);

    const recommendations = [
      'Deploy Gradient Boosting model as primary prediction engine',
      'Implement mandatory clinician review for all AI-assisted diagnoses',
      'Establish weekly performance monitoring dashboard',
      'Collect additional female patient data to improve gender balance',
      'Conduct quarterly external validation studies'
    ];

    recommendations.forEach((rec, idx) => {
      pdf.text(`${idx + 1}. ${rec}`, margin, yPosition);
      yPosition += 6;
    });

    // Footer
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text('Heart Disease Prediction Model - Executive Summary', margin, pageHeight - 10);
      pdf.text(`Version ${model_card.version}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    pdf.save('executive_summary.pdf');
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Mini performance chart
  const performanceOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: Object.keys(model_results),
      axisLabel: { fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      min: 0.8,
      max: 1,
      axisLabel: { formatter: (val) => `${(val * 100).toFixed(0)}%`, fontSize: 10 }
    },
    series: [
      {
        name: 'Accuracy',
        type: 'bar',
        data: Object.values(model_results).map(m => m.accuracy),
        itemStyle: { color: '#0d9488' }
      },
      {
        name: 'F1 Score',
        type: 'bar',
        data: Object.values(model_results).map(m => m.f1_score),
        itemStyle: { color: '#059669' }
      }
    ]
  };

  // Risk priority chart
  const riskOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: riskList.filter(r => r.impact * r.likelihood >= 15).length, name: 'High', itemStyle: { color: '#ef4444' } },
        { value: riskList.filter(r => r.impact * r.likelihood >= 10 && r.impact * r.likelihood < 15).length, name: 'Medium', itemStyle: { color: '#f59e0b' } },
        { value: riskList.filter(r => r.impact * r.likelihood < 10).length, name: 'Low', itemStyle: { color: '#10b981' } }
      ],
      label: { formatter: '{b}: {c}' }
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Executive Summary</h2>
          <p className="text-slate-500 mt-1">
            One-page overview for stakeholders and decision makers
          </p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button onClick={exportToPDF} className="btn btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Main Summary Content */}
      <div ref={summaryRef} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Heart className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Heart Disease Prediction Model</h1>
                <p className="text-teal-100">Executive Summary | Version {model_card.version}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-teal-100">Generated</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 text-center">
              <Target className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-teal-700">{(bestModel.accuracy * 100).toFixed(1)}%</p>
              <p className="text-sm text-teal-600 font-medium">Best Accuracy</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-700">{(bestModel.roc_auc * 100).toFixed(1)}%</p>
              <p className="text-sm text-blue-600 font-medium">ROC AUC</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center">
              <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-emerald-700">{dataset_stats.total_samples}</p>
              <p className="text-sm text-emerald-600 font-medium">Patients Analyzed</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-700">{riskList.filter(r => r.impact * r.likelihood >= 15).length}</p>
              <p className="text-sm text-amber-600 font-medium">High Priority Risks</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Performance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <CheckCircle className="w-5 h-5 text-teal-600 mr-2" />
                Model Performance
              </h3>
              <ReactECharts option={performanceOption} style={{ height: '200px' }} />
              
              {/* Recommended Model */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm font-medium text-emerald-800 mb-2">✓ Recommended: Gradient Boosting</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="font-bold text-emerald-700">{(bestModel.precision * 100).toFixed(1)}%</p>
                    <p className="text-emerald-600">Precision</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-700">{(bestModel.recall * 100).toFixed(1)}%</p>
                    <p className="text-emerald-600">Recall</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-700">{(bestModel.f1_score * 100).toFixed(1)}%</p>
                    <p className="text-emerald-600">F1 Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <Shield className="w-5 h-5 text-amber-500 mr-2" />
                Risk Priority Distribution
              </h3>
              <ReactECharts option={riskOption} style={{ height: '200px' }} />
              
              {/* Top Risks */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Top 3 Risks by RPN:</p>
                <div className="space-y-2">
                  {sortedRisks.slice(0, 3).map((risk, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold ${
                        risk.rpn >= 15 ? 'bg-red-500' : risk.rpn >= 10 ? 'bg-amber-500' : 'bg-green-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-slate-600 flex-1 truncate">{risk.risk.substring(0, 50)}...</span>
                      <span className="font-bold text-slate-800">RPN: {risk.rpn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fairness Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Fairness Analysis Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-2">Gender Performance</p>
                <div className="flex space-x-4">
                  <div className="flex-1 bg-white rounded p-2 text-center">
                    <p className="text-lg font-bold text-blue-600">{(subgroup_analysis.gender.M.accuracy * 100).toFixed(1)}%</p>
                    <p className="text-xs text-blue-500">Male ({dataset_stats.gender_distribution.M})</p>
                  </div>
                  <div className="flex-1 bg-white rounded p-2 text-center">
                    <p className="text-lg font-bold text-pink-600">{(subgroup_analysis.gender.F.accuracy * 100).toFixed(1)}%</p>
                    <p className="text-xs text-pink-500">Female ({dataset_stats.gender_distribution.F})</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 mb-2">Dataset Demographics</p>
                <div className="bg-white rounded p-2">
                  <p className="text-xs text-blue-600">
                    Age Range: <strong>{dataset_stats.age_stats.min}-{dataset_stats.age_stats.max}</strong> years (Mean: {dataset_stats.age_stats.mean})
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Disease Prevalence: <strong>{((dataset_stats.target_distribution.disease / dataset_stats.total_samples) * 100).toFixed(1)}%</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ethical Reflection */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Ethical Considerations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700">Model is a decision support tool, not a replacement for clinical judgment</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700">Performance varies by demographic - ongoing fairness monitoring required</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700">Patient consent and HIPAA compliance must be maintained</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700">Regular retraining to prevent model drift</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-800 mb-3">Key Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="font-medium text-teal-700 text-sm">1. Deploy</p>
                <p className="text-xs text-slate-600">Use Gradient Boosting as primary model with clinician oversight</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="font-medium text-teal-700 text-sm">2. Monitor</p>
                <p className="text-xs text-slate-600">Weekly performance reviews and monthly fairness audits</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="font-medium text-teal-700 text-sm">3. Improve</p>
                <p className="text-xs text-slate-600">Collect more diverse data, especially female patients</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200">
            <p>Heart Disease Prediction Model | Version {model_card.version} | {model_card.owner}</p>
            <p className="mt-1">For clinical decision support only - not for diagnostic use without physician review</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
