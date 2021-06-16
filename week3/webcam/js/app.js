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

console.log('test')

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
