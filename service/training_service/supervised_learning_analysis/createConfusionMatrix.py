'''
script que permite crear una matriz de confusion dado un modelo
'''

import matplotlib
matplotlib.use('Agg')
import numpy as np
from sklearn.model_selection import LeaveOneOut
import matplotlib.pyplot as plt
from sklearn.model_selection import cross_val_predict
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import cross_validate
from sklearn.metrics import confusion_matrix
import itertools
import pandas as pd
import json

class confusionMatrix(object):

    def __init__(self, dataSet, target, modelData, cv_values, user, job, path, classList):

        self.dataSet = dataSet
        self.target = target
        self.modelData = modelData
        self.job = job
        self.path = path
        self.user = user
        self.classList = classList
        self.pathResponse = self.path+self.user+"/"+self.job+"/confusionMatrix_"+self.job

        if cv_values == -1:
            self.cv_values = LeaveOneOut()
            self.cv_valuesName = "LeaveOneOut"
        else:
            self.cv_values = cv_values

    #metodo que permite exportar la matriz a un csv y adiciona las filas y columnas correspondientes a fiabilidad y bakanosidad
    def exportConfusionMatrix(self, matrix, dictTransform):

        print dictTransform
        #calculamos la bakanosidad del modelo (en base a los valores de la primera columna)
        bakanosidad = []
        for i in range(len(matrix)):
            sumRow = sum(matrix[i])
            value = (matrix[i][i]/float(sumRow))*100
            bakanosidad.append(value)

        #calculamos la fiabilidad del modelo...
        transpose = matrix.transpose()
        fiabilidad = []
        for i in range(len(transpose)):
            sumRow = sum(transpose[i])
            value = (transpose[i][i]/float(sumRow))*100
            fiabilidad.append(value)


        header = []
        for element in self.classList:
            header.append(self.getKeyToDict(dictTransform, element))

        matrixData = []
        for element in matrix:#obtenemos las columnas
            rowSum = sum(element)
            print rowSum
            row = []
            for value in element:
                print value
                dataInValue = value
                print dataInValue
                row.append(dataInValue)
            matrixData.append(row)
        print matrixData
        dictResponse = {"fiabilidad": fiabilidad, "bakanosidad":bakanosidad, "matrix":matrixData, "header": header}

        return dictResponse

    #metodo que retorna la key de un diccionario dado su valor
    def getKeyToDict(self, dictTransform, value):

        keyValue=""
        for key in dictTransform:
            if dictTransform[key] == value:
                keyValue= key
                break
        return keyValue

    #metodo que permite generar la matriz de confusion...
    def createConfusionMatrix(self, dictTransform):

        self.predictions = cross_val_predict(self.modelData, self.dataSet, self.target, cv=self.cv_values)
        matrix = confusion_matrix(self.target, self.predictions)
        print matrix
        dictResponse = self.exportConfusionMatrix(matrix, dictTransform)
        return dictResponse

        # Plot non-normalized confusion matrix
        #plt.figure()
        #self.plot_confusion_matrix(matrix, classes=self.classList, title='Confusion matrix, without normalization')
        #plt.savefig(self.pathResponse)
