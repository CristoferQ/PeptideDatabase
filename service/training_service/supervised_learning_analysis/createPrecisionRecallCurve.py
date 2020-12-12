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
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import precision_recall_curve
from sklearn.model_selection import train_test_split
from sklearn.metrics import average_precision_score


class curvePrecision(object):

    def __init__(self, dataSet, target, modelData, cv_values, user, job, path):

        self.dataSet = dataSet
        self.target = target
        self.modelData = modelData
        self.cv_values = cv_values
        self.job = job
        self.path = path
        self.user = user
        self.pathResponse = self.path+self.user+"/"+self.job+"/precision_recall_curve_"+self.job+".svg"

    #funcion que permite crear la curva ROC y exportar la imagen segun corresponda
    def plot_precision_and_recall_curve(self):

        X = np.array(self.dataSet)
        y = np.array(self.target)

        # Limit to the two first classes, and split into training and test
        X_train, X_test, y_train, y_test = train_test_split(X[y < 2], y[y < 2],test_size=.5)

        # Create a simple classifier
        self.modelData.fit(X_train, y_train)
        y_score = self.modelData.decision_function(X_test)
        average_precision = average_precision_score(y_test, y_score)

        print('Average precision-recall score: {0:0.2f}'.format(average_precision))

        precision, recall, _ = precision_recall_curve(y_test, y_score)

        plt.figure()
        plt.step(recall, precision, color='b', alpha=0.2,where='post')
        plt.fill_between(recall, precision, step='post', alpha=0.2,color='b')

        plt.xlabel('Recall')
        plt.ylabel('Precision')
        plt.ylim([0.0, 1.05])
        plt.xlim([0.0, 1.0])
        plt.title('Precision-Recall curve: AP={0:0.2f}'.format(average_precision))

        plt.savefig(self.pathResponse)
