import numpy

delta = 1e-7

class MNIST_loader:
    def __loadData(self, data_file):
        with open(data_file, 'rb') as file:
            content = file.read()
        magic = int.from_bytes(content[0:4], 'big')
        assert magic == 2051
        len = int.from_bytes(content[4:8], 'big')
        row = int.from_bytes(content[8:12], 'big')
        col = int.from_bytes(content[12:16], 'big')
        pixels, index = row*col, 16
        ret = numpy.zeros((len, pixels))
        for i in range(len):
            for j in range(pixels):
                ret[i][j] = int.from_bytes(content[index:index+1], 'big') / 255
                index += 1
        return ret

    def __loadLabel(self, label_file):
        with open(label_file, 'rb') as file:
            content = file.read()
        magic = int.from_bytes(content[0:4], 'big')
        assert magic == 2049
        len = int.from_bytes(content[4:8], 'big')
        ret = numpy.zeros((len, 10), numpy.int8)
        for i in range(len):
            ret[i][int.from_bytes(content[i+8:i+9], 'big')] = 1
        return ret

    def __init__(self, train_data_file, train_label_file, test_data_file, test_label_file):
        self.train_data = self.__loadData(train_data_file)
        self.test_data = self.__loadData(test_data_file)
        self.train_label = self.__loadLabel(train_label_file)
        self.test_label = self.__loadLabel(test_label_file)

# x is a matrix with num of instances (row) x properties (col)
def softmax(x):
    if x.ndim == 2:
        x = x.T  # transpose x
        x -= numpy.max(x, axis=0)
        y = numpy.exp(x) / numpy.sum(numpy.exp(x), axis=0)
        return y.T

    x -= numpy.max(x)
    return numpy.exp(x) / numpy.sum(numpy.exp(x))

def sigmoid(z):
    return 1.0 / (1.0 + numpy.exp(-z))

#def sigmoid_backward(z):
#    return sigmoid(z) * (1-sigmoid(z))

def cross_entropy_error(y, t):
    if y.ndim == 1 and t.ndim == 1:
        return -numpy.sum(numpy.log(y[t.argmax()]+delta))
    t = t.argmax(axis = 1)
    num_instance = y.shape[0]
    # for each instance, pick the probability where the corresponding label is 1
    return -numpy.sum(numpy.log(y[numpy.arange(num_instance), t]+delta)) / num_instance

class Network(object):
    def __init__(self, sizes = [], weights = [], biases = []):
        if len(sizes) == 0:
            self.weights = weights
            self.biases = biases
        else:
            self.weights = [numpy.random.randn(x, y) for x, y in zip(sizes[:-1], sizes[1:])]
            self.biases = [numpy.random.randn(y) for y in sizes[1:]]
        self.weights_grad = [numpy.zeros(w.shape) for w in self.weights]
        self.biases_grad = [numpy.zeros(b.shape) for b in self.biases]

    def feedforward(self, a):
        for w, b in zip(self.weights, self.biases):
            a = sigmoid(numpy.dot(a, w) + b)
        return softmax(a)

    def loss(self, x, label):
        y = self.feedforward(x)
        return cross_entropy_error(y, label)

    def numerical_gradient(self, data, label, x):
        h = 1e-4
        grad = numpy.zeros_like(x)
        it = numpy.nditer(x, flags=['multi_index'], op_flags=['readwrite'])
        while not it.finished:
            idx = it.multi_index
            tmp_val = x[idx]
            x[idx] = float(tmp_val) + h
            target1 = self.loss(data, label)
            x[idx] = float(tmp_val) - h
            target2 = self.loss(data, label)

            grad[idx] = (target2-target1) / (2*h)
            x[idx] = tmp_val
            it.iternext()
        return grad

    def gradient(self, data, label):
        batch_num = data.shape[0]

        activation = data
        activations = [data]
        for w, b in zip(self.weights, self.biases):
            z = numpy.dot(activation, w) + b
            activation = sigmoid(z)
            activations.append(activation)
        y = softmax(activation)
        dy = (y-label) / batch_num  # backward of softmax-with-loss
        
        for i in range(1, len(self.weights)+1):
            dsigmoid = dy * activations[-i] * (1-activations[-i])  # backward of sigmoid
            self.weights_grad[-i] = numpy.dot(activations[-i-1].T, dsigmoid)
            self.biases_grad[-i] = numpy.sum(dsigmoid, axis=0)
            dy = numpy.dot(dsigmoid, self.weights[-i].T)    # d(activation)

    def train(self, train_data, train_label):
        batch_size = 100
        iters_num = 10000
        learning_rate = 0.1
        for i in range(iters_num):
            print("iter "+str(i))
            batch_index = numpy.random.choice(train_data.shape[0], batch_size)
            data_batch = train_data[batch_index]
            label_batch = train_label[batch_index]

            # method 1, get gradient from numerical_gradient function
#            for j in range(len(self.weights)):
#                self.weights_grad[j] = self.numerical_gradient(data_batch, label_batch, self.weights[j])
#            for j in range(len(self.biases)):
#                self.biases_grad[j] = self.numerical_gradient(data_batch, label_batch, self.biases[j])

            # methond 2, get gradient from backpropagation algorithm
            self.gradient(data_batch, label_batch)
            
            for j in range(len(self.weights)):
                self.weights[j] -= learning_rate * self.weights_grad[j]
            for j in range(len(self.biases)):
                self.biases[j] -= learning_rate * self.biases[j]
    
    def accuracy(self, test_data, test_label):
        y = self.feedforward(test_data)
        y = numpy.argmax(y, axis = 1)
        l = numpy.argmax(test_label, axis = 1)
        return numpy.sum(y == l) / float(test_data.shape[0])

def Test():
    # two-layer network, 1st layer has 2 neurons, 2nd layer has 3 neurons
    net1 = Network(weights=[numpy.array([[0.2, 0.4, 0.6],[0.3, 0.5, 0.7]])], biases=[numpy.array([0.05, 0.04, 0.03])])
    result1 = net1.feedforward(numpy.array([0.8, 0.9]))  # [0.61774787 0.6921095  0.75767964]
    assert result1.ndim == 1
    assert result1.shape[0] == 3
    assert numpy.absolute(1-numpy.sum(result1)) < delta

    # three-layer network, 1st layer has 2 neurons, 2nd layer has 3 neurons, 3rd layer has 4 neurons
    net2 = Network([2, 3, 4])
    result2 = net2.feedforward(numpy.array([0.8, 0.9]))  # [0.59802211 0.59676878 0.59802211 0.59676878]
    assert result2.ndim == 1
    assert result2.shape[0] == 4
    assert numpy.absolute(1-numpy.sum(result2)) < delta

    s1D = softmax(numpy.array([1010, 1000, 990]))
    assert numpy.sum(s1D) == 1
    s2D = softmax(numpy.array([[1010, 1000, 990], [0.3, 2.9, 4.0]]))
    assert s2D.shape == (2,3)
    assert numpy.absolute(1-numpy.sum(s2D, axis=1)).all() < delta

    y = [0.1, 0.05, 0.6, 0.0, 0.05, 0.1, 0.0, 0.1, 0.0, 0.0]
    t = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
    e = cross_entropy_error(numpy.array(y), numpy.array(t))
    assert numpy.absolute(e-0.510825457099338) < delta
    y2 = [0.1, 0.05, 0.1, 0.0, 0.05, 0.1, 0.0, 0.6, 0.0, 0.0]
    e2 = cross_entropy_error(numpy.array(y2), numpy.array(t))
    assert numpy.absolute(e2-2.302584092994546) < delta
    e2D = cross_entropy_error(numpy.array([y, y2]), numpy.array([t, t]))
    assert numpy.absolute((e+e2)/2-e2D) < delta

            
if __name__ == '__main__':
#    Test()

    mnist_loader = MNIST_loader('c:/users/leca/Downloads/mnist/train-images.idx3-ubyte', 'c:/users/leca/Downloads/mnist/train-labels.idx1-ubyte', 
            'c:/users/leca/Downloads/mnist/t10k-images.idx3-ubyte', 'c:/users/leca/Downloads/mnist/t10k-labels.idx1-ubyte')
    print("mnist loader is done")
    nn = Network([784, 50, 10])
    nn.train(mnist_loader.train_data, mnist_loader.train_label)
    accuracy = nn.accuracy(mnist_loader.test_data, mnist_loader.test_label)
    print("accuracy:"+str(accuracy))
