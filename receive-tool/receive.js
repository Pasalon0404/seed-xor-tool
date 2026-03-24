import { Html5Qrcode } from 'html5-qrcode';

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

let html5QrCode = null;
let receivedChunks = new Map();
let totalChunks = null;
let originalFilename = "";
let originalExtension = "";
let originalMimeType = "";
let completedFileBlob = null;

document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('cameraBox').style.display = 'block';
    document.getElementById('startBtn').style.display = 'none';
    
    receivedChunks.clear();
    totalChunks = null;
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('chunkCount').innerText = '0 / 0';
    document.getElementById('incomingFileName').innerText = 'Scanning...';

    // Using the imported Vite module directly!
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 300, height: 300 } },
        (decodedText) => { processQRData(decodedText); },
        (errorMessage) => { /* ignore */ }
    ).catch(err => alert("Camera error: " + err));
});

document.getElementById('stopBtn').addEventListener('click', () => {
    if(html5QrCode) {
        html5QrCode.stop().then(() => {
            document.getElementById('cameraBox').style.display = 'none';
            document.getElementById('startBtn').style.display = 'block';
        });
    }
});

function processQRData(qrData) {
    try {
        const parts = qrData.split('~');
        if (parts.length !== 6) return;
        
        const sequenceInfo = parts[0].split('/');
        const index = parseInt(sequenceInfo[1]);
        const total = parseInt(sequenceInfo[2]);
        const filename = decodeURIComponent(parts[1]);
        const extension = decodeURIComponent(parts[2]);
        const mimeType = parts[3];
        const data = parts[4];
        const checksum = parts[5];
        
        if (totalChunks === null) {
            totalChunks = total;
            originalFilename = filename;
            originalExtension = extension;
            originalMimeType = mimeType;
            document.getElementById('incomingFileName').innerText = `${filename}.${extension}`;
        }
        
        if (!receivedChunks.has(index)) {
            const dataBytes = base64ToArrayBuffer(data);
            if (calculateSimpleChecksum(dataBytes) === checksum) {
                receivedChunks.set(index, data);
                
                document.getElementById('chunkCount').innerText = `${receivedChunks.size} / ${totalChunks}`;
                document.getElementById('progressBar').style.width = `${(receivedChunks.size / totalChunks) * 100}%`;
                
                if (receivedChunks.size === totalChunks) onTransferComplete();
            }
        }
    } catch (e) { console.error('Parse error:', e); }
}

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
    return bytes;
}

function calculateSimpleChecksum(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    return sum.toString(16).padStart(8, '0');
}

function onTransferComplete() {
    if(html5QrCode) {
        html5QrCode.stop();
        document.getElementById('cameraBox').style.display = 'none';
        document.getElementById('startBtn').style.display = 'block';
    }

    const allBytes = [];
    for (let i = 0; i < totalChunks; i++) {
        const chunkBytes = base64ToArrayBuffer(receivedChunks.get(i));
        for (let j = 0; j < chunkBytes.length; j++) allBytes.push(chunkBytes[j]);
    }
    
    completedFileBlob = new Blob([new Uint8Array(allBytes)], { type: originalMimeType });
    
    const suggestedName = originalExtension ? `${originalFilename}.${originalExtension}` : originalFilename;
    document.getElementById('modalFileDetails').innerText = suggestedName;
    document.getElementById('filenameInput').value = suggestedName;
    
    document.getElementById('downloadModal').style.display = 'flex';
}

document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('downloadModal').style.display = 'none';
});

document.getElementById('btn-download').addEventListener('click', () => {
    const filename = document.getElementById('filenameInput').value.trim() || 'received_file';
    const url = URL.createObjectURL(completedFileBlob);
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.getElementById('downloadModal').style.display = 'none';
});