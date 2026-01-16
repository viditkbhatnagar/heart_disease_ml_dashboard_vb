import React, { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as tf from '@tensorflow/tfjs';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Cpu, 
  Zap,
  CheckCircle,
  Clock,
  Layers,
  GitBranch
} from 'lucide-react';

const ModelTraining = ({ modelData, heartData }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [selectedModel, setSelectedModel] = useState('neural_network');
  const [epochs, setEpochs] = useState(50);
  const [learningRate, setLearningRate] = useState(0.01);
  const [trainingHistory, setTrainingHistory] = useState({ loss: [], accuracy: [], val_loss: [], val_accuracy: [] });
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [finalMetrics, setFinalMetrics] = useState(null);
  const [trainingTime, setTrainingTime] = useState(0);
  const modelRef = useRef(null);
  const chartRef = useRef(null);

  const { tf_data } = modelData;

  // Prepare data tensors
  const prepareData = () => {
    const X_train = tf.tensor2d(tf_data.X_train);
    const y_train = tf.tensor2d(tf_data.y_train.map(y => [y]));
    const X_test = tf.tensor2d(tf_data.X_test);
    const y_test = tf.tensor2d(tf_data.y_test.map(y => [y]));
    return { X_train, y_train, X_test, y_test };
  };

  // Create Neural Network model
  const createNeuralNetwork = () => {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
      inputShape: [11],
      kernelInitializer: 'glorotUniform'
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu',
      kernelInitializer: 'glorotUniform'
    }));
    
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.dense({
      units: 8,
      activation: 'relu',
      kernelInitializer: 'glorotUniform'
    }));
    
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));

    return model;
  };

  // Create Logistic Regression (single layer)
  const createLogisticRegression = () => {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
      inputShape: [11],
      kernelInitializer: 'glorotUniform'
    }));

    return model;
  };

  // Train model
  const trainModel = async () => {
    setIsTraining(true);
    setTrainingComplete(false);
    setTrainingHistory({ loss: [], accuracy: [], val_loss: [], val_accuracy: [] });
    setCurrentEpoch(0);
    setFinalMetrics(null);

    const startTime = Date.now();
    const { X_train, y_train, X_test, y_test } = prepareData();

    // Create model based on selection
    const model = selectedModel === 'neural_network' 
      ? createNeuralNetwork() 
      : createLogisticRegression();

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    modelRef.current = model;

    try {
      await model.fit(X_train, y_train, {
        epochs: epochs,
        batchSize: 32,
        validationData: [X_test, y_test],
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            setCurrentEpoch(epoch + 1);
            setTrainingHistory(prev => ({
              loss: [...prev.loss, logs.loss],
              accuracy: [...prev.accuracy, logs.acc],
              val_loss: [...prev.val_loss, logs.val_loss],
              val_accuracy: [...prev.val_accuracy, logs.val_acc]
            }));
          }
        }
      });

      // Calculate final metrics
      const predictions = model.predict(X_test);
      const predArray = await predictions.data();
      const yTestArray = tf_data.y_test;

      const threshold = 0.5;
      let tp = 0, tn = 0, fp = 0, fn = 0;
      
      predArray.forEach((pred, i) => {
        const predicted = pred >= threshold ? 1 : 0;
        const actual = yTestArray[i];
        
        if (predicted === 1 && actual === 1) tp++;
        else if (predicted === 0 && actual === 0) tn++;
        else if (predicted === 1 && actual === 0) fp++;
        else if (predicted === 0 && actual === 1) fn++;
      });

      const accuracy = (tp + tn) / (tp + tn + fp + fn);
      const precision = tp / (tp + fp) || 0;
      const recall = tp / (tp + fn) || 0;
      const f1 = 2 * (precision * recall) / (precision + recall) || 0;

      setFinalMetrics({
        accuracy,
        precision,
        recall,
        f1_score: f1,
        confusion_matrix: [[tn, fp], [fn, tp]]
      });

      setTrainingTime((Date.now() - startTime) / 1000);
      setTrainingComplete(true);

      // Cleanup tensors
      X_train.dispose();
      y_train.dispose();
      X_test.dispose();
      y_test.dispose();
      predictions.dispose();

    } catch (error) {
      console.error('Training error:', error);
    }

    setIsTraining(false);
  };

  // Reset training
  const resetTraining = () => {
    if (modelRef.current) {
      modelRef.current.dispose();
      modelRef.current = null;
    }
    setTrainingHistory({ loss: [], accuracy: [], val_loss: [], val_accuracy: [] });
    setCurrentEpoch(0);
    setFinalMetrics(null);
    setTrainingComplete(false);
    setTrainingTime(0);
  };

  // Training progress chart
  const trainingChartOption = {
    title: {
      text: 'Training Progress',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = `Epoch ${params[0].axisValue}<br/>`;
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(4)}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Training Loss', 'Validation Loss', 'Training Accuracy', 'Validation Accuracy'],
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
      data: trainingHistory.loss.map((_, i) => i + 1),
      name: 'Epoch'
    },
    yAxis: [
      {
        type: 'value',
        name: 'Loss',
        position: 'left',
        min: 0
      },
      {
        type: 'value',
        name: 'Accuracy',
        position: 'right',
        min: 0,
        max: 1,
        axisLabel: { formatter: (val) => `${(val * 100).toFixed(0)}%` }
      }
    ],
    series: [
      {
        name: 'Training Loss',
        type: 'line',
        data: trainingHistory.loss,
        smooth: true,
        itemStyle: { color: '#ef4444' },
        yAxisIndex: 0
      },
      {
        name: 'Validation Loss',
        type: 'line',
        data: trainingHistory.val_loss,
        smooth: true,
        itemStyle: { color: '#f97316' },
        lineStyle: { type: 'dashed' },
        yAxisIndex: 0
      },
      {
        name: 'Training Accuracy',
        type: 'line',
        data: trainingHistory.accuracy,
        smooth: true,
        itemStyle: { color: '#10b981' },
        yAxisIndex: 1
      },
      {
        name: 'Validation Accuracy',
        type: 'line',
        data: trainingHistory.val_accuracy,
        smooth: true,
        itemStyle: { color: '#0d9488' },
        lineStyle: { type: 'dashed' },
        yAxisIndex: 1
      }
    ]
  };

  // Pre-computed results comparison
  const preComputedOption = {
    title: {
      text: 'Pre-computed Model Results (Python)',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1e293b' }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC AUC'],
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
      data: [
        {
          value: [
            modelData.model_results['Logistic Regression'].accuracy,
            modelData.model_results['Logistic Regression'].precision,
            modelData.model_results['Logistic Regression'].recall,
            modelData.model_results['Logistic Regression'].f1_score,
            modelData.model_results['Logistic Regression'].roc_auc
          ],
          name: 'Logistic Regression',
          lineStyle: { color: '#3b82f6' },
          areaStyle: { color: 'rgba(59, 130, 246, 0.2)' }
        },
        {
          value: [
            modelData.model_results['Random Forest'].accuracy,
            modelData.model_results['Random Forest'].precision,
            modelData.model_results['Random Forest'].recall,
            modelData.model_results['Random Forest'].f1_score,
            modelData.model_results['Random Forest'].roc_auc
          ],
          name: 'Random Forest',
          lineStyle: { color: '#10b981' },
          areaStyle: { color: 'rgba(16, 185, 129, 0.2)' }
        },
        {
          value: [
            modelData.model_results['Gradient Boosting'].accuracy,
            modelData.model_results['Gradient Boosting'].precision,
            modelData.model_results['Gradient Boosting'].recall,
            modelData.model_results['Gradient Boosting'].f1_score,
            modelData.model_results['Gradient Boosting'].roc_auc
          ],
          name: 'Gradient Boosting',
          lineStyle: { color: '#8b5cf6' },
          areaStyle: { color: 'rgba(139, 92, 246, 0.2)' }
        }
      ]
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Model Training</h2>
        <p className="text-slate-500 mt-1">
          Train models using TensorFlow.js in your browser or view pre-computed results
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Browser-based Training Panel */}
        <div className="card">
          <h3 className="card-header flex items-center">
            <Cpu className="w-5 h-5 text-teal-600 mr-2" />
            Browser-Based Training (TensorFlow.js)
          </h3>

          {/* Model Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Model Architecture
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedModel('neural_network')}
                  disabled={isTraining}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedModel === 'neural_network'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Layers className="w-6 h-6 mx-auto mb-2 text-teal-600" />
                  <p className="font-medium text-slate-800">Neural Network</p>
                  <p className="text-xs text-slate-500 mt-1">3 hidden layers with dropout</p>
                </button>
                <button
                  onClick={() => setSelectedModel('logistic_regression')}
                  disabled={isTraining}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedModel === 'logistic_regression'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <GitBranch className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium text-slate-800">Logistic Regression</p>
                  <p className="text-xs text-slate-500 mt-1">Single layer sigmoid</p>
                </button>
              </div>
            </div>

            {/* Hyperparameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Epochs
                </label>
                <input
                  type="number"
                  value={epochs}
                  onChange={(e) => setEpochs(parseInt(e.target.value))}
                  disabled={isTraining}
                  min={10}
                  max={200}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Learning Rate
                </label>
                <select
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  disabled={isTraining}
                  className="input"
                >
                  <option value={0.001}>0.001</option>
                  <option value={0.005}>0.005</option>
                  <option value={0.01}>0.01</option>
                  <option value={0.05}>0.05</option>
                </select>
              </div>
            </div>

            {/* Training Controls */}
            <div className="flex space-x-3">
              <button
                onClick={trainModel}
                disabled={isTraining}
                className="btn btn-primary flex-1"
              >
                {isTraining ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2" />
                    Training... ({currentEpoch}/{epochs})
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Training
                  </>
                )}
              </button>
              <button
                onClick={resetTraining}
                disabled={isTraining}
                className="btn btn-secondary"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            {(isTraining || trainingComplete) && (
              <div>
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>Progress</span>
                  <span>{currentEpoch}/{epochs} epochs</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill bg-teal-500"
                    style={{ width: `${(currentEpoch / epochs) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Training Complete Status */}
            {trainingComplete && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Training Complete!</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-emerald-600">
                  <Clock className="w-4 h-4" />
                  <span>Time: {trainingTime.toFixed(2)}s</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Final Metrics */}
        <div className="card">
          <h3 className="card-header flex items-center">
            <Zap className="w-5 h-5 text-amber-500 mr-2" />
            Browser Training Results
          </h3>

          {finalMetrics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {(finalMetrics.accuracy * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-500">Accuracy</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {(finalMetrics.precision * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-500">Precision</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {(finalMetrics.recall * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-500">Recall</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {(finalMetrics.f1_score * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-500">F1 Score</p>
                </div>
              </div>

              {/* Mini Confusion Matrix */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Confusion Matrix</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-emerald-100 text-emerald-800 p-2 rounded">
                    TN: {finalMetrics.confusion_matrix[0][0]}
                  </div>
                  <div className="bg-red-100 text-red-800 p-2 rounded">
                    FP: {finalMetrics.confusion_matrix[0][1]}
                  </div>
                  <div className="bg-orange-100 text-orange-800 p-2 rounded">
                    FN: {finalMetrics.confusion_matrix[1][0]}
                  </div>
                  <div className="bg-emerald-100 text-emerald-800 p-2 rounded">
                    TP: {finalMetrics.confusion_matrix[1][1]}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Cpu className="w-12 h-12 mb-3" />
              <p>Train a model to see results</p>
            </div>
          )}
        </div>
      </div>

      {/* Training Progress Chart */}
      {trainingHistory.loss.length > 0 && (
        <div className="chart-container">
          <ReactECharts 
            ref={chartRef}
            option={trainingChartOption} 
            style={{ height: '400px' }} 
          />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-700 mb-2">📊 Interpretation</h4>
            <p className="text-sm text-slate-600">
              This chart shows the training dynamics over epochs. <strong>Converging loss curves</strong> indicate 
              stable learning. If validation loss increases while training loss decreases, the model may be 
              <strong> overfitting</strong>. The gap between training and validation metrics indicates 
              generalization capability.
            </p>
          </div>
        </div>
      )}

      {/* Pre-computed Results */}
      <div className="chart-container">
        <ReactECharts option={preComputedOption} style={{ height: '450px' }} />
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-700 mb-2">📊 Pre-computed Model Comparison</h4>
          <p className="text-sm text-slate-600">
            This radar chart compares the three models trained using scikit-learn (Python). 
            <strong> Gradient Boosting</strong> shows the best balance across all metrics, 
            while <strong>Logistic Regression</strong> excels in recall, making it suitable 
            when catching all positive cases is critical. <strong>Random Forest</strong> 
            offers good interpretability with competitive performance.
          </p>
        </div>
      </div>

      {/* Model Architecture Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="card-header">Neural Network Architecture</h3>
          <div className="space-y-3 font-mono text-sm">
            <div className="bg-slate-50 p-3 rounded">
              <span className="text-teal-600">Input Layer:</span> 11 features (normalized)
            </div>
            <div className="bg-slate-50 p-3 rounded">
              <span className="text-teal-600">Hidden Layer 1:</span> 32 units, ReLU, Dropout(0.3)
            </div>
            <div className="bg-slate-50 p-3 rounded">
              <span className="text-teal-600">Hidden Layer 2:</span> 16 units, ReLU, Dropout(0.2)
            </div>
            <div className="bg-slate-50 p-3 rounded">
              <span className="text-teal-600">Hidden Layer 3:</span> 8 units, ReLU
            </div>
            <div className="bg-slate-50 p-3 rounded">
              <span className="text-teal-600">Output Layer:</span> 1 unit, Sigmoid
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Training Configuration</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Optimizer</span>
              <span className="font-medium">Adam</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Loss Function</span>
              <span className="font-medium">Binary Cross-Entropy</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Batch Size</span>
              <span className="font-medium">32</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Validation Split</span>
              <span className="font-medium">20%</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Initialization</span>
              <span className="font-medium">Glorot Uniform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelTraining;
