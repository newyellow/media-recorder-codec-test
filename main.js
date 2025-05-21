// List of common codecs to test
const codecs = [
    'video/webm',
    'video/webm;codecs=vp8',
    'video/webm;codecs=vp9',
    'video/webm;codecs=h264',
    'video/mp4',
    'video/mp4;codecs=h264',
    'video/mp4;codecs=avc1',
    'video/ogg',
    'video/ogg;codecs=theora',
];

// Function to get browser information
function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "Unknown";

    // Detect browser
    if (userAgent.indexOf("Firefox") > -1) {
        browserName = "Firefox";
        browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("Chrome") > -1) {
        browserName = "Chrome";
        browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("Safari") > -1) {
        browserName = "Safari";
        browserVersion = userAgent.match(/Version\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("Edge") > -1) {
        browserName = "Edge";
        browserVersion = userAgent.match(/Edge\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) {
        browserName = "Internet Explorer";
        browserVersion = userAgent.match(/(?:MSIE |rv:)([0-9.]+)/)[1];
    }

    return { browserName, browserVersion };
}

// Function to get device information
function getDeviceInfo() {
    const info = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        colorDepth: `${window.screen.colorDepth} bit`,
        ...getBrowserInfo()
    };
    return info;
}

// Function to create device info display
function createDeviceInfoDisplay() {
    const deviceInfo = getDeviceInfo();
    const container = document.getElementById('deviceInfo');
    
    const infoItems = [
        { label: 'Browser', value: `${deviceInfo.browserName} ${deviceInfo.browserVersion}` },
        { label: 'Platform', value: deviceInfo.platform },
        { label: 'Language', value: deviceInfo.language },
        { label: 'Screen Resolution', value: deviceInfo.screenResolution },
        { label: 'Color Depth', value: deviceInfo.colorDepth },
        { label: 'User Agent', value: deviceInfo.userAgent }
    ];

    infoItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'info-item';
        
        const label = document.createElement('span');
        label.className = 'info-label';
        label.textContent = item.label;
        
        const value = document.createElement('span');
        value.textContent = item.value;
        
        // Add special styling for User Agent to handle long text
        if (item.label === 'User Agent') {
            value.style.wordBreak = 'break-all';
            value.style.fontSize = '0.9em';
            value.style.color = '#666';
        }
        
        div.appendChild(label);
        div.appendChild(value);
        container.appendChild(div);
    });
}

// Function to check if MediaRecorder is supported
function isMediaRecorderSupported() {
    return typeof MediaRecorder !== 'undefined';
}

// Function to create a codec list item
function createCodecItem(codec) {
    const li = document.createElement('li');
    li.className = 'codec-item';
    
    const codecName = document.createElement('span');
    codecName.textContent = codec;
    
    const status = document.createElement('span');
    const isSupported = MediaRecorder.isTypeSupported(codec);
    status.textContent = isSupported ? '✓' : '✗';
    status.className = isSupported ? 'supported' : 'unsupported';
    
    li.appendChild(codecName);
    li.appendChild(status);

    // Add Test Record button if supported and camera is available
    if (isSupported) {
        const recordBtn = document.createElement('button');
        recordBtn.textContent = 'Test Record';
        recordBtn.style.marginLeft = '16px';
        recordBtn.onclick = () => testRecord(codec, recordBtn);
        li.appendChild(recordBtn);
    }
    return li;
}

// Function to record 2 seconds of video and download it
async function testRecord(codec, button) {
    if (!videoStream) {
        alert('Camera is not active.');
        return;
    }
    button.disabled = true;
    button.textContent = 'Recording...';
    try {
        const options = { mimeType: codec };
        const recorder = new MediaRecorder(videoStream, options);
        const chunks = [];
        recorder.ondataavailable = e => {
            if (e.data && e.data.size > 0) {
                chunks.push(e.data);
            }
        };
        recorder.start();
        await new Promise(resolve => setTimeout(resolve, 2000));
        recorder.stop();
        await new Promise(resolve => {
            recorder.onstop = resolve;
        });
        console.log(codec);
        const blob = new Blob(chunks, { type: codec });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;

        // Determine file extension based on codec
        let extension = 'webm'; // default
        if (codec.startsWith('video/mp4') || codec.startsWith('audio/mp4')) {
            extension = 'mp4';
        } else if (codec.startsWith('video/ogg') || codec.startsWith('audio/ogg')) {
            extension = 'ogv';
        }
        
        a.download = `record-${codec.replace(/[^a-z0-9]+/gi, '_')}.${extension}`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (err) {
        alert('Recording failed: ' + err.message);
    } finally {
        button.disabled = false;
        button.textContent = 'Test Record';
    }
}

// Initialize the codec list
function initCodecList() {
    const codecList = document.getElementById('codecList');
    
    if (!isMediaRecorderSupported()) {
        const errorMessage = document.createElement('li');
        errorMessage.textContent = 'MediaRecorder is not supported in this browser';
        errorMessage.className = 'codec-item unsupported';
        codecList.appendChild(errorMessage);
        return;
    }
    
    codecs.forEach(codec => {
        codecList.appendChild(createCodecItem(codec));
    });
}

// Camera handling
let videoStream = null;
let animationFrameId = null;

async function setupCamera() {
    const canvas = document.getElementById('cameraCanvas');
    const ctx = canvas.getContext('2d');
    const statusElement = document.getElementById('cameraStatus');

    try {
        // Request camera access
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });

        // Create video element to capture the stream
        const video = document.createElement('video');
        video.srcObject = videoStream;
        video.autoplay = true;
        video.playsInline = true;

        // Wait for video to be ready
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve();
            };
        });

        // Start drawing the video feed to canvas
        function drawVideo() {
            if (videoStream) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                animationFrameId = requestAnimationFrame(drawVideo);
            }
        }

        drawVideo();
        statusElement.textContent = 'Camera active';
        statusElement.style.color = '#4CAF50';
    } catch (error) {
        console.error('Error accessing camera:', error);
        statusElement.textContent = 'Error accessing camera: ' + error.message;
        statusElement.style.color = '#f44336';
    }
}

// Clean up camera when page is unloaded
window.addEventListener('beforeunload', () => {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});

// Run the initialization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createDeviceInfoDisplay();
    initCodecList();
    setupCamera();
});
