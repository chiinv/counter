const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const captureBtn = document.getElementById('capture');
const imageUpload = document.getElementById('imageUpload');
const result = document.getElementById('countResult');

let model;

async function loadModel() {
  model = await cocoSsd.load();
}
loadModel();

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error('カメラ起動エラー:', err);
  });

imageUpload.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    detectObjects(img);
  };
});

captureBtn.addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  detectObjects(canvas);
});

async function detectObjects(input) {
  const predictions = await model.detect(input);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(input, 0, 0);

  const classCounts = {};

  predictions.forEach(pred => {
    if (pred.score > 0.6) {
      // バウンディングボックス
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(...pred.bbox);

      // ラベルテキスト
      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(pred.class, pred.bbox[0], pred.bbox[1] > 10 ? pred.bbox[1] - 5 : 10);

      classCounts[pred.class] = (classCounts[pred.class] || 0) + 1;
    }
  });

  if (Object.keys(classCounts).length === 0) {
    result.innerHTML = "検出されたオブジェクトはありません。";
    return;
  }

  const countText = Object.entries(classCounts)
    .map(([label, count]) => `${label}: ${count}個`)
    .join("<br>");
  result.innerHTML = `<b>検出結果:</b><br>${countText}`;
}