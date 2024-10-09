let video = null;
let detector = null;
let detections = [];
let videoVisibility = true;
let detecting = false;

const toggleVideoE1 = document.getElementById('toggleVideoE1');
const toggleDetectingE1 = document.getElementById('toggleDetectingE1');

document.body.style.cursor = 'wait';

function preload() {
    detector = ml5.objectDetector('cocossd');
    console.log('detector object is loaded');
}

function setup() {
    createCanvas(640, 480);

    video = createCapture(VIDEO);
    video.size(640, 480);
    console.log('video element is created');
    video.elt.addEventListener('loadeddata', function() {
        if (video.elt.readyState >= 2) {
            document.body.style.cursor = 'default';
            console.log('video element is ready! Click "Start Detecting" to see the image');
        }
    })
}

function toggleVideo() {
    if (!video) return;
    if (videoVisibility) {
        video.hide();
        toggleVideoE1.innerText = 'Show video';
    } else {
        video.show();
        toggleVideoE1.innerText = 'Hide Video';
    }
    videoVisibility = !videoVisibility;
}

function toggleDetecting() {
    if (!video || !detector) return;
    if (!detecting) {
        detect();
        toggleDetectingE1.innerText = 'Stop Detecting';
    } else {
        toggleDetectingE1.innerText = 'Start Detecting';
    }
    detecting = !detecting;
}

function detect() {
    detector.detect(video, onDetected);
}

function onDetected(error, results) {
    if (error) {
        console.error(error);
    }
    detections = results;

    if (detecting) {
        detect();
    }
}

// the draw() function continuously executes until the noLoop() function is called
function draw() {
    if (!video || !detecting) return;
    // draw video frame to canvas and place it at the top-left corner
    image(video, 0, 0);
    // draw all detected objects to the canvas
    for (let i = 0; i < detections.length; i++) {
      drawResult(detections[i]);
    }
  }
  
  function drawResult(object) {
    drawBoundingBox(object);
    drawLabel(object);
  }
  
  // draw bounding box around the detected object
  function drawBoundingBox(object) {
    // Sets the color used to draw lines.
    stroke('green');
    // width of the stroke
    strokeWeight(4);
    // Disables filling geometry
    noFill();
    // draw an rectangle
    // x and y are the coordinates of upper-left corner, followed by width and height
    rect(object.x, object.y, object.width, object.height);
  }
  
  // draw label of the detected object (inside the box)
  function drawLabel(object) {
    // Disables drawing the stroke
    noStroke();
    // sets the color used to fill shapes
    fill('white');
    // set font size
    textSize(24);
    // draw string to canvas
    text(object.label, object.x + 10, object.y + 24);
  }