(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const data = document.querySelector('data')
const video = document.querySelector('video')
const canvas = document.querySelector('#mosaic')
const context = canvas.getContext('2d')


//
// HELPER FUNCTIONS 
// reduce r,g,b values to a single number
// decimal = 32 bit integer (signed), use bit shift to convert from rgb to int and back
//
function rgbToDecimal(red, green, blue) {
    let r = red & 0xFF;
    let g = green & 0xFF;
    let b = blue & 0xFF;
    return (r << 24) + (g << 16) + (b << 8) + (1); // alpha = 1
}

function decimalToRgb(decNumber) {
    let red = decNumber >> 24 & 0xFF;
    let green = decNumber >> 16 & 0xFF;
    let blue = decNumber >> 8 & 0xFF;
    let alpha = decNumber & 0xFF;
    console.log("rvs is " + red + "," + green + "," + blue)
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

// how many pixels in rows and columns - 10 means 100 values.
const numpixels = 10

let width
let height
let intervalid
let dataArray // remember the pixel values. use this as training data



function initSettings() {
    width = video.offsetWidth
    height = video.offsetHeight

    canvas.width = width
    canvas.height = height

    // we need pixelization
    context.mozImageSmoothingEnabled = false
    context.webkitImageSmoothingEnabled = false
    context.imageSmoothingEnabled = false

    // draw the webcam 60 times per second
    webcamSnapshot()

    // create array of pixel values every second
    intervalid = setInterval(() => generatePixelValues(), 1000)
}

//
// drawing the video very small causes pixelation. we need this to keep the array small.
// draw 60 times / second
//
function webcamSnapshot() {
    context.drawImage(video, 0, 0, numpixels, numpixels)
    context.drawImage(canvas, 0, 0, numpixels, numpixels, 0, 0, width, height)
    requestAnimationFrame(webcamSnapshot)
}


//
// generate an array with a color value for each pixel in the webcam feed
//
function generatePixelValues() {

    data.innerText = ""
    dataArray = []

    for (let pos = 0; pos < numpixels * numpixels; pos++) {
        let col = pos % numpixels
        let row = Math.floor(pos / numpixels)

        let x = col * (width / numpixels)
        let y = row * (height / numpixels)

        // sample locatie niet linksboven rect maar in het midden
        let p = context.getImageData(x + width / 20, y + height / 20, 1, 1).data

        // rgb waarde bij voorkeur als 1 decimal doorgeven, anders krijgt kNear drie losse waarden binnen of hexwaarde
        // console.log("rgb is " + p[0] + "," + p[1] + "," + p[2]);
        let decimalColor = rgbToDecimal(p[0], p[1], p[2])
        dataArray.push(decimalColor)

        // show values
        data.innerText += decimalColor + ", "
    }

}



//
// INITIALIZE THE WEBCAM
//
function initializeWebcam() {
    // docs: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ video: true })
            // permission granted:
            .then(function (stream) {
                video.srcObject = stream;
                video.addEventListener("playing", () => initSettings())
            })
            // permission denied:
            .catch(function (error) {
                document.body.textContent = 'Could not access the camera. Error: ' + error.name
            })
    }
}


var KNN = require('../node_modules/ml-knn/lib/index.js')
var knn 
var car = {}
var train_dataset = [
    
]
var train_labels = [

]

var fingerInput = document.getElementById('finger');
var snapshot = document.getElementById('snapshot');
snapshot.addEventListener('click', (e)=>{
    car[dataArray]=fingerInput.value 
    console.log(car)
})
var model = document.getElementById('model');
model.addEventListener('click', (e)=>{
    train_dataset=Object.keys(car)
    train_labels=Object.values(car)
    console.log(train_dataset, train_labels)

    knn = new KNN(train_dataset, train_labels, {k:2}); // consider 2 nearest neighbors
})
var predict = document.getElementById('predict');
predict.addEventListener('click', (e)=>{
    console.log( "prediction", knn.predict(dataArray))
})





initializeWebcam()

},{"../node_modules/ml-knn/lib/index.js":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function squaredEuclidean(p, q) {
    let d = 0;
    for (let i = 0; i < p.length; i++) {
        d += (p[i] - q[i]) * (p[i] - q[i]);
    }
    return d;
}
exports.squaredEuclidean = squaredEuclidean;
function euclidean(p, q) {
    return Math.sqrt(squaredEuclidean(p, q));
}
exports.euclidean = euclidean;

},{}],3:[function(require,module,exports){
'use strict';

var mlDistanceEuclidean = require('ml-distance-euclidean');

/*
 * Original code from:
 *
 * k-d Tree JavaScript - V 1.01
 *
 * https://github.com/ubilabs/kd-tree-javascript
 *
 * @author Mircea Pricop <pricop@ubilabs.net>, 2012
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
 * @author Ubilabs http://ubilabs.net, 2012
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

function Node(obj, dimension, parent) {
  this.obj = obj;
  this.left = null;
  this.right = null;
  this.parent = parent;
  this.dimension = dimension;
}

class KDTree {
  constructor(points, metric) {
    // If points is not an array, assume we're loading a pre-built tree
    if (!Array.isArray(points)) {
      this.dimensions = points.dimensions;
      this.root = points;
      restoreParent(this.root);
    } else {
      this.dimensions = new Array(points[0].length);
      for (var i = 0; i < this.dimensions.length; i++) {
        this.dimensions[i] = i;
      }
      this.root = buildTree(points, 0, null, this.dimensions);
    }
    this.metric = metric;
  }

  // Convert to a JSON serializable structure; this just requires removing
  // the `parent` property
  toJSON() {
    const result = toJSONImpl(this.root);
    result.dimensions = this.dimensions;
    return result;
  }

  nearest(point, maxNodes, maxDistance) {
    const metric = this.metric;
    const dimensions = this.dimensions;
    var i;

    const bestNodes = new BinaryHeap(function (e) {
      return -e[1];
    });

    function nearestSearch(node) {
      const dimension = dimensions[node.dimension];
      const ownDistance = metric(point, node.obj);
      const linearPoint = {};
      var bestChild, linearDistance, otherChild, i;

      function saveNode(node, distance) {
        bestNodes.push([node, distance]);
        if (bestNodes.size() > maxNodes) {
          bestNodes.pop();
        }
      }

      for (i = 0; i < dimensions.length; i += 1) {
        if (i === node.dimension) {
          linearPoint[dimensions[i]] = point[dimensions[i]];
        } else {
          linearPoint[dimensions[i]] = node.obj[dimensions[i]];
        }
      }

      linearDistance = metric(linearPoint, node.obj);

      if (node.right === null && node.left === null) {
        if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
          saveNode(node, ownDistance);
        }
        return;
      }

      if (node.right === null) {
        bestChild = node.left;
      } else if (node.left === null) {
        bestChild = node.right;
      } else {
        if (point[dimension] < node.obj[dimension]) {
          bestChild = node.left;
        } else {
          bestChild = node.right;
        }
      }

      nearestSearch(bestChild);

      if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
        saveNode(node, ownDistance);
      }

      if (
        bestNodes.size() < maxNodes ||
        Math.abs(linearDistance) < bestNodes.peek()[1]
      ) {
        if (bestChild === node.left) {
          otherChild = node.right;
        } else {
          otherChild = node.left;
        }
        if (otherChild !== null) {
          nearestSearch(otherChild);
        }
      }
    }

    if (maxDistance) {
      for (i = 0; i < maxNodes; i += 1) {
        bestNodes.push([null, maxDistance]);
      }
    }

    if (this.root) {
      nearestSearch(this.root);
    }

    const result = [];
    for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
      if (bestNodes.content[i][0]) {
        result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
      }
    }
    return result;
  }
}

function toJSONImpl(src) {
  const dest = new Node(src.obj, src.dimension, null);
  if (src.left) dest.left = toJSONImpl(src.left);
  if (src.right) dest.right = toJSONImpl(src.right);
  return dest;
}

function buildTree(points, depth, parent, dimensions) {
  const dim = depth % dimensions.length;

  if (points.length === 0) {
    return null;
  }
  if (points.length === 1) {
    return new Node(points[0], dim, parent);
  }

  points.sort((a, b) => a[dimensions[dim]] - b[dimensions[dim]]);

  const median = Math.floor(points.length / 2);
  const node = new Node(points[median], dim, parent);
  node.left = buildTree(points.slice(0, median), depth + 1, node, dimensions);
  node.right = buildTree(points.slice(median + 1), depth + 1, node, dimensions);

  return node;
}

function restoreParent(root) {
  if (root.left) {
    root.left.parent = root;
    restoreParent(root.left);
  }

  if (root.right) {
    root.right.parent = root;
    restoreParent(root.right);
  }
}

// Binary heap implementation from:
// http://eloquentjavascript.net/appendix2.html
class BinaryHeap {
  constructor(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  push(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  }

  pop() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  }

  peek() {
    return this.content[0];
  }

  size() {
    return this.content.length;
  }

  bubbleUp(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n];
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      const parentN = Math.floor((n + 1) / 2) - 1;
      const parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      } else {
        // Found a parent that is less, no need to move it further.
        break;
      }
    }
  }

  sinkDown(n) {
    // Look up the target element and its score.
    var length = this.content.length;
    var element = this.content[n];
    var elemScore = this.scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2;
      var child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N];
        var child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N];
        var child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      } else {
        // Otherwise, we are done.
        break;
      }
    }
  }
}

class KNN {
  /**
   * @param {Array} dataset
   * @param {Array} labels
   * @param {object} options
   * @param {number} [options.k=numberOfClasses + 1] - Number of neighbors to classify.
   * @param {function} [options.distance=euclideanDistance] - Distance function that takes two parameters.
   */
  constructor(dataset, labels, options = {}) {
    if (dataset === true) {
      const model = labels;
      this.kdTree = new KDTree(model.kdTree, options);
      this.k = model.k;
      this.classes = new Set(model.classes);
      this.isEuclidean = model.isEuclidean;
      return;
    }

    const classes = new Set(labels);

    const { distance = mlDistanceEuclidean.euclidean, k = classes.size + 1 } = options;

    const points = new Array(dataset.length);
    for (var i = 0; i < points.length; ++i) {
      points[i] = dataset[i].slice();
    }

    for (i = 0; i < labels.length; ++i) {
      points[i].push(labels[i]);
    }

    this.kdTree = new KDTree(points, distance);
    this.k = k;
    this.classes = classes;
    this.isEuclidean = distance === mlDistanceEuclidean.euclidean;
  }

  /**
   * Create a new KNN instance with the given model.
   * @param {object} model
   * @param {function} distance=euclideanDistance - distance function must be provided if the model wasn't trained with euclidean distance.
   * @return {KNN}
   */
  static load(model, distance = mlDistanceEuclidean.euclidean) {
    if (model.name !== 'KNN') {
      throw new Error(`invalid model: ${model.name}`);
    }
    if (!model.isEuclidean && distance === mlDistanceEuclidean.euclidean) {
      throw new Error(
        'a custom distance function was used to create the model. Please provide it again'
      );
    }
    if (model.isEuclidean && distance !== mlDistanceEuclidean.euclidean) {
      throw new Error(
        'the model was created with the default distance function. Do not load it with another one'
      );
    }
    return new KNN(true, model, distance);
  }

  /**
   * Return a JSON containing the kd-tree model.
   * @return {object} JSON KNN model.
   */
  toJSON() {
    return {
      name: 'KNN',
      kdTree: this.kdTree,
      k: this.k,
      classes: Array.from(this.classes),
      isEuclidean: this.isEuclidean
    };
  }

  /**
   * Predicts the output given the matrix to predict.
   * @param {Array} dataset
   * @return {Array} predictions
   */
  predict(dataset) {
    if (Array.isArray(dataset)) {
      if (typeof dataset[0] === 'number') {
        return getSinglePrediction(this, dataset);
      } else if (
        Array.isArray(dataset[0]) &&
        typeof dataset[0][0] === 'number'
      ) {
        const predictions = new Array(dataset.length);
        for (var i = 0; i < dataset.length; i++) {
          predictions[i] = getSinglePrediction(this, dataset[i]);
        }
        return predictions;
      }
    }
    throw new TypeError('dataset to predict must be an array or a matrix');
  }
}

function getSinglePrediction(knn, currentCase) {
  var nearestPoints = knn.kdTree.nearest(currentCase, knn.k);
  var pointsPerClass = {};
  var predictedClass = -1;
  var maxPoints = -1;
  var lastElement = nearestPoints[0][0].length - 1;

  for (var element of knn.classes) {
    pointsPerClass[element] = 0;
  }

  for (var i = 0; i < nearestPoints.length; ++i) {
    var currentClass = nearestPoints[i][0][lastElement];
    var currentPoints = ++pointsPerClass[currentClass];
    if (currentPoints > maxPoints) {
      predictedClass = currentClass;
      maxPoints = currentPoints;
    }
  }

  return predictedClass;
}

module.exports = KNN;

},{"ml-distance-euclidean":2}]},{},[1]);
