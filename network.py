import numpy

def sigmoid(z):
    return 1.0 / (1.0 + numpy.exp(-z))

class Network(object):
    def __init__(self, sizes = [], weights = [], biases = []):
        if len(sizes) == 0:
            self.weights = weights
            self.biases = biases
        else:
            self.weights = [numpy.random.randn(y, x) for x, y in zip(sizes[:-1], sizes[1:])]
            self.biases = [numpy.random.randn(y, 1) for y in sizes[1:]]

    def feedforward(self, a):
        for w, b in zip(self.weights, self.biases):
            a = sigmoid(numpy.dot(w, a) + b)
        return a

if __name__ == '__main__':
    # two-layer network, 1st layer has 2 neurons, 2nd layer has 3 neurons
    #net = Network(weights=[[[0.2,0.3],[0.4,0.5],[0.6,0.7]]], biases=[[0.05, 0.04, 0.03]])
    #print(net.feedforward(numpy.array([0.8, 0.9]))) # [0.61774787 0.6921095  0.75767964]

    # three-layer network, 1st layer has 2 neurons, 2nd layer has 3 neurons, 3rd layer has 4 neurons
    net = Network([2, 3, 4])
    print(net.feedforward(numpy.array([0.8, 0.9]))) # [0.59802211 0.59676878 0.59802211 0.59676878]
