let speechRecognition;
let currentTranscript = '';
let finalTranscript = '';

function setupAudioNodes(stream) {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);

    return { analyser, javascriptNode };
}

function monitorVolumeMeter() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            const { analyser, javascriptNode } = setupAudioNodes(stream);
            const volumeMeter = document.getElementById('volume-meter');

            javascriptNode.onaudioprocess = () => {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                const values = array.reduce((a, b) => a + b);
                const volume = values / array.length;
                volumeMeter.value = volume;

                if (speechRecognition && speechRecognition.speaking) {
                    speechRecognition.onaudioend = () => {
                        monitorVolumeMeter();
                    };
                }
            };
        });
}

function getSpeechRecognition() {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;

    recognition.addEventListener('result', (event) => {
        currentTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                currentTranscript += event.results[i][0].transcript;
            }
        }
        updateOutput();
    });

    recognition.addEventListener('end', () => {
        monitorVolumeMeter();
    });

    return recognition;
}

function updateOutput() {
    const outputElem = document.getElementById('output');
    outputElem.innerText = finalTranscript + currentTranscript;
}

document.getElementById('start').addEventListener('click', () => {
    if (!speechRecognition || speechRecognition && speechRecognition.state === 'inactive') {
        speechRecognition = getSpeechRecognition();
        speechRecognition.start();
    }
});

document.getElementById('stop').addEventListener('click', () => {
    if (speechRecognition && speechRecognition.state !== 'inactive') {
        speechRecognition.stop();
    }
});

monitorVolumeMeter();
