import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_curve, auc, precision_recall_curve,
    classification_report
)
import json
from datetime import datetime

# Load data
df = pd.read_csv('/mnt/user-data/uploads/heart.csv')

# Data exploration
print(f"Dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"Target distribution:\n{df['HeartDisease'].value_counts()}")

# Encode categorical variables
label_encoders = {}
categorical_cols = ['Sex', 'ChestPainType', 'RestingECG', 'ExerciseAngina', 'ST_Slope']

df_encoded = df.copy()
for col in categorical_cols:
    le = LabelEncoder()
    df_encoded[col] = le.fit_transform(df[col])
    label_encoders[col] = {label: int(idx) for idx, label in enumerate(le.classes_)}

# Feature and target
X = df_encoded.drop('HeartDisease', axis=1)
y = df_encoded['HeartDisease']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Store scaler parameters for TensorFlow.js
scaler_params = {
    'mean': scaler.mean_.tolist(),
    'scale': scaler.scale_.tolist(),
    'feature_names': X.columns.tolist()
}

# Initialize models
models = {
    'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
    'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
    'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42)
}

# Train and evaluate models
results = {}

for name, model in models.items():
    print(f"\n{'='*50}")
    print(f"Training {name}...")
    
    # Train
    model.fit(X_train_scaled, y_train)
    
    # Predict
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    
    # Metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    # ROC curve
    fpr, tpr, thresholds = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)
    
    # Precision-Recall curve
    pr_precision, pr_recall, pr_thresholds = precision_recall_curve(y_test, y_prob)
    
    # Feature importance
    if hasattr(model, 'feature_importances_'):
        feature_importance = dict(zip(X.columns.tolist(), model.feature_importances_.tolist()))
    elif hasattr(model, 'coef_'):
        feature_importance = dict(zip(X.columns.tolist(), np.abs(model.coef_[0]).tolist()))
    else:
        feature_importance = {}
    
    results[name] = {
        'accuracy': round(accuracy, 4),
        'precision': round(precision, 4),
        'recall': round(recall, 4),
        'f1_score': round(f1, 4),
        'roc_auc': round(roc_auc, 4),
        'confusion_matrix': cm.tolist(),
        'roc_curve': {
            'fpr': [round(x, 4) for x in fpr.tolist()],
            'tpr': [round(x, 4) for x in tpr.tolist()]
        },
        'pr_curve': {
            'precision': [round(x, 4) for x in pr_precision.tolist()[::5]],
            'recall': [round(x, 4) for x in pr_recall.tolist()[::5]]
        },
        'feature_importance': {k: round(v, 4) for k, v in feature_importance.items()}
    }
    
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")
    print(f"ROC AUC: {roc_auc:.4f}")

# Subgroup analysis
print("\n" + "="*50)
print("Subgroup Analysis...")

# Create test dataframe with original values for subgroup analysis
test_indices = X_test.index
df_test = df.loc[test_indices].copy()
df_test['y_true'] = y_test.values

# Best model for subgroup analysis (Random Forest)
best_model = models['Random Forest']
df_test['y_pred'] = best_model.predict(X_test_scaled)

subgroup_results = {}

# Gender subgroup analysis
gender_groups = df_test.groupby('Sex')
subgroup_results['gender'] = {}
for gender, group in gender_groups:
    acc = accuracy_score(group['y_true'], group['y_pred'])
    prec = precision_score(group['y_true'], group['y_pred'], zero_division=0)
    rec = recall_score(group['y_true'], group['y_pred'], zero_division=0)
    f1 = f1_score(group['y_true'], group['y_pred'], zero_division=0)
    subgroup_results['gender'][gender] = {
        'count': len(group),
        'accuracy': round(acc, 4),
        'precision': round(prec, 4),
        'recall': round(rec, 4),
        'f1_score': round(f1, 4),
        'disease_rate': round(group['y_true'].mean(), 4)
    }
    print(f"\n{gender}: Accuracy={acc:.4f}, Precision={prec:.4f}, Recall={rec:.4f}, F1={f1:.4f}")

# Age group analysis
df_test['AgeGroup'] = pd.cut(df_test['Age'], bins=[0, 40, 55, 70, 100], labels=['<40', '40-55', '55-70', '70+'])
age_groups = df_test.groupby('AgeGroup')
subgroup_results['age'] = {}
for age_group, group in age_groups:
    if len(group) > 0:
        acc = accuracy_score(group['y_true'], group['y_pred'])
        prec = precision_score(group['y_true'], group['y_pred'], zero_division=0)
        rec = recall_score(group['y_true'], group['y_pred'], zero_division=0)
        f1 = f1_score(group['y_true'], group['y_pred'], zero_division=0)
        subgroup_results['age'][str(age_group)] = {
            'count': len(group),
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'disease_rate': round(group['y_true'].mean(), 4)
        }
        print(f"\nAge {age_group}: Accuracy={acc:.4f}, Precision={prec:.4f}, Recall={rec:.4f}, F1={f1:.4f}")

# Dataset statistics
dataset_stats = {
    'total_samples': len(df),
    'train_samples': len(X_train),
    'test_samples': len(X_test),
    'features': X.columns.tolist(),
    'target_distribution': {
        'no_disease': int((df['HeartDisease'] == 0).sum()),
        'disease': int((df['HeartDisease'] == 1).sum())
    },
    'gender_distribution': df['Sex'].value_counts().to_dict(),
    'age_stats': {
        'min': int(df['Age'].min()),
        'max': int(df['Age'].max()),
        'mean': round(df['Age'].mean(), 2),
        'std': round(df['Age'].std(), 2)
    },
    'categorical_mappings': label_encoders
}

# Prepare data for TensorFlow.js (normalized)
tf_data = {
    'X_train': X_train_scaled.tolist(),
    'y_train': y_train.tolist(),
    'X_test': X_test_scaled.tolist(),
    'y_test': y_test.tolist(),
    'scaler': scaler_params
}

# Model card data
model_card = {
    'model_name': 'Heart Disease Prediction Model',
    'version': '1.0.0',
    'owner': 'AI Healthcare Analytics Team',
    'purpose': 'Predict the likelihood of heart disease based on patient clinical data including age, sex, chest pain type, blood pressure, cholesterol levels, and ECG results.',
    'intended_users': 'Cardiologists, Clinical Decision Support Teams, Healthcare Researchers',
    'training_data': f'UCI Heart Disease Dataset with {len(df)} patient records, 11 clinical features',
    'data_sources': 'UCI Machine Learning Repository - Heart Disease Dataset (combined Cleveland, Hungarian, Switzerland, VA Long Beach)',
    'best_model': 'Random Forest Classifier',
    'performance_summary': results['Random Forest'],
    'all_models': results,
    'fairness_analysis': subgroup_results,
    'ethical_considerations': [
        'Model should be used as a decision support tool, not as a replacement for clinical judgment',
        'Performance varies across demographic groups - clinicians should be aware of potential biases',
        'Regular monitoring required to detect model drift and ensure continued accuracy',
        'Patient consent and data privacy must be maintained in accordance with HIPAA regulations',
        'Model predictions should be explained to patients in understandable terms'
    ],
    'limitations': [
        'Not validated for pediatric patients (dataset age range: 28-77 years)',
        'Limited representation of certain demographic groups in training data',
        'Does not account for genetic factors or family history',
        'Performance may degrade with data from different healthcare systems',
        'Cannot capture temporal changes in patient condition'
    ],
    'monitoring_plan': [
        'Weekly review of prediction accuracy on new cases',
        'Monthly subgroup performance analysis',
        'Quarterly model retraining with new data',
        'Annual external validation study',
        'Continuous tracking of false negative rates for high-risk patients'
    ],
    'last_updated': datetime.now().strftime('%Y-%m-%d')
}

# Risk register
risk_register = [
    {
        'id': 1,
        'risk': 'Model underperforms on minority demographic groups',
        'category': 'Bias',
        'impact': 4,
        'likelihood': 3,
        'rpn': 12,
        'mitigation': 'Perform regular subgroup analysis; collect more diverse training data; implement fairness constraints in model training'
    },
    {
        'id': 2,
        'risk': 'Model drift due to changing patient populations',
        'category': 'Model Drift',
        'impact': 4,
        'likelihood': 4,
        'rpn': 16,
        'mitigation': 'Implement continuous monitoring; set up automated alerts for performance degradation; schedule regular retraining'
    },
    {
        'id': 3,
        'risk': 'False negative leading to missed heart disease diagnosis',
        'category': 'Misclassification',
        'impact': 5,
        'likelihood': 3,
        'rpn': 15,
        'mitigation': 'Optimize model for high recall; implement secondary screening for borderline cases; mandatory clinical review for all negative predictions'
    },
    {
        'id': 4,
        'risk': 'Clinician over-reliance on AI predictions',
        'category': 'Automation Bias',
        'impact': 4,
        'likelihood': 4,
        'rpn': 16,
        'mitigation': 'Mandatory human-in-the-loop review; training programs on AI limitations; display confidence intervals with predictions'
    },
    {
        'id': 5,
        'risk': 'Patient data breach or privacy violation',
        'category': 'Privacy',
        'impact': 5,
        'likelihood': 2,
        'rpn': 10,
        'mitigation': 'Implement encryption at rest and in transit; regular security audits; HIPAA compliance training; data anonymization protocols'
    },
    {
        'id': 6,
        'risk': 'False positive causing unnecessary patient anxiety and testing',
        'category': 'Misclassification',
        'impact': 3,
        'likelihood': 3,
        'rpn': 9,
        'mitigation': 'Clear communication protocols; patient counseling guidelines; cost-benefit analysis for follow-up testing'
    },
    {
        'id': 7,
        'risk': 'Model fails to generalize to different healthcare systems',
        'category': 'Generalization',
        'impact': 4,
        'likelihood': 3,
        'rpn': 12,
        'mitigation': 'External validation studies; transfer learning approaches; site-specific calibration'
    }
]

# Sort by RPN
risk_register = sorted(risk_register, key=lambda x: x['rpn'], reverse=True)

# Export all data
output = {
    'model_results': results,
    'subgroup_analysis': subgroup_results,
    'dataset_stats': dataset_stats,
    'model_card': model_card,
    'risk_register': risk_register,
    'tf_data': tf_data
}

# Save to JSON
with open('/home/claude/heart-disease-ml-app/src/data/modelData.json', 'w') as f:
    json.dump(output, f, indent=2)

print("\n" + "="*50)
print("All data exported successfully!")
print(f"Output saved to: /home/claude/heart-disease-ml-app/src/data/modelData.json")

# Also save the raw dataset as JSON for the app
df_json = df.to_dict(orient='records')
with open('/home/claude/heart-disease-ml-app/src/data/heartData.json', 'w') as f:
    json.dump(df_json, f, indent=2)

print(f"Raw dataset saved to: /home/claude/heart-disease-ml-app/src/data/heartData.json")
