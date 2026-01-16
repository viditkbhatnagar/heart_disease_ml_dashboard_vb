import React, { useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Download, 
  FileText, 
  Users, 
  Database, 
  Target,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  Info
} from 'lucide-react';

const ModelCard = ({ modelData }) => {
  const { model_card, model_results, subgroup_analysis } = modelData;
  const cardRef = useRef(null);

  // Export to PDF
  const exportToPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addWrappedText = (text, x, y, maxWidth, lineHeight = 5) => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * lineHeight);
    };

    // Title
    pdf.setFontSize(20);
    pdf.setTextColor(13, 148, 136);
    pdf.text('MODEL CARD', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Model Name
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.text(model_card.model_name, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Version and Date
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Version ${model_card.version} | Last Updated: ${model_card.last_updated}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Sections
    const sections = [
      { title: 'Purpose', content: model_card.purpose },
      { title: 'Owner / Team', content: model_card.owner },
      { title: 'Intended Users', content: model_card.intended_users },
      { title: 'Training Data', content: model_card.training_data },
      { title: 'Data Sources', content: model_card.data_sources },
    ];

    pdf.setFontSize(11);
    sections.forEach(section => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setTextColor(13, 148, 136);
      pdf.setFont(undefined, 'bold');
      pdf.text(section.title, margin, yPosition);
      yPosition += 6;
      
      pdf.setTextColor(51, 65, 85);
      pdf.setFont(undefined, 'normal');
      yPosition = addWrappedText(section.content, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 8;
    });

    // Performance Metrics
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setTextColor(13, 148, 136);
    pdf.setFont(undefined, 'bold');
    pdf.text('Performance Metrics (Best Model: Gradient Boosting)', margin, yPosition);
    yPosition += 8;

    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 65, 85);
    const metrics = model_card.performance_summary;
    const metricsText = `Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%  |  Precision: ${(metrics.precision * 100).toFixed(1)}%  |  Recall: ${(metrics.recall * 100).toFixed(1)}%  |  F1 Score: ${(metrics.f1_score * 100).toFixed(1)}%  |  ROC AUC: ${(metrics.roc_auc * 100).toFixed(1)}%`;
    yPosition = addWrappedText(metricsText, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 10;

    // Ethical Considerations
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setTextColor(13, 148, 136);
    pdf.setFont(undefined, 'bold');
    pdf.text('Ethical Considerations', margin, yPosition);
    yPosition += 6;
    
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 65, 85);
    model_card.ethical_considerations.forEach((item, i) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      yPosition = addWrappedText(`• ${item}`, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 2;
    });
    yPosition += 8;

    // Limitations
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setTextColor(13, 148, 136);
    pdf.setFont(undefined, 'bold');
    pdf.text('Limitations', margin, yPosition);
    yPosition += 6;
    
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 65, 85);
    model_card.limitations.forEach((item, i) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      yPosition = addWrappedText(`• ${item}`, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 2;
    });
    yPosition += 8;

    // Monitoring Plan
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setTextColor(13, 148, 136);
    pdf.setFont(undefined, 'bold');
    pdf.text('Monitoring Plan', margin, yPosition);
    yPosition += 6;
    
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 65, 85);
    model_card.monitoring_plan.forEach((item, i) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      yPosition = addWrappedText(`• ${item}`, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 2;
    });

    // Footer
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text('Heart Disease Prediction Model Card', margin, pageHeight - 10);
    }

    pdf.save('model_card.pdf');
  };

  // Performance radar chart
  const performanceRadarOption = {
    title: {
      text: 'Model Performance Overview',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {},
    legend: {
      data: Object.keys(model_results),
      bottom: 0
    },
    radar: {
      indicator: [
        { name: 'Accuracy', max: 1 },
        { name: 'Precision', max: 1 },
        { name: 'Recall', max: 1 },
        { name: 'F1 Score', max: 1 },
        { name: 'ROC AUC', max: 1 }
      ],
      center: ['50%', '55%'],
      radius: '60%'
    },
    series: [{
      type: 'radar',
      data: Object.entries(model_results).map(([name, metrics]) => ({
        value: [metrics.accuracy, metrics.precision, metrics.recall, metrics.f1_score, metrics.roc_auc],
        name,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.2 }
      }))
    }]
  };

  // Fairness analysis chart
  const fairnessGenderOption = {
    title: {
      text: 'Performance by Gender',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${(p.value * 100).toFixed(1)}%<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: ['Male', 'Female']
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      axisLabel: { formatter: (val) => `${(val * 100).toFixed(0)}%` }
    },
    series: [
      {
        name: 'Accuracy',
        type: 'bar',
        data: [subgroup_analysis.gender.M.accuracy, subgroup_analysis.gender.F.accuracy],
        itemStyle: { color: '#0d9488' }
      },
      {
        name: 'Precision',
        type: 'bar',
        data: [subgroup_analysis.gender.M.precision, subgroup_analysis.gender.F.precision],
        itemStyle: { color: '#2563eb' }
      },
      {
        name: 'Recall',
        type: 'bar',
        data: [subgroup_analysis.gender.M.recall, subgroup_analysis.gender.F.recall],
        itemStyle: { color: '#7c3aed' }
      },
      {
        name: 'F1 Score',
        type: 'bar',
        data: [subgroup_analysis.gender.M.f1_score, subgroup_analysis.gender.F.f1_score],
        itemStyle: { color: '#059669' }
      }
    ]
  };

  // Age group analysis chart
  const ageGroups = Object.keys(subgroup_analysis.age);
  const fairnessAgeOption = {
    title: {
      text: 'Performance by Age Group',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = `<strong>Age ${params[0].axisValue}</strong><br/>`;
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${(p.value * 100).toFixed(1)}%<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Accuracy', 'F1 Score', 'Disease Rate'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: ageGroups
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      axisLabel: { formatter: (val) => `${(val * 100).toFixed(0)}%` }
    },
    series: [
      {
        name: 'Accuracy',
        type: 'bar',
        data: ageGroups.map(g => subgroup_analysis.age[g].accuracy),
        itemStyle: { color: '#0d9488' }
      },
      {
        name: 'F1 Score',
        type: 'bar',
        data: ageGroups.map(g => subgroup_analysis.age[g].f1_score),
        itemStyle: { color: '#059669' }
      },
      {
        name: 'Disease Rate',
        type: 'line',
        data: ageGroups.map(g => subgroup_analysis.age[g].disease_rate),
        itemStyle: { color: '#ef4444' },
        lineStyle: { width: 3 }
      }
    ]
  };

  return (
    <div className="space-y-6" ref={cardRef}>
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Model Card</h2>
          <p className="text-slate-500 mt-1">
            Comprehensive documentation of the heart disease prediction model
          </p>
        </div>
        <button onClick={exportToPDF} className="btn btn-primary">
          <Download className="w-4 h-4 mr-2" />
          Export as PDF
        </button>
      </div>

      {/* Model Header Card */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-500 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold">{model_card.model_name}</h3>
            <p className="text-teal-100 mt-1">Version {model_card.version}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-teal-100">Last Updated</p>
            <p className="font-semibold">{model_card.last_updated}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{model_card.owner}</span>
          </div>
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-teal-100 p-2 rounded-lg">
              <Target className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Purpose</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">{model_card.purpose}</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Intended Users</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">{model_card.intended_users}</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Training Data</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">{model_card.training_data}</p>
          <p className="text-sm text-slate-500 mt-2">{model_card.data_sources}</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Best Model</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{model_card.best_model}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-50 p-2 rounded">
              <span className="text-slate-500">Accuracy:</span>
              <span className="font-semibold ml-1">{(model_card.performance_summary.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <span className="text-slate-500">F1:</span>
              <span className="font-semibold ml-1">{(model_card.performance_summary.f1_score * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Chart */}
      <div className="chart-container">
        <ReactECharts option={performanceRadarOption} style={{ height: '400px' }} />
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-700 mb-2">📊 Performance Summary</h4>
          <p className="text-sm text-slate-600">
            All three models achieve strong performance. <strong>Gradient Boosting</strong> leads in 
            overall accuracy and ROC AUC, making it the recommended choice. <strong>Logistic Regression</strong> 
            has the highest recall, which is valuable in clinical settings where missing positive cases 
            has severe consequences.
          </p>
        </div>
      </div>

      {/* Fairness Analysis */}
      <div className="card">
        <h3 className="card-header flex items-center">
          <Shield className="w-5 h-5 text-teal-600 mr-2" />
          Fairness & Bias Analysis
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ReactECharts option={fairnessGenderOption} style={{ height: '350px' }} />
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-700 mb-2">📊 Gender Analysis</h4>
              <p className="text-sm text-slate-600">
                Model shows <strong>higher accuracy for females ({(subgroup_analysis.gender.F.accuracy * 100).toFixed(1)}%)</strong> 
                compared to males ({(subgroup_analysis.gender.M.accuracy * 100).toFixed(1)}%). However, 
                F1 score is significantly lower for females due to the dataset imbalance. 
                <strong className="text-amber-600"> Recommendation:</strong> Collect more female patient data 
                to improve balanced performance.
              </p>
            </div>
          </div>
          
          <div>
            <ReactECharts option={fairnessAgeOption} style={{ height: '350px' }} />
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-700 mb-2">📊 Age Group Analysis</h4>
              <p className="text-sm text-slate-600">
                The model performs best on younger (&lt;40) and older (70+) age groups, with slightly 
                lower performance in the 40-70 range. The <strong>red line shows disease prevalence</strong>, 
                indicating higher risk in middle-aged patients. Age-specific calibration may improve accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ethical Considerations */}
      <div className="card">
        <h3 className="card-header flex items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
          Ethical Considerations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {model_card.ethical_considerations.map((item, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="card">
        <h3 className="card-header flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          Limitations
        </h3>
        <div className="space-y-3">
          {model_card.limitations.map((item, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <span className="bg-red-200 text-red-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {index + 1}
              </span>
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monitoring Plan */}
      <div className="card">
        <h3 className="card-header flex items-center">
          <Clock className="w-5 h-5 text-blue-500 mr-2" />
          Monitoring Plan
        </h3>
        <div className="space-y-3">
          {model_card.monitoring_plan.map((item, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
