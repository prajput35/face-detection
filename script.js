const video = document.getElementById('video');

let predictedAges = [];

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models'),
    faceapi.nets.ageGenderNet.loadFromUri('./models')
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
            new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
            //console.log(detetctions);
            const resizeDetections = faceapi.resizeResults(detetctions, displaySize);
            canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
            faceapi.draw.drawDetections(canvas, resizeDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizeDetections);
            console.log(resizeDetections);
            const age = resizeDetections[0].age!=null?resizeDetections[0].age: 35;
            const interpolatedAge = interpolateAgePredictions(age);
            const bottomRight = {
                x: resizeDetections[0].detection.box.bottomRight.x - 50,
                y: resizeDetections[0].detection.box.bottomRight.y
            }
            new faceapi.draw.DrawTextField(
                [`${resizeDetections[0].gender} ${faceapi.utils.round(resizeDetections[0].age,0)} years`],
                bottomRight
            ).draw(canvas);

    },100);
});

function interpolateAgePredictions(age){
    predictedAges = [age].concat(predictedAges).slice(0,30);
    const avgPredictedAge = predictedAges.reduce((total, a)=>(total+a)/predictedAges.length);

    return avgPredictedAge;
}