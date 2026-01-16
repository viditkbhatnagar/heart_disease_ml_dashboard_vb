import React from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  Users, 
  Activity, 
  Target, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart
} from 'lucide-react';

const Dashboard = ({ modelData, heartData }) => {
  const { model_results, dataset_stats, subgroup_analysis } = modelData;
  const bestModel = model_results['Gradient Boosting'];

  // Metric cards data
  const metrics = [
    {
      label: 'Model Accuracy',
      value: `${(bestModel.accuracy * 100).toFixed(1)}%`,
      icon: Target,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      description: 'Overall prediction accuracy'
    },
    {
      label: 'F1 Score',
      value: `${(bestModel.f1_score * 100).toFixed(1)}%`,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Harmonic mean of precision & recall'
    },
    {
      label: 'Total Patients',
      value: dataset_stats.total_samples.toLocaleString(),
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Dataset size'
    },
    {
      label: 'ROC AUC',
      value: `${(bestModel.roc_auc * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Area under ROC curve'
    }
  ];

  // Model comparison chart
  const modelComparisonOption = {
    title: {
      text: 'Model Performance Comparison',
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
      data: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
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
      data: Object.keys(model_results),
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      min: 0.7,
      max: 1,
      axisLabel: { formatter: (val) => `${(val * 100).toFixed(0)}%` }
    },
    series: [
      {
        name: 'Accuracy',
        type: 'bar',
        data: Object.values(model_results).map(m => m.accuracy),
        itemStyle: { color: '#0d9488' }
      },
      {
        name: 'Precision',
        type: 'bar',
        data: Object.values(model_results).map(m => m.precision),
        itemStyle: { color: '#2563eb' }
      },
      {
        name: 'Recall',
        type: 'bar',
        data: Object.values(model_results).map(m => m.recall),
        itemStyle: { color: '#7c3aed' }
      },
      {
        name: 'F1 Score',
        type: 'bar',
        data: Object.values(model_results).map(m => m.f1_score),
        itemStyle: { color: '#059669' }
      }
    ]
  };

  // Target distribution pie chart
  const targetDistributionOption = {
    title: {
      text: 'Heart Disease Distribution',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [
      {
        name: 'Distribution',
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
          formatter: '{b}\n{d}%'
        },
        data: [
          { 
            value: dataset_stats.target_distribution.no_disease, 
            name: 'No Disease',
            itemStyle: { color: '#10b981' }
          },
          { 
            value: dataset_stats.target_distribution.disease, 
            name: 'Heart Disease',
            itemStyle: { color: '#ef4444' }
          }
        ]
      }
    ]
  };

  // Gender distribution
  const genderDistributionOption = {
    title: {
      text: 'Gender Distribution',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} patients ({d}%)'
    },
    series: [
      {
        name: 'Gender',
        type: 'pie',
        radius: '65%',
        data: [
          { 
            value: dataset_stats.gender_distribution.M, 
            name: 'Male',
            itemStyle: { color: '#3b82f6' }
          },
          { 
            value: dataset_stats.gender_distribution.F, 
            name: 'Female',
            itemStyle: { color: '#ec4899' }
          }
        ],
        label: {
          formatter: '{b}: {c}'
        }
      }
    ]
  };

  // Confusion matrix for best model
  const confusionMatrixOption = {
    title: {
      text: 'Confusion Matrix (Gradient Boosting)',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const labels = ['True Negative', 'False Positive', 'False Negative', 'True Positive'];
        const idx = params.data[1] * 2 + params.data[0];
        return `${labels[idx]}: ${params.data[2]}`;
      }
    },
    grid: {
      left: '15%',
      right: '10%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: ['Predicted: No', 'Predicted: Yes'],
      splitArea: { show: true },
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'category',
      data: ['Actual: No', 'Actual: Yes'],
      splitArea: { show: true },
      axisLabel: { fontSize: 11 }
    },
    visualMap: {
      min: 0,
      max: Math.max(...bestModel.confusion_matrix.flat()),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#d1fae5', '#059669']
      }
    },
    series: [{
      name: 'Confusion Matrix',
      type: 'heatmap',
      data: [
        [0, 0, bestModel.confusion_matrix[0][0]],
        [1, 0, bestModel.confusion_matrix[0][1]],
        [0, 1, bestModel.confusion_matrix[1][0]],
        [1, 1, bestModel.confusion_matrix[1][1]]
      ],
      label: {
        show: true,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b'
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2
      }
    }]
  };

  // Age distribution histogram
  const ageData = heartData.map(d => d.Age);
  const ageBins = [28, 35, 40, 45, 50, 55, 60, 65, 70, 77];
  const ageHistogram = [];
  for (let i = 0; i < ageBins.length - 1; i++) {
    const count = ageData.filter(age => age >= ageBins[i] && age < ageBins[i + 1]).length;
    ageHistogram.push(count);
  }

  const ageDistributionOption = {
    title: {
      text: 'Age Distribution',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => `Age ${params[0].name}: ${params[0].value} patients`
    },
    xAxis: {
      type: 'category',
      data: ageBins.slice(0, -1).map((b, i) => `${b}-${ageBins[i + 1]}`),
      axisLabel: { fontSize: 10, rotate: 45 }
    },
    yAxis: {
      type: 'value',
      name: 'Count'
    },
    series: [{
      data: ageHistogram,
      type: 'bar',
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
    }]
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">
            Real-time insights from the Heart Disease Prediction Model
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Model Status: Active</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="metric-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="metric-label">{metric.label}</p>
                  <p className="metric-value mt-1">{metric.value}</p>
                  <p className="text-xs text-slate-400 mt-2">{metric.description}</p>
                </div>
                <div className={`${metric.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <ReactECharts option={modelComparisonOption} style={{ height: '350px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Interpretation</h4>
            <p className="text-sm text-slate-600">
              This chart compares performance across three ML models. <strong>Gradient Boosting</strong> achieves 
              the highest overall accuracy ({(model_results['Gradient Boosting'].accuracy * 100).toFixed(1)}%), 
              while <strong>Logistic Regression</strong> shows the best recall ({(model_results['Logistic Regression'].recall * 100).toFixed(1)}%), 
              making it better at identifying actual heart disease cases.
            </p>
          </div>
        </div>

        <div className="chart-container">
          <ReactECharts option={confusionMatrixOption} style={{ height: '350px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Interpretation</h4>
            <p className="text-sm text-slate-600">
              The confusion matrix shows prediction outcomes. 
              <strong> True Positives</strong> (bottom-right) correctly identified heart disease cases, 
              while <strong>False Negatives</strong> (bottom-left) are missed cases that require clinical attention.
              In healthcare, minimizing false negatives is critical.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="chart-container">
          <ReactECharts option={targetDistributionOption} style={{ height: '300px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Interpretation</h4>
            <p className="text-sm text-slate-600">
              The dataset is slightly imbalanced with {dataset_stats.target_distribution.disease} patients 
              ({((dataset_stats.target_distribution.disease / dataset_stats.total_samples) * 100).toFixed(1)}%) 
              having heart disease. This prevalence rate guides model calibration.
            </p>
          </div>
        </div>

        <div className="chart-container">
          <ReactECharts option={genderDistributionOption} style={{ height: '300px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Interpretation</h4>
            <p className="text-sm text-slate-600">
              Male patients ({dataset_stats.gender_distribution.M}) significantly outnumber 
              females ({dataset_stats.gender_distribution.F}). This imbalance may affect 
              model performance across genders and requires fairness monitoring.
            </p>
          </div>
        </div>

        <div className="chart-container">
          <ReactECharts option={ageDistributionOption} style={{ height: '300px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Interpretation</h4>
            <p className="text-sm text-slate-600">
              Age ranges from {dataset_stats.age_stats.min} to {dataset_stats.age_stats.max} years 
              (mean: {dataset_stats.age_stats.mean}). The model is primarily validated for 
              middle-aged to elderly patients.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="card">
        <h3 className="card-header flex items-center">
          <Heart className="w-5 h-5 text-red-500 mr-2" />
          Dataset Quick Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{dataset_stats.total_samples}</p>
            <p className="text-sm text-slate-500">Total Samples</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{dataset_stats.features.length}</p>
            <p className="text-sm text-slate-500">Features</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{dataset_stats.train_samples}</p>
            <p className="text-sm text-slate-500">Training Samples</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{dataset_stats.test_samples}</p>
            <p className="text-sm text-slate-500">Test Samples</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
