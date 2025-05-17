const imageUpload = document.getElementById('imageUpload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const result = document.getElementById('countResult');

let model;

async function loadModel() {
  model = await cocoSsd.load();
}
loadModel();

imageUpload.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const predictions = await model.detect(img);

    ctx.font = '18px Arial';
    let count = 0;
    for (let p of predictions) {
      if (p.score > 0.6) {
        count++;
        ctx.beginPath();
        ctx.rect(...p.bbox);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillText(`${p.class} (${Math.round(p.score * 100)}%)`, p.bbox[0], p.bbox[1] > 10 ? p.bbox[1] - 5 : 10);
      }
    }
    result.innerText = `検出数: ${count}個`;
  };
});