const video = document.getElementById('video');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo);

function startVideo(){
    navigator.getUserMedia({
        video:{}},
        stream => video.srcObject = stream,
        err=>console.error(err)
    )
}

video.addEventListener('play',()=>{
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height}
    console.log('video started...');

    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        const detetctions = await faceapi.detectAllFaces(video,
            new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            //console.log(detetctions);
            const resizeDetections = faceapi.resizeResults(detetctions, displaySize);
            canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
            faceapi.draw.drawDetections(canvas, resizeDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizeDetections);
    },100);
})