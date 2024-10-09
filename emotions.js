// MediaPipe
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver } = vision;

let player;
let faceLandmarker;

async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1,
  });
}

const webcam = document.getElementById("webcam");
const detectionResults = document.getElementById("detection-results");

async function predictWebcam() {
  let lastVideoTime = -1;
  let results = undefined;
  let startTimeMs = performance.now();

  if (lastVideoTime !== webcam.currentTime) {
    lastVideoTime = webcam.currentTime;
    results = faceLandmarker.detectForVideo(webcam, startTimeMs);
  }
  if (results?.faceBlendshapes && results.faceBlendshapes[0]) {
    // DISPLAY
    let htmlMaker = "";
    results.faceBlendshapes[0].categories.forEach((shape) => {
      htmlMaker += `
        <li class="blend-shapes-item" style="${
          shape.score > 0.6 ? "background: green" : ""
        }">
          <span class="blend-shapes-label">${
            shape.displayName || shape.categoryName
          }</span>
          <span class="blend-shapes-value" style="width: calc(${
            +shape.score * 100
          }% - 120px)">${(+shape.score).toFixed(4)}</span>
        </li>
      `;
    });
    if (detectionResults) detectionResults.innerHTML = htmlMaker;

    // PLAY
    const smile = results.faceBlendshapes[0].categories.find(
      (shape) =>
        shape.categoryName === "mouthSmileLeft" ||
        shape.displayName === "mouthSmileLeft"
    )?.score;
    if (smile && smile > 0.6) player.play();

    // PAUSE
    const kiss = results.faceBlendshapes[0].categories.find(
      (shape) =>
        shape.categoryName === "mouthPucker" ||
        shape.displayName === "mouthPucker"
    )?.score;
    if (kiss && kiss > 0.6) player.pause();
  }

  window.requestAnimationFrame(predictWebcam);
}

async function run() {
  player = new PlayerSdk("#video", {
    id: "vi5fv44Hol1jFrCovyktAJS9",
    muted: true,
  });
  await createFaceLandmarker();

  if (
    faceLandmarker &&
    !!(navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia) &&
    webcam &&
    player
  ) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      webcam.srcObject = stream;
      webcam.addEventListener("loadeddata", predictWebcam);
    });
  }
}

document.addEventListener("DOMContentLoaded", run);