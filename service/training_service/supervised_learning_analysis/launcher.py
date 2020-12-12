import sys
import pandas as pd
import AdaBoost
import createRocCurve
import createPrecisionRecallCurve
import createLearningCurve
import createConfusionMatrix

def main():

    print "Init data"
    data = pd.read_csv(sys.argv[1])
    columnas=data.columns.tolist()
    x=columnas[len(columnas)-1]
    target=data[x]
    y=columnas[0:len(columnas)-1]
    dataset=data[y]

    AdaBoostObject = AdaBoost.AdaBoost(dataset, target, 3, 'SAMME', 10)
    AdaBoostObject.trainingMethod()

    #curva roc
    #curveRocObject = createRocCurve.curveRoc(dataset, target, AdaBoostObject.model, 10, 'user', 'job', 'path')
    #curveRocObject.createCurveROC()

    #precision-recall curve
    #precisionCurve = createPrecisionRecallCurve.curvePrecision(dataset, target, AdaBoostObject.model, 10, 'user', 'job', 'path')
    #precisionCurve.plot_precision_and_recall_curve()

    #learning curve
    #learningCurveDemo = createLearningCurve.curveLearning(dataset, target, AdaBoostObject.model, 10, 'user', 'job', 'path')
    #learningCurveDemo.createLearningCurve()

    #confusion matrix data
    confusionMatrixDemo = createConfusionMatrix.confusionMatrix(dataset, target, AdaBoostObject.model, 10, 'user', 'job', 'path', ["Clinical", "No Clinical"])
    confusionMatrixDemo.createConfusionMatrix()

    #bagginObject = Baggin.Baggin(dataset,target,3,10)
    #bagginObject.trainingMethod()
    #bernoulliNB = BernoulliNB.Bernoulli(dataset, target, 10)
    #bernoulliNB.trainingMethod()
    #decisionTreeObject = DecisionTree.DecisionTree(dataset, target, 'entropy', 'best',10)
    #decisionTreeObject.trainingMethod()
    #gaussianObject = GaussianNB.Gaussian(dataset, target, 10)
    #gaussianObject.trainingMethod()
    #gradientObject = Gradient.Gradient(dataset,target,3,10)
    #gradientObject.trainingMethod()
    #knnObect = knn.knn(dataset, target, 2, 'auto', 'minkowski', 10)
    #knnObect.trainingMethod()
    #MLPObject = MLP.MLP(dataset,target,'relu', 'sgd', 'adaptive', 1,1,1,10)
    #MLPObject.trainingMethod()
    #nuSVM = NuSVM.NuSVM(dataset,target,'poly',10)
    #nuSVM.trainingMethod()
    #rf = RandomForest.RandomForest(dataset,target,10,'gini',10)
    #rf.trainingMethod()
    #svm = SVM.SVM(dataset, target, 'poly', 10)
    #svm.trainingMethod()

    return 0

if __name__ == '__main__':
    main()
