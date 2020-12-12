'''
script que recibe un modelo y permite crear la curva roc del modelo con respecto al numero de validaciones
generado
'''

import matplotlib
matplotlib.use('Agg')

import numpy as np
from scipy import interp
import matplotlib.pyplot as plt

from sklearn import datasets
from sklearn.metrics import roc_curve, auc
from sklearn.model_selection import StratifiedKFold


class curveRoc(object):

    def __init__(self, dataSet, target, modelData, cv_values, user, job, path):

        self.dataSet = dataSet
        self.target = target
        self.modelData = modelData
        self.cv_values = cv_values
        self.job = job
        self.path = path
        self.user = user
        self.pathResponse = self.path+self.user+"/"+self.job+"/curveRoc_"+self.job+".svg"
    #funcion que permite crear la curva ROC y exportar la imagen segun corresponda
    def createCurveROC(self):

        #recibimos la data y la transformamos en
        X = np.array(self.dataSet)
        y = np.array(self.target)

        cv = StratifiedKFold(n_splits=self.cv_values)
        classifier = self.modelData
        tprs = []
        aucs = []
        mean_fpr = np.linspace(0, 1, 100)
        plt.figure()
        i = 0
        for train, test in cv.split(X, y):
            probas_ = classifier.fit(X[train], y[train]).predict_proba(X[test])
            # Compute ROC curve and area the curve
            fpr, tpr, thresholds = roc_curve(y[test], probas_[:, 1])
            tprs.append(interp(mean_fpr, fpr, tpr))
            tprs[-1][0] = 0.0
            roc_auc = auc(fpr, tpr)
            aucs.append(roc_auc)
            plt.plot(fpr, tpr, lw=1, alpha=0.3,
                     label='ROC fold %d (AUC = %0.2f)' % (i, roc_auc))

            i += 1
        plt.plot([0, 1], [0, 1], linestyle='--', lw=2, color='r',
                 label='Luck', alpha=.8)

        mean_tpr = np.mean(tprs, axis=0)
        mean_tpr[-1] = 1.0
        mean_auc = auc(mean_fpr, mean_tpr)
        std_auc = np.std(aucs)
        plt.plot(mean_fpr, mean_tpr, color='b',
                 label=r'Mean ROC (AUC = %0.2f $\pm$ %0.2f)' % (mean_auc, std_auc),
                 lw=2, alpha=.8)

        std_tpr = np.std(tprs, axis=0)
        tprs_upper = np.minimum(mean_tpr + std_tpr, 1)
        tprs_lower = np.maximum(mean_tpr - std_tpr, 0)
        plt.fill_between(mean_fpr, tprs_lower, tprs_upper, color='grey', alpha=.2,
                         label=r'$\pm$ 1 std. dev.')

        plt.xlim([-0.05, 1.05])
        plt.ylim([-0.05, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('Receiver operating characteristic (ROC)', fontsize=25)
        plt.legend(loc="lower right")
        plt.savefig(self.pathResponse)
