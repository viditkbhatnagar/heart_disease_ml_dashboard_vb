import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  TrendingUp, 
  BarChart2, 
  PieChart,
  Layers
} from 'lucide-react';

const Analytics = ({ modelData, heartData }) => {
  const { model_results, subgroup_analysis, dataset_stats } = modelData;

  // ROC Curves comparison
  const rocCurveOption = {
    title: {
      text: 'ROC Curves Comparison',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return params.map(p => `${p.seriesName}<br/>FPR: ${p.data[0].toFixed(3)}, TPR: ${p.data[1].toFixed(3)}`).join('<br/>');
      }
    },
    legend: {
      data: Object.keys(model_results).map(name => `${name} (AUC: ${model_results[name].roc_auc.toFixed(3)})`),
      bottom: 0
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '20%'
    },
    xAxis: {
      type: 'value',
      name: 'False Positive Rate',
      min: 0,
      max: 1
    },
    yAxis: {
      type: 'value',
      name: 'True Positive Rate',
      min: 0,
      max: 1
    },
    series: [
      {
        name: `Logistic Regression (AUC: ${model_results['Logistic Regression'].roc_auc.toFixed(3)})`,
        type: 'line',
        smooth: true,
        data: model_results['Logistic Regression'].roc_curve.fpr.map((fpr, i) => [fpr, model_results['Logistic Regression'].roc_curve.tpr[i]]),
        lineStyle: { color: '#3b82f6', width: 2 },
        itemStyle: { color: '#3b82f6' },
        showSymbol: false
      },
      {
        name: `Random Forest (AUC: ${model_results['Random Forest'].roc_auc.toFixed(3)})`,
        type: 'line',
        smooth: true,
        data: model_results['Random Forest'].roc_curve.fpr.map((fpr, i) => [fpr, model_results['Random Forest'].roc_curve.tpr[i]]),
        lineStyle: { color: '#10b981', width: 2 },
        itemStyle: { color: '#10b981' },
        showSymbol: false
      },
      {
        name: `Gradient Boosting (AUC: ${model_results['Gradient Boosting'].roc_auc.toFixed(3)})`,
        type: 'line',
        smooth: true,
        data: model_results['Gradient Boosting'].roc_curve.fpr.map((fpr, i) => [fpr, model_results['Gradient Boosting'].roc_curve.tpr[i]]),
        lineStyle: { color: '#8b5cf6', width: 2 },
        itemStyle: { color: '#8b5cf6' },
        showSymbol: false
      },
      {
        name: 'Random Guess',
        type: 'line',
        data: [[0, 0], [1, 1]],
        lineStyle: { color: '#94a3b8', type: 'dashed', width: 1 },
        showSymbol: false
      }
    ]
  };

  // Feature importance chart
  const featureImportance = model_results['Random Forest'].feature_importance;
  const sortedFeatures = Object.entries(featureImportance).sort((a, b) => b[1] - a[1]);

  const featureImportanceOption = {
    title: {
      text: 'Feature Importance (Random Forest)',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => `${params[0].name}: ${(params[0].value * 100).toFixed(2)}%`
    },
    grid: {
      left: '20%',
      right: '10%',
      top: '15%',
      bottom: '10%'
    },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (val) => `${(val * 100).toFixed(0)}%` }
    },
    yAxis: {
      type: 'category',
      data: sortedFeatures.map(f => f[0]).reverse(),
      axisLabel: { fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: sortedFeatures.map(f => f[1]).reverse(),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#0d9488' },
            { offset: 1, color: '#5eead4' }
          ]
        },
        borderRadius: [0, 4, 4, 0]
      },
      label: {
        show: true,
        position: 'right',
        formatter: (params) => `${(params.value * 100).toFixed(1)}%`,
        fontSize: 10
      }
    }]
  };

  // Precision-Recall curves
  const prCurveOption = {
    title: {
      text: 'Precision-Recall Curves',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: Object.keys(model_results),
      bottom: 0
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      type: 'value',
      name: 'Recall',
      min: 0,
      max: 1
    },
    yAxis: {
      type: 'value',
      name: 'Precision',
      min: 0,
      max: 1
    },
    series: Object.entries(model_results).map(([name, data], index) => ({
      name,
      type: 'line',
      smooth: true,
      data: data.pr_curve.recall.map((r, i) => [r, data.pr_curve.precision[i]]),
      lineStyle: { width: 2 },
      showSymbol: false
    }))
  };

  // Chest pain type distribution
  const chestPainData = useMemo(() => {
    const counts = {};
    heartData.forEach(d => {
      const key = `${d.ChestPainType}-${d.HeartDisease}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [heartData]);

  const chestPainTypes = ['ATA', 'NAP', 'ASY', 'TA'];
  const chestPainLabels = {
    'ATA': 'Atypical Angina',
    'NAP': 'Non-Anginal Pain',
    'ASY': 'Asymptomatic',
    'TA': 'Typical Angina'
  };

  const chestPainOption = {
    title: {
      text: 'Heart Disease by Chest Pain Type',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['No Disease', 'Heart Disease'],
      bottom: 0
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: chestPainTypes.map(t => chestPainLabels[t])
    },
    yAxis: {
      type: 'value',
      name: 'Count'
    },
    series: [
      {
        name: 'No Disease',
        type: 'bar',
        stack: 'total',
        data: chestPainTypes.map(t => chestPainData[`${t}-0`] || 0),
        itemStyle: { color: '#10b981' }
      },
      {
        name: 'Heart Disease',
        type: 'bar',
        stack: 'total',
        data: chestPainTypes.map(t => chestPainData[`${t}-1`] || 0),
        itemStyle: { color: '#ef4444' }
      }
    ]
  };

  // Correlation with heart disease
  const correlationData = useMemo(() => {
    const numericFeatures = ['Age', 'RestingBP', 'Cholesterol', 'MaxHR', 'Oldpeak'];
    const correlations = {};
    
    numericFeatures.forEach(feature => {
      const diseased = heartData.filter(d => d.HeartDisease === 1).map(d => d[feature]);
      const healthy = heartData.filter(d => d.HeartDisease === 0).map(d => d[feature]);
      
      const avgDiseased = diseased.reduce((a, b) => a + b, 0) / diseased.length;
      const avgHealthy = healthy.reduce((a, b) => a + b, 0) / healthy.length;
      
      correlations[feature] = {
        diseased: avgDiseased,
        healthy: avgHealthy,
        diff: ((avgDiseased - avgHealthy) / avgHealthy * 100).toFixed(1)
      };
    });
    
    return correlations;
  }, [heartData]);

  const correlationOption = {
    title: {
      text: 'Average Feature Values by Heart Disease Status',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['Healthy', 'Heart Disease'],
      bottom: 0
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: Object.keys(correlationData)
    },
    yAxis: {
      type: 'value',
      name: 'Value'
    },
    series: [
      {
        name: 'Healthy',
        type: 'bar',
        data: Object.values(correlationData).map(d => d.healthy.toFixed(1)),
        itemStyle: { color: '#10b981' }
      },
      {
        name: 'Heart Disease',
        type: 'bar',
        data: Object.values(correlationData).map(d => d.diseased.toFixed(1)),
        itemStyle: { color: '#ef4444' }
      }
    ]
  };

  // Model metrics comparison table
  const metricsTableOption = {
    title: {
      text: 'Detailed Metrics Comparison',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
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
      radius: '65%'
    },
    series: [{
      type: 'radar',
      data: Object.entries(model_results).map(([name, metrics], idx) => ({
        value: [metrics.accuracy, metrics.precision, metrics.recall, metrics.f1_score, metrics.roc_auc],
        name,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.2 }
      }))
    }]
  };

  // ECG Type Distribution
  const ecgData = useMemo(() => {
    const counts = {};
    heartData.forEach(d => {
      counts[d.RestingECG] = (counts[d.RestingECG] || 0) + 1;
    });
    return counts;
  }, [heartData]);

  const ecgOption = {
    title: {
      text: 'Resting ECG Distribution',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: '60%',
      data: Object.entries(ecgData).map(([name, value]) => ({
        name: name === 'Normal' ? 'Normal' : name === 'ST' ? 'ST-T Abnormality' : 'LV Hypertrophy',
        value
      })),
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        formatter: '{b}\n{d}%'
      }
    }]
  };

  // Max Heart Rate vs Age scatter
  const heartRateScatterOption = {
    title: {
      text: 'Max Heart Rate vs Age',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      formatter: (params) => {
        return `Age: ${params.data[0]}<br/>Max HR: ${params.data[1]}<br/>${params.data[2] === 1 ? 'Heart Disease' : 'Healthy'}`;
      }
    },
    legend: {
      data: ['Healthy', 'Heart Disease'],
      bottom: 0
    },
    xAxis: {
      type: 'value',
      name: 'Age',
      min: 25,
      max: 80
    },
    yAxis: {
      type: 'value',
      name: 'Max Heart Rate',
      min: 60,
      max: 210
    },
    series: [
      {
        name: 'Healthy',
        type: 'scatter',
        data: heartData.filter(d => d.HeartDisease === 0).map(d => [d.Age, d.MaxHR, 0]),
        symbolSize: 8,
        itemStyle: { color: '#10b981', opacity: 0.6 }
      },
      {
        name: 'Heart Disease',
        type: 'scatter',
        data: heartData.filter(d => d.HeartDisease === 1).map(d => [d.Age, d.MaxHR, 1]),
        symbolSize: 8,
        itemStyle: { color: '#ef4444', opacity: 0.6 }
      }
    ]
  };

  // ST Slope distribution
  const stSlopeData = useMemo(() => {
    const counts = { Up: [0, 0], Flat: [0, 0], Down: [0, 0] };
    heartData.forEach(d => {
      counts[d.ST_Slope][d.HeartDisease]++;
    });
    return counts;
  }, [heartData]);

  const stSlopeOption = {
    title: {
      text: 'ST Slope and Heart Disease',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['Healthy', 'Heart Disease'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: ['Upsloping', 'Flat', 'Downsloping']
    },
    yAxis: {
      type: 'value',
      name: 'Count'
    },
    series: [
      {
        name: 'Healthy',
        type: 'bar',
        data: [stSlopeData.Up[0], stSlopeData.Flat[0], stSlopeData.Down[0]],
        itemStyle: { color: '#10b981' }
      },
      {
        name: 'Heart Disease',
        type: 'bar',
        data: [stSlopeData.Up[1], stSlopeData.Flat[1], stSlopeData.Down[1]],
        itemStyle: { color: '#ef4444' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Advanced Analytics</h2>
        <p className="text-slate-500 mt-1">
          Deep dive into model performance and data insights
        </p>
      </div>

      {/* ROC & PR Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <ReactECharts option={rocCurveOption} style={{ height: '400px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 ROC Curve Interpretation</h4>
            <p className="text-sm text-slate-600">
              ROC curves plot True Positive Rate against False Positive Rate at various thresholds. 
              A model with higher AUC (Area Under Curve) performs better. The <strong>diagonal line</strong> 
              represents random guessing (AUC = 0.5). <strong>Gradient Boosting</strong> shows the best 
              discrimination ability with AUC of {model_results['Gradient Boosting'].roc_auc.toFixed(3)}.
            </p>
          </div>
        </div>

        <div className="chart-container">
          <ReactECharts option={prCurveOption} style={{ height: '400px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Precision-Recall Interpretation</h4>
            <p className="text-sm text-slate-600">
              Precision-Recall curves are especially useful for imbalanced datasets. High precision 
              means fewer false positives, while high recall means fewer missed cases. The trade-off 
              between these metrics should be considered based on clinical requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Importance & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <ReactECharts option={featureImportanceOption} style={{ height: '450px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Feature Importance</h4>
            <p className="text-sm text-slate-600">
              <strong>ST_Slope</strong> and <strong>Oldpeak</strong> (ST depression) are the most 
              predictive features, highlighting the importance of ECG readings. <strong>Chest pain type</strong> 
              and <strong>exercise-induced angina</strong> also significantly contribute to predictions.
            </p>
          </div>
        </div>

        <div className="chart-container">
          <ReactECharts option={metricsTableOption} style={{ height: '450px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Model Comparison</h4>
            <p className="text-sm text-slate-600">
              This radar chart provides a holistic view of model performance. Notice how 
              <strong> Logistic Regression</strong> excels in recall but has lower precision, 
              while <strong>Random Forest</strong> and <strong>Gradient Boosting</strong> show 
              more balanced performance profiles.
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <ReactECharts option={chestPainOption} style={{ height: '400px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Chest Pain Analysis</h4>
            <p className="text-sm text-slate-600">
              <strong>Asymptomatic (ASY)</strong> patients show the highest heart disease rate, 
              which is clinically significant - many heart disease patients don't experience 
              typical chest pain. This underscores the importance of screening even without 
              obvious symptoms.
            </p>
          </div>
        </div>

        <div className="chart-container">
          <ReactECharts option={stSlopeOption} style={{ height: '400px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 ST Slope Analysis</h4>
            <p className="text-sm text-slate-600">
              <strong>Flat and downsloping ST segments</strong> during exercise are strongly 
              associated with heart disease. <strong>Upsloping</strong> ST segments are 
              predominantly found in healthy patients, making this feature highly discriminative.
            </p>
          </div>
        </div>
      </div>

      {/* Scatter and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <ReactECharts option={heartRateScatterOption} style={{ height: '400px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Heart Rate vs Age</h4>
            <p className="text-sm text-slate-600">
              Heart disease patients (red) tend to have <strong>lower maximum heart rates</strong> 
              compared to healthy individuals (green) of the same age. This reduced exercise 
              capacity is a key clinical indicator that the model learns to identify.
            </p>
          </div>
        </div>

        <div className="chart-container">
          <ReactECharts option={correlationOption} style={{ height: '400px' }} />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Feature Comparison</h4>
            <p className="text-sm text-slate-600">
              Heart disease patients show notably <strong>higher Oldpeak values</strong> (ST depression) 
              and <strong>lower MaxHR</strong>. Interestingly, cholesterol levels don't show a strong 
              difference between groups in this dataset, suggesting other factors may be more predictive.
            </p>
          </div>
        </div>
      </div>

      {/* ECG Distribution */}
      <div className="chart-container">
        <ReactECharts option={ecgOption} style={{ height: '350px' }} />
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-700 mb-2">📊 ECG Distribution</h4>
          <p className="text-sm text-slate-600">
            Most patients have <strong>Normal</strong> resting ECG readings. However, abnormal 
            readings like <strong>ST-T wave abnormality</strong> and <strong>Left Ventricular 
            Hypertrophy (LVH)</strong> provide additional diagnostic value when combined with 
            exercise test results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
