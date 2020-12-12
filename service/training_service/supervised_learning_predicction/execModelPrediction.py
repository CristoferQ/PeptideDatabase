'''
clase que permite entrenar un algoritmo de prediccion segun las caracteristicas recibidas

Orden de los algoritmos

1. AdaBoost
2. Bagging
3. DecisionTree
4. Gradient
5. KNN
6. MLP
7. NuSVR
8. RandomForest
9. SVR
'''

from modulesProject.supervised_learning_predicction import AdaBoost
from modulesProject.supervised_learning_predicction import Baggin
from modulesProject.supervised_learning_predicction import DecisionTree
from modulesProject.supervised_learning_predicction import Gradient
from modulesProject.supervised_learning_predicction import knn_regression
from modulesProject.supervised_learning_predicction import MLP
from modulesProject.supervised_learning_predicction import NuSVR
from modulesProject.supervised_learning_predicction import RandomForest
from modulesProject.supervised_learning_predicction import SVR

#metodos de la libreria utils...
from modulesProject.utils import transformDataClass
from modulesProject.utils import transformFrequence
from modulesProject.utils import ScaleNormalScore
from modulesProject.utils import ScaleMinMax
from modulesProject.utils import ScaleDataSetLog
from modulesProject.utils import ScaleLogNormalScore
from modulesProject.supervised_learning_predicction import performanceData

import pandas as pd
import json
from joblib import dump, load

class execAlgorithm(object):

    #constructor de la clase
    def __init__(self, dataSet, user, job, pathResponse, algorithm, params, featureClass, optionNormalize):

        self.dataSet = dataSet
        self.user = user
        self.job = job
        self.pathResponse = pathResponse
        self.algorithm = algorithm
        self.featureClass = featureClass
        self.optionNormalize = optionNormalize
        self.params = params#params es una lista de parametros asociados al algoritmo
        self.createDataSet()

        self.responseExec = {}#diccionario con la respuesta para formar el json

    #metodo que permite formar el set de datos y el target con la informacion...
    def createDataSet(self):

        targetResponse = self.dataSet[self.featureClass]
        dictData = {}

        for key in self.dataSet:
            if key != self.featureClass:
                arrayFeature = []
                for i in self.dataSet[key]:
                    arrayFeature.append(i)
                dictData.update({key:arrayFeature})

        #formamos el nuevo set de datos...
        dataSetNew = pd.DataFrame(dictData)

        #ahora evaluamos si la clase tiene valores discretos o continuos y los modificamos en caso de que sean discretos
        transformData = transformDataClass.transformClass(targetResponse)
        self.response = transformData.transformData
        self.dictTransform = transformData.dictTransform

        #ahora transformamos el set de datos por si existen elementos discretos...
        transformDataSet = transformFrequence.frequenceData(dataSetNew)
        dataSetNewFreq = transformDataSet.dataTransform

        #ahora aplicamos el procesamiento segun lo expuesto
        if self.optionNormalize == 1:#normal scale
            applyNormal = ScaleNormalScore.applyNormalScale(dataSetNewFreq)
            self.data = applyNormal.dataTransform

        if self.optionNormalize == 2:#min max scaler
            applyMinMax = ScaleMinMax.applyMinMaxScaler(dataSetNewFreq)
            self.data = applyMinMax.dataTransform

        if self.optionNormalize == 3:#log scale
            applyLog = ScaleDataSetLog.applyLogScale(dataSetNewFreq)
            self.data = applyLog.dataTransform

        if self.optionNormalize == 4:#log normal scale
            applyLogNormal = ScaleLogNormalScore.applyLogNormalScale(dataSetNewFreq)
            self.data = applyLogNormal.dataTransform

    #ejecucion del algoritmo
    def execAlgorithmByOptions(self):

        if self.algorithm == 1:#AdaBoost

            errorData = {}
            self.responseExec.update({"algorithm": "AdaBoostRegressor"})
            paramsData = {}
            paramsData.update({"n_estimators": self.params[0]})
            paramsData.update({"loss": self.params[1]})
            self.responseExec.update({"Params": paramsData})

            try:
                #instancia al objeto...
                AdaBoostObject = AdaBoost.AdaBoost(self.data, self.response, int(self.params[0]), self.params[1])
                AdaBoostObject.trainingMethod()

                performance = {}
                performance.update({"r_score":AdaBoostObject.r_score})
                performance.update({"predict_values": AdaBoostObject.predicctions.tolist()})
                performance.update({"real_values": AdaBoostObject.response.tolist()})

                #calculamos las medidas asociadas a la data de interes...
                performanceValues = performanceData.performancePrediction(self.response, AdaBoostObject.predicctions.tolist())
                pearsonValue = performanceValues.calculatedPearson()
                spearmanValue = performanceValues.calculatedSpearman()
                kendalltauValue = performanceValues.calculatekendalltau()

                #los agregamos al diccionario
                performance.update({"pearson":pearsonValue})
                performance.update({"spearman":spearmanValue})
                performance.update({"kendalltau":kendalltauValue})

                self.responseExec.update({"Performance": performance})
                errorData.update({"Process" : "OK"})

                #exportamos el modelo en formato joblib
                nameModel =self.pathResponse+self.user+"/"+self.job+"/modelExport"+str(self.job)+".joblib"
                dump(AdaBoostObject.AdaBoostModel, nameModel)

            except:
                errorData.update({"Process" : "ERROR"})
                pass

            self.responseExec.update({"errorExec": errorData})

            #exportamos tambien el resultado del json
            nameFile =self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json"
            with open(self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json", 'w') as fp:
                json.dump(self.responseExec, fp)

        elif self.algorithm == 2:#Bagging

            errorData = {}
            self.responseExec.update({"algorithm": "BaggingRegressor"})
            paramsData = {}
            paramsData.update({"n_estimators": self.params[0]})
            paramsData.update({"bootstrap": self.params[1]})
            self.responseExec.update({"Params": paramsData})

            try:
                #instancia al objeto...
                baggingObject = Baggin.Baggin(self.data, self.response, int(self.params[0]), self.params[1])
                baggingObject.trainingMethod()

                performance = {}
                performance.update({"r_score":baggingObject.r_score})
                performance.update({"predict_values": baggingObject.predicctions.tolist()})
                performance.update({"real_values": baggingObject.response.tolist()})

                #calculamos las medidas asociadas a la data de interes...
                performanceValues = performanceData.performancePrediction(self.response, baggingObject.predicctions.tolist())
                pearsonValue = performanceValues.calculatedPearson()
                spearmanValue = performanceValues.calculatedSpearman()
                kendalltauValue = performanceValues.calculatekendalltau()

                #los agregamos al diccionario
                performance.update({"pearson":pearsonValue})
                performance.update({"spearman":spearmanValue})
                performance.update({"kendalltau":kendalltauValue})

                self.responseExec.update({"Performance": performance})
                errorData.update({"Process" : "OK"})

                #exportamos el modelo en formato joblib
                nameModel =self.pathResponse+self.user+"/"+self.job+"/modelExport"+str(self.job)+".joblib"
                dump(baggingObject.bagginModel, nameModel)

            except:
                errorData.update({"Process" : "ERROR"})
                pass

            self.responseExec.update({"errorExec": errorData})

            #exportamos tambien el resultado del json
            nameFile =self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json"
            with open(self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json", 'w') as fp:
                json.dump(self.responseExec, fp)

        elif self.algorithm == 3:#DecisionTree

            errorData = {}
            self.responseExec.update({"algorithm": "DecisionTreeRegressor"})
            paramsData = {}
            paramsData.update({"criterion": self.params[0]})
            paramsData.update({"splitter": self.params[1]})
            self.responseExec.update({"Params": paramsData})

            try:
                #instancia al objeto...
                decisionObject = DecisionTree.DecisionTree(self.data, self.response, self.params[0], self.params[1])
                decisionObject.trainingMethod()

                performance = {}
                performance.update({"r_score":decisionObject.r_score})
                performance.update({"predict_values": decisionObject.predicctions.tolist()})
                performance.update({"real_values": decisionObject.response.tolist()})

                #calculamos las medidas asociadas a la data de interes...
                performanceValues = performanceData.performancePrediction(self.response, decisionObject.predicctions.tolist())
                pearsonValue = performanceValues.calculatedPearson()
                spearmanValue = performanceValues.calculatedSpearman()
                kendalltauValue = performanceValues.calculatekendalltau()

                #los agregamos al diccionario
                performance.update({"pearson":pearsonValue})
                performance.update({"spearman":spearmanValue})
                performance.update({"kendalltau":kendalltauValue})

                self.responseExec.update({"Performance": performance})
                errorData.update({"Process" : "OK"})

                #exportamos el modelo en formato joblib
                nameModel =self.pathResponse+self.user+"/"+self.job+"/modelExport"+str(self.job)+".joblib"
                dump(decisionObject.DecisionTreeAlgorithm, nameModel)

            except:
                errorData.update({"Process" : "ERROR"})
                pass

            self.responseExec.update({"errorExec": errorData})

            #exportamos tambien el resultado del json
            nameFile =self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json"
            with open(self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json", 'w') as fp:
                json.dump(self.responseExec, fp)

        elif self.algorithm == 4:#Gradient

            errorData = {}
            self.responseExec.update({"algorithm": "GradientBoostingRegressor"})
            paramsData = {}
            paramsData.update({"n_estimators": self.params[0]})
            paramsData.update({"loss": self.params[1]})
            paramsData.update({"criterion": self.params[2]})
            paramsData.update({"min_samples_leaf": self.params[3]})
            paramsData.update({"min_samples_split": self.params[4]})
            self.responseExec.update({"Params": paramsData})

            try:
                #instancia al objeto...
                gradientObject = Gradient.Gradient(self.data, self.response, int(self.params[0]), self.params[1], self.params[2], int(self.params[4]), int(self.params[3]))
                gradientObject.trainingMethod()

                performance = {}
                performance.update({"r_score":gradientObject.r_score})
                performance.update({"predict_values": gradientObject.predicctions.tolist()})
                performance.update({"real_values": gradientObject.response.tolist()})

                #calculamos las medidas asociadas a la data de interes...
                performanceValues = performanceData.performancePrediction(self.response, gradientObject.predicctions.tolist())
                pearsonValue = performanceValues.calculatedPearson()
                spearmanValue = performanceValues.calculatedSpearman()
                kendalltauValue = performanceValues.calculatekendalltau()

                #los agregamos al diccionario
                performance.update({"pearson":pearsonValue})
                performance.update({"spearman":spearmanValue})
                performance.update({"kendalltau":kendalltauValue})

                self.responseExec.update({"Performance": performance})
                errorData.update({"Process" : "OK"})

                #exportamos el modelo en formato joblib
                nameModel =self.pathResponse+self.user+"/"+self.job+"/modelExport"+str(self.job)+".joblib"
                dump(gradientObject.GradientAlgorithm, nameModel)

            except:
                errorData.update({"Process" : "ERROR"})
                pass

            self.responseExec.update({"errorExec": errorData})

            #exportamos tambien el resultado del json
            nameFile =self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json"
            with open(self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json", 'w') as fp:
                json.dump(self.responseExec, fp)

        elif self.algorithm == 5:#KNN

            errorData = {}
            self.responseExec.update({"algorithm": "KNeighborsRegressor"})
            paramsData = {}
            paramsData.update({"n_neighbors": self.params[0]})
            paramsData.update({"algorithm": self.params[1]})
            paramsData.update({"metric": self.params[2]})
            paramsData.update({"weights": self.params[3]})
            self.responseExec.update({"Params": paramsData})

            try:
                #instancia al objeto...
                knnObject = knn_regression.KNN_Model(self.data, self.response, int(self.params[0]), self.params[1], self.params[2], self.params[3])
                knnObject.trainingMethod()

                performance = {}
                performance.update({"r_score":knnObject.r_score})
                performance.update({"predict_values": knnObject.predicctions.tolist()})
                performance.update({"real_values": knnObject.response.tolist()})

                #calculamos las medidas asociadas a la data de interes...
                performanceValues = performanceData.performancePrediction(self.response, knnObject.predicctions.tolist())
                pearsonValue = performanceValues.calculatedPearson()
                spearmanValue = performanceValues.calculatedSpearman()
                kendalltauValue = performanceValues.calculatekendalltau()

                #los agregamos al diccionario
                performance.update({"pearson":pearsonValue})
                performance.update({"spearman":spearmanValue})
                performance.update({"kendalltau":kendalltauValue})

                self.responseExec.update({"Performance": performance})
                errorData.update({"Process" : "OK"})
                #exportamos el modelo en formato joblib
                nameModel =self.pathResponse+self.user+"/"+self.job+"/modelExport"+str(self.job)+".joblib"
                dump(knnObject.KNN_model, nameModel)

            except:
                errorData.update({"Process" : "ERROR"})
                pass

            self.responseExec.update({"errorExec": errorData})

            #exportamos tambien el resultado del json
            nameFile =self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json"
            with open(self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json", 'w') as fp:
                json.dump(self.responseExec, fp)

        elif self.algorithm == 6:#MLP

            errorData = {}
            self.responseExec.update({"algorithm": "MLPRegressor"})
            paramsData = {}
            paramsData.update({"activation":self.params[0]})
            paramsData.update({"solver":self.params[1]})
            paramsData.update({"learning_rate":self.params[2]})
            paramsData.update({"hidden_layer_sizes_a":self.params[3]})
            paramsData.update({"hidden_layer_sizes_b":self.params[4]})
            paramsData.update({"hidden_layer_sizes_c":self.params[5]})
            paramsData.update({"alpha":self.params[6]})
            paramsData.update({"max_iter":self.params[7]})
            paramsData.update({"shuffle":self.params[8]})
            self.responseExec.update({"Params": paramsData})

            try:
                #instancia al objeto...
                MLPObject = MLP.MLP(self.data,self.response, self.params[0], self.params[1], self.params[2], int(self.params[3]), int(self.params[4]), int(self.params[5]), float(self.params[6]), int(self.params[7]), self.params[8])
                MLPObject.trainingMethod()

                performance = {}
                performance.update({"r_score":MLPObject.r_score})
                performance.update({"predict_values": MLPObject.predicctions.tolist()})
                performance.update({"real_values": MLPObject.response.tolist()})

                #calculamos las medidas asociadas a la data de interes...
                performanceValues = performanceData.performancePrediction(self.response, MLPObject.predicctions.tolist())
                pearsonValue = performanceValues.calculatedPearson()
                spearmanValue = performanceValues.calculatedSpearman()
                kendalltauValue = performanceValues.calculatekendalltau()

                #los agregamos al diccionario
                performance.update({"pearson":pearsonValue})
                performance.update({"spearman":spearmanValue})
                performance.update({"kendalltau":kendalltauValue})

                self.responseExec.update({"Performance": performance})
                errorData.update({"Process" : "OK"})

                #exportamos el modelo en formato joblib
                nameModel =self.pathResponse+self.user+"/"+self.job+"/modelExport"+str(self.job)+".joblib"
                dump(MLPObject.MLPModel, nameModel)

            except:
                errorData.update({"Process" : "ERROR"})
                pass

            self.responseExec.update({"errorExec": errorData})

            #exportamos tambien el resultado del json
            nameFile =self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json"
            with open(self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json", 'w') as fp:
                json.dump(self.responseExec, fp)

        elif self.algorithm == 7:#NuSVR

            errorData = {}
            self.responseExec.update({"algorithm": "NuSVR"})
            paramsData = {}
            paramsData.update({"kernel":self.params[0]})
            paramsData.update({"nu":self.params[1]})
            paramsData.update({"degree":self.params[2]})
            paramsData.update({"gamma":self.params[3]})
            self.responseExec.update({"Params": paramsData})

            try:
                #instancia al objeto...
                nuSVM = NuSVR.NuSVRModel(self.data,self.response,self.params[0], int(self.params[2]), float(self.params[3]), float(self.params[1]))
                nuSVM.trainingMethod()

                performance = {}
                performance.update({"r_score":nuSVM.r_score})
                performance.update({"predict_values": nuSVM.predicctions.tolist()})
                performance.update({"real_values": nuSVM.response.tolist()})

                #calculamos las medidas asociadas a la data de interes...
                performanceValues = performanceData.performancePrediction(self.response, nuSVM.predicctions.tolist())
                pearsonValue = performanceValues.calculatedPearson()
                spearmanValue = performanceValues.calculatedSpearman()
                kendalltauValue = performanceValues.calculatekendalltau()

                #los agregamos al diccionario
                performance.update({"pearson":pearsonValue})
                performance.update({"spearman":spearmanValue})
                performance.update({"kendalltau":kendalltauValue})

                self.responseExec.update({"Performance": performance})
                errorData.update({"Process" : "OK"})

                #exportamos el modelo en formato joblib
                nameModel =self.pathResponse+self.user+"/"+self.job+"/modelExport"+str(self.job)+".joblib"
                dump(nuSVM.SVRAlgorithm, nameModel)

            except:
                errorData.update({"Process" : "ERROR"})
                pass

            self.responseExec.update({"errorExec": errorData})

            #exportamos tambien el resultado del json
            nameFile =self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json"
            with open(self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json", 'w') as fp:
                json.dump(self.responseExec, fp)

        elif self.algorithm == 8:#RandomForest

            errorData = {}
            self.responseExec.update({"algorithm": "RandomForestRegressor"})
            paramsData = {}
            paramsData.update({"n_estimators":self.params[0]})
            paramsData.update({"criterion":self.params[1]})
            paramsData.update({"min_samples_split":self.params[2]})
            paramsData.update({"min_samples_leaf":self.params[3]})
            paramsData.update({"bootstrap":self.params[4]})
            self.responseExec.update({"Params": paramsData})

            try:
                #instancia al objeto...
                rf = RandomForest.RandomForest(self.data,self.response, int(self.params[0]),self.params[1], int(self.params[2]), int(self.params[3]), self.params[4])
                rf.trainingMethod()

                performance = {}
                performance.update({"r_score":rf.r_score})
                performance.update({"predict_values": rf.predicctions.tolist()})
                performance.update({"real_values": rf.response.tolist()})

                #calculamos las medidas asociadas a la data de interes...
                performanceValues = performanceData.performancePrediction(self.response, rf.predicctions.tolist())
                pearsonValue = performanceValues.calculatedPearson()
                spearmanValue = performanceValues.calculatedSpearman()
                kendalltauValue = performanceValues.calculatekendalltau()

                #los agregamos al diccionario
                performance.update({"pearson":pearsonValue})
                performance.update({"spearman":spearmanValue})
                performance.update({"kendalltau":kendalltauValue})

                self.responseExec.update({"Performance": performance})
                errorData.update({"Process" : "OK"})
                #exportamos el modelo en formato joblib
                nameModel =self.pathResponse+self.user+"/"+self.job+"/modelExport"+str(self.job)+".joblib"
                dump(rf.randomForesModel, nameModel)

            except:
                errorData.update({"Process" : "ERROR"})
                pass

            self.responseExec.update({"errorExec": errorData})

            #exportamos tambien el resultado del json
            nameFile =self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json"
            with open(self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json", 'w') as fp:
                json.dump(self.responseExec, fp)

        elif self.algorithm == 9:#SVR

            errorData = {}
            self.responseExec.update({"algorithm": "SVR"})
            paramsData = {}
            paramsData.update({"kernel":self.params[0]})
            paramsData.update({"degree":self.params[1]})
            paramsData.update({"gamma":self.params[2]})
            self.responseExec.update({"Params": paramsData})

            try:
                #instancia al objeto...
                svm = SVR.SVRModel(self.data,self.response,self.params[0], int(self.params[1]), float(self.params[2]))
                svm.trainingMethod()

                performance = {}
                performance.update({"r_score":svm.r_score})
                performance.update({"predict_values": svm.predicctions.tolist()})
                performance.update({"real_values": svm.response.tolist()})

                #calculamos las medidas asociadas a la data de interes...
                performanceValues = performanceData.performancePrediction(self.response, svm.predicctions.tolist())
                pearsonValue = performanceValues.calculatedPearson()
                spearmanValue = performanceValues.calculatedSpearman()
                kendalltauValue = performanceValues.calculatekendalltau()

                #los agregamos al diccionario
                performance.update({"pearson":pearsonValue})
                performance.update({"spearman":spearmanValue})
                performance.update({"kendalltau":kendalltauValue})

                self.responseExec.update({"Performance": performance})
                errorData.update({"Process" : "OK"})

                #exportamos el modelo en formato joblib
                nameModel =self.pathResponse+self.user+"/"+self.job+"/modelExport"+str(self.job)+".joblib"
                dump(svm.SVRAlgorithm, nameModel)

            except:
                errorData.update({"Process" : "ERROR"})
                pass

            self.responseExec.update({"errorExec": errorData})

            #exportamos tambien el resultado del json
            nameFile =self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json"
            with open(self.pathResponse+self.user+"/"+self.job+"/responseTraining"+str(self.job)+".json", 'w') as fp:
                json.dump(self.responseExec, fp)
