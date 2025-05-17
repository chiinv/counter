const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const captureBtn = document.getElementById('capture');
const imageUpload = document.getElementById('imageUpload');
const result = document.getElementById('countResult');

let model;

// モデル読み込み
async function loadModel() {
  model = await cocoSsd.load();
}
loadModel();

// カメラ起動
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error('カメラ起動エラー:', err);
  });

// アップロード画像から解析
imageUpload.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    detectObjects(img);
  };
});

// 撮影ボタンクリック時にvideoの内容を解析
captureBtn.addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  detectObjects(canvas);
});

// 共通：物体検出ロジック
async function detectObjects(input) {
  const predictions = await model.detect(input);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(input, 0, 0);

  let count = 0;
  predictions.forEach(pred => {
    if (pred.score > 0.6) {
      count++;
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(...pred.bbox);
      ctx.font = '16px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText(pred.class, pred.bbox[0], pred.bbox[1] > 10 ? pred.bbox[1] - 5 : 10);
    }
  });
  result.innerText = `検出数: ${count}個`;
}