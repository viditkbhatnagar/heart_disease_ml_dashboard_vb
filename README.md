# Heart Disease ML Dashboard

> **AI-Powered Cardiovascular Risk Assessment System**

A comprehensive machine learning dashboard for predicting and analyzing heart disease risk using clinical patient data. This application provides interactive visualization, model performance analysis, bias detection and mitigation, risk assessment, and executive reporting capabilities.

## 🌐 Live Application

**Access the live application at:** [https://heartdieaseaseprediction.netlify.app](https://heartdieaseaseprediction.netlify.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Model Training](#model-training)
- [Bias Mitigation](#bias-mitigation)
- [Components](#components)
- [Data Sources](#data-sources)
- [Performance Metrics](#performance-metrics)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Heart Disease ML Dashboard is an end-to-end machine learning application designed for healthcare operations. It leverages multiple machine learning algorithms to predict heart disease risk based on clinical features such as age, sex, blood pressure, cholesterol levels, ECG results, and exercise capacity.

The system includes:

- **Multiple ML Models**: Logistic Regression, Random Forest, and Gradient Boosting Classifiers
- **Comprehensive Analytics**: Performance metrics, ROC curves, confusion matrices, and feature importance analysis
- **Bias Detection & Mitigation**: Advanced fairness analysis with multiple mitigation techniques
- **Risk Management**: Detailed risk register for model deployment considerations
- **Interactive Visualizations**: Dynamic charts and graphs using Apache ECharts
- **Model Card**: Comprehensive documentation following ML model card best practices
- **Executive Reporting**: Summary reports suitable for stakeholders

---

## ✨ Features

### 1. **Dashboard**
- Real-time model performance metrics (Accuracy, F1 Score, ROC AUC)
- Dataset overview and statistics
- Quick access to key insights
- Visual performance indicators

### 2. **Model Training**
- Comparison of multiple machine learning algorithms
- Detailed performance metrics for each model
- Feature importance visualization
- ROC and Precision-Recall curves
- Confusion matrix analysis

### 3. **Model Card**
- Complete model documentation
- Intended use cases and users
- Performance summary
- Ethical considerations and limitations
- Monitoring and maintenance plan

### 4. **Risk Register**
- Comprehensive risk assessment matrix
- Risk prioritization (RPN - Risk Priority Number)
- Mitigation strategies for each identified risk
- Risk categories: Bias, Model Drift, Misclassification, Privacy, etc.

### 5. **Bias Mitigation** 🆕
- Bias detection across demographic groups (gender, age)
- Four mitigation techniques:
  - **Sample Reweighting**: Balancing training data through inverse frequency weighting
  - **Threshold Optimization**: Group-specific classification thresholds
  - **Minority Oversampling**: Balancing dataset representation
  - **Probability Calibration**: Improving prediction reliability
- Comparative analysis of bias reduction effectiveness
- Identified biases with detailed explanations

### 6. **Analytics**
- Subgroup performance analysis
- Demographic fairness metrics
- Feature distribution analysis
- Model comparison visualizations

### 7. **Executive Summary**
- High-level performance overview
- Key risk highlights
- Recommendations for deployment
- Exportable reports

---

## 🛠 Technology Stack

### Frontend
- **React 18.2.0** - UI framework
- **Vite 5.0** - Build tool and dev server
- **Tailwind CSS 3.3.6** - Styling framework
- **Apache ECharts 5.4.3** - Data visualization
- **echarts-for-react 3.0.2** - React ECharts integration
- **Lucide React 0.294.0** - Icon library
- **jsPDF 2.5.1** - PDF generation
- **html2canvas 1.4.1** - Screenshot generation for reports

### Backend/ML
- **Python 3.x**
- **scikit-learn** - Machine learning algorithms
- **pandas** - Data manipulation
- **numpy** - Numerical computing

### Deployment
- **Netlify** - Hosting platform
- **Git** - Version control

---

## 📦 Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Python 3.8+** (for model training)
- **pip** (Python package manager)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd heart-disease-ml-app-vb
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Install Python Dependencies (for model training)

```bash
pip install pandas numpy scikit-learn
```

### Step 4: Prepare Training Data

Place your heart disease dataset CSV file (named `heart.csv`) in the appropriate location. The dataset should contain the following columns:

- `Age`, `Sex`, `ChestPainType`, `RestingBP`, `Cholesterol`, `FastingBS`, `RestingECG`, `MaxHR`, `ExerciseAngina`, `Oldpeak`, `ST_Slope`, `HeartDisease`

**Note:** The training scripts currently reference specific file paths. Update these paths in `train_models.py` and `train_bias_mitigation.py` to match your setup.

---

## 🚀 Usage

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

### Building for Production

Create a production build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

---

## 📁 Project Structure

```
heart-disease-ml-app-vb/
├── public/
│   └── heart-icon.svg          # Application icon
├── src/
│   ├── components/
│   │   ├── Analytics.jsx       # Analytics and subgroup analysis
│   │   ├── BiasMitigation.jsx  # Bias detection and mitigation
│   │   ├── Dashboard.jsx       # Main dashboard view
│   │   ├── ExecutiveSummary.jsx # Executive report generation
│   │   ├── ModelCard.jsx       # Model documentation
│   │   ├── ModelTraining.jsx   # Model comparison and metrics
│   │   └── RiskRegister.jsx    # Risk assessment and management
│   ├── data/
│   │   ├── heartData.json      # Raw patient dataset
│   │   └── modelData.json      # Model results and metrics
│   ├── utils/                  # Utility functions
│   ├── App.jsx                 # Main application component
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles
├── train_models.py             # Model training script
├── train_bias_mitigation.py    # Bias mitigation analysis script
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── package.json                # Node.js dependencies
├── netlify.toml                # Netlify deployment config
└── README.md                   # This file
```

---

## 🤖 Model Training

### Training Multiple Models

Run the main training script to train and evaluate multiple models:

```bash
python train_models.py
```

This script will:
1. Load and preprocess the heart disease dataset
2. Encode categorical variables
3. Split data into training and testing sets
4. Train three models:
   - Logistic Regression
   - Random Forest Classifier
   - Gradient Boosting Classifier
5. Evaluate performance metrics
6. Perform subgroup analysis (gender, age groups)
7. Generate model card information
8. Create risk register
9. Export results to `src/data/modelData.json`

### Bias Mitigation Training

Run the bias mitigation script to analyze and mitigate biases:

```bash
python train_bias_mitigation.py
```

This script will:
1. Detect biases in the original model
2. Apply four mitigation techniques:
   - Sample Reweighting
   - Threshold Optimization
   - Minority Oversampling
   - Probability Calibration
3. Compare effectiveness of each technique
4. Generate bias mitigation results
5. Update `src/data/modelData.json` with bias analysis

---

## ⚖️ Bias Mitigation

The application implements comprehensive bias detection and mitigation strategies:

### Identified Biases

1. **Gender Representation Bias**: Dataset imbalance between male and female patients
2. **Outcome Rate Disparity**: Different disease prevalence rates across groups
3. **True Positive Rate Disparity**: Varying model sensitivity across demographics
4. **Feature Distribution Bias**: Different clinical feature patterns between groups
5. **Prediction Confidence Bias**: Poorly calibrated probabilities for minority groups

### Mitigation Techniques

1. **Sample Reweighting**
   - Assigns higher weights to underrepresented groups during training
   - Balances influence of different demographic groups

2. **Threshold Optimization**
   - Uses group-specific classification thresholds
   - Equalizes performance metrics across demographics

3. **Minority Oversampling**
   - Balances dataset by oversampling minority groups
   - Ensures equal representation in training data

4. **Probability Calibration**
   - Calibrates predicted probabilities using isotonic regression
   - Improves reliability of risk scores across groups

The Bias Mitigation dashboard provides detailed comparisons of each technique's effectiveness in reducing bias while maintaining overall model performance.

---

## 📊 Components

### Dashboard (`Dashboard.jsx`)
Main landing page with:
- Key performance metrics cards
- Dataset statistics overview
- Quick access to important features
- Visual performance indicators

### Model Training (`ModelTraining.jsx`)
Interactive model comparison featuring:
- Side-by-side performance metrics
- ROC and Precision-Recall curves
- Feature importance rankings
- Confusion matrices
- Algorithm comparison charts

### Model Card (`ModelCard.jsx`)
Comprehensive model documentation:
- Model purpose and intended users
- Training data description
- Performance summary
- Ethical considerations
- Known limitations
- Monitoring plan

### Risk Register (`RiskRegister.jsx`)
Risk management interface:
- Interactive risk assessment table
- Risk Priority Number (RPN) calculation
- Impact and likelihood ratings
- Mitigation strategies
- Risk categorization

### Bias Mitigation (`BiasMitigation.jsx`)
Fairness analysis dashboard:
- Bias detection metrics
- Comparison of mitigation techniques
- Demographic subgroup analysis
- Bias gap visualization
- Effectiveness metrics

### Analytics (`Analytics.jsx`)
Advanced analytics and insights:
- Subgroup performance analysis
- Demographic fairness metrics
- Feature distribution analysis
- Statistical comparisons

### Executive Summary (`ExecutiveSummary.jsx`)
High-level reporting:
- Performance overview
- Risk highlights
- Key recommendations
- PDF export functionality

---

## 📚 Data Sources

### Dataset
The application uses the **UCI Heart Disease Dataset**, which combines data from:
- Cleveland Clinic Foundation
- Hungarian Institute of Cardiology
- Switzerland University Hospitals
- VA Medical Center, Long Beach

### Features
- **Age**: Patient age in years
- **Sex**: Patient gender (M/F)
- **ChestPainType**: Type of chest pain (ATA, NAP, ASY, TA)
- **RestingBP**: Resting blood pressure (mm Hg)
- **Cholesterol**: Serum cholesterol (mm/dl)
- **FastingBS**: Fasting blood sugar (1 if >120 mg/dl, 0 otherwise)
- **RestingECG**: Resting electrocardiographic results
- **MaxHR**: Maximum heart rate achieved
- **ExerciseAngina**: Exercise-induced angina (Y/N)
- **Oldpeak**: ST depression induced by exercise
- **ST_Slope**: Slope of peak exercise ST segment
- **HeartDisease**: Target variable (0 = No disease, 1 = Disease)

---

## 📈 Performance Metrics

### Best Model: Gradient Boosting Classifier

- **Accuracy**: ~87-89%
- **Precision**: ~84-87%
- **Recall**: ~90-93%
- **F1 Score**: ~87-90%
- **ROC AUC**: ~89-90%

### Model Comparison

| Model | Accuracy | Precision | Recall | F1 Score | ROC AUC |
|-------|----------|-----------|--------|----------|---------|
| Logistic Regression | ~87% | ~85% | ~93% | ~89% | ~90% |
| Random Forest | ~87-89% | ~85-87% | ~90-93% | ~87-90% | ~89-90% |
| Gradient Boosting | **~89%** | **~87%** | **~93%** | **~90%** | **~90%** |

*Note: Exact metrics may vary based on data split and random seed*

---

## 🚀 Deployment

### Netlify Deployment

The application is configured for deployment on Netlify:

1. **Build Configuration** (`netlify.toml`):
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   ```

2. **Deploy Steps**:
   - Push code to Git repository
   - Connect repository to Netlify
   - Netlify will automatically build and deploy
   - Application will be available at your Netlify URL

3. **Custom Domain**:
   - Configure custom domain in Netlify settings
   - Update DNS records as instructed

### Environment Variables

Currently, no environment variables are required. All data is loaded from static JSON files in the `src/data/` directory.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution

- Additional ML models and algorithms
- Enhanced bias mitigation techniques
- Additional visualization types
- Performance optimizations
- Documentation improvements
- Test coverage
- Accessibility enhancements

---

## ⚠️ Important Notes

### Medical Disclaimer

**This application is for educational and research purposes only.** It is NOT intended for:
- Clinical diagnosis or treatment decisions
- Direct patient care
- Replacement of professional medical judgment

Always consult qualified healthcare professionals for medical advice and diagnosis.

### Data Privacy

- Ensure compliance with HIPAA and local data protection regulations
- Patient data used in training should be properly anonymized
- Implement appropriate security measures for production deployment

### Model Limitations

- Model trained on specific dataset; may not generalize to all populations
- Performance varies across demographic groups
- Regular retraining recommended with new data
- Requires human oversight for critical decisions

---

## 📝 License

This project is developed for educational purposes as part of an AI in Healthcare Operations course.

---

## 👥 Credits

- **Dataset**: UCI Machine Learning Repository - Heart Disease Dataset
- **Development**: AI Healthcare Analytics Team
- **Framework**: Built with React, Vite, and Tailwind CSS
- **Visualization**: Apache ECharts
- **Deployment**: Netlify

---

## 📞 Contact & Support

For questions, issues, or contributions, please open an issue in the repository or contact the development team.

---

## 🔗 Live Application

**Visit the live application:** [https://heartdieaseaseprediction.netlify.app](https://heartdieaseaseprediction.netlify.app)

---

**Last Updated**: 2026  
**Version**: 1.0.0
