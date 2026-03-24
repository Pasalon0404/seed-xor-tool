import QRCode from 'qrcode';

document.getElementById('theme-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const html = document.documentElement;
    if (html.getAttribute('data-theme') === 'light') {
        html.removeAttribute('data-theme'); localStorage.setItem('safekeepTheme', 'dark'); e.target.innerText = '☀️';
    } else {
        html.setAttribute('data-theme', 'light'); localStorage.setItem('safekeepTheme', 'light'); e.target.innerText = '🌙';
    }
});
if (localStorage.getItem('safekeepTheme') === 'light') document.getElementById('theme-btn').innerText = '🌙';

let transferInterval = null;
let fileChunks = [];
let currentChunk = 0;
let totalChunks = 0;
let isTransferring = false;
let currentLoop = 0;
let originalFile = null;

document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        originalFile = file;
        document.getElementById('startBtn').disabled = false;
        const infoBox = document.getElementById('fileInfo');
        infoBox.innerHTML = `Loaded: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(2)} KB)`;
        infoBox.style.display = 'block';
    }
});

document.getElementById('startBtn').addEventListener('click', async () => {
    const chunkSize = parseInt(document.getElementById('chunkSize').value);
    const fps = parseInt(document.getElementById('fps').value);
    
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'block';
    document.getElementById('qrDisplayContainer').style.display = 'block';
    
    fileChunks = await splitFileToChunks(originalFile, chunkSize);
    totalChunks = fileChunks.length;
    isTransferring = true;
    currentChunk = 0;
    currentLoop = 0;

    startContinuousLoop(fps);
});

document.getElementById('stopBtn').addEventListener('click', () => {
    isTransferring = false;
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('stopBtn').style.display = 'none';
    document.getElementById('progressBar').style.width = '0%';
});

function startContinuousLoop(fps) {
    const frameDelay = 1000 / fps;
    
    function runLoop() {
        if (!isTransferring) return;
        
        if (currentChunk < totalChunks) {
            sendChunk(fileChunks[currentChunk], currentChunk, totalChunks);
            currentChunk++;
            document.getElementById('progressBar').style.width = `${(currentChunk / totalChunks) * 100}%`;
            setTimeout(runLoop, frameDelay);
        } else {
            currentLoop++;
            currentChunk = 0;
            document.getElementById('progressBar').style.width = '0%';
            setTimeout(runLoop, 500); // 500ms pause between full loops
        }
    }
    runLoop();
}

async function splitFileToChunks(file, chunkSize) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const uint8Array = new Uint8Array(e.target.result);
            const chunks = [];
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
                const chunk = uint8Array.slice(i, i + chunkSize);
                chunks.push({
                    data: arrayBufferToBase64(chunk),
                    checksum: calculateSimpleChecksum(chunk)
                });
            }
            resolve(chunks);
        };
        reader.readAsArrayBuffer(file);
    });
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) { binary += String.fromCharCode(bytes[i]); }
    return window.btoa(binary);
}

function calculateSimpleChecksum(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    return sum.toString(16).padStart(8, '0');
}

function sendChunk(chunk, index, total) {
    const fileName = originalFile.name;
    const lastDotIndex = fileName.lastIndexOf('.');
    const baseName = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
    const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1) : '';
    const mimeType = originalFile.type || 'application/octet-stream';
    
    const qrData = `${currentLoop}/${index}/${total}~${encodeURIComponent(baseName)}~${encodeURIComponent(extension)}~${mimeType}~${chunk.data}~${chunk.checksum}`;
    
    const canvas = document.getElementById('qrCanvas');
    
    // We now use the imported Vite module directly!
    QRCode.toCanvas(canvas, qrData, {
        width: 700, // <--- Doubled the size here for better optical clarity
        margin: 2,
        errorCorrectionLevel: 'L',
        color: { dark: '#000000', light: '#ffffff' }
    }, function (error) {
        if (error) console.error(error);
    });
    
    document.getElementById('qrInfo').textContent = `Loop ${currentLoop + 1} | Chunk ${index + 1}/${total}`;
}