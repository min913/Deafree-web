// 구글 클라이언트 라이브러리를 사용하도록 변경
import { SpeechClient } from '@google-cloud/speech';

const transcript = document.getElementById('transcript');
const loginBtn = document.getElementById('login-btn');
const increaseSizeBtn = document.getElementById('increase-size-btn');
const decreaseSizeBtn = document.getElementById('decrease-size-btn');

const client = new SpeechClient({
  keyFile: '\studied-setting-388315-28e773b95fae.json', // 다운로드 받은 json 파일의 경로를 입력
  projectId: 'studied-setting-388315', // 프로젝트 ID 입력
});

recognition.addEventListener('result', async event => {
  const transcriptArr = Array.from(event.results)
    .map(result => result[0])
    .map(result => result.transcript);
  const finalTranscript = transcriptArr.join('');
  transcript.textContent = finalTranscript;

  if (event.results[0].isFinal) {
    try {
      const response = await fetch('https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyAtS4C0Iayc899HiwPV4p2Tr-ZSbTKbUaw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: {
            content: event.results[0][0].transcript,
          },
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'ko-KR',
          },
        }),
      });

      const data = await response.json();
      const result = data.results.map(result => result.alternatives[0].transcript).join('');
      transcript.textContent = result;
    } catch (err) {
      console.log(err);
    }
  }
});

const toggleRecognitionBtn = document.getElementById('toggle-recognition');

let isRecognizing = false;

function toggleRecognition() {
  isRecognizing = !isRecognizing;

  if (isRecognizing) {
    toggleRecognitionBtn.textContent = '음성 인식 중지';
    recognition.start();
  } else {
    toggleRecognitionBtn.textContent = '음성 인식 시작';
    recognition.stop();
  }
}

toggleRecognitionBtn.addEventListener('click', () => {
  toggleRecognition();
});

let size = 24;

function increaseSize() {
  size += 2;
  transcript.style.fontSize = `${size}px`;
}

function decreaseSize() {
  size -= 2;
  transcript.style.fontSize = `${size}px`;
}

function showModal() {
  const modal = document.createElement('div');
  modal.classList.add('login-modal');

  const form = document.createElement('form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');
    authenticate(username, password);
  });

  const h2 = document.createElement('h2');
  h2.textContent = '로그인';

  const usernameInputWrapper = document.createElement('div');
  usernameInputWrapper.classList.add('input-wrapper');
  const usernameLabel = document.createElement('label');
  usernameLabel.textContent = '아이디:';
  const usernameInput = document.createElement('input');
  usernameInput.setAttribute('type', 'text');
  usernameInput.setAttribute('name', 'username');
  usernameInputWrapper.appendChild(usernameLabel);
  usernameInputWrapper.appendChild(usernameInput);

  const passwordInputWrapper = document.createElement('div');
  passwordInputWrapper.classList.add('input-wrapper');
  const passwordLabel = document.createElement('label');
  passwordLabel.textContent = '비밀번호:';
  const passwordInput = document.createElement('input');
  passwordInput.setAttribute('type', 'password');
  passwordInput.setAttribute('name', 'password');
  passwordInputWrapper.appendChild(passwordLabel);
  passwordInputWrapper.appendChild(passwordInput);

  const submitBtn = document.createElement('button');
  submitBtn.textContent = '로그인';

  form.appendChild(h2);
  form.appendChild(usernameInputWrapper);
  form.appendChild(passwordInputWrapper);
  form.appendChild(submitBtn);

  modal.appendChild(form);
  document.body.appendChild(modal);
}

async function authenticate(username, password) {
  // 여기에 로그인 과정이 구현됩니다.
  loginBtn.textContent = `${username}으로 로그인됨`;
  closeLoginModal();
}

function closeLoginModal() {
  const modal = document.querySelector('.login-modal');
  if (modal) {
    modal.remove();
  }
}

recognition.addEventListener('result', async event => {
  const transcriptArr = Array.from(event.results)
    .map(result => result[0])
    .map(result => result.transcript);
  const finalTranscript = transcriptArr.join('');
  transcript.textContent = finalTranscript;

  if (event.results[0].isFinal) {
    try {
      const [response] = await client.recognize({
        audio: {
          content: event.results[0][0].transcript,
        },
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'ko-KR',
        },
      });
      const result = response.results.map(result => result.alternatives[0].transcript).join('');
      transcript.textContent = result;
    } catch (err) {
      console.log(err);
    }
  }
});

recognition.addEventListener('end', () => {
  recognition.start();
});

loginBtn.addEventListener('click', () => {
  showModal();
});

increaseSizeBtn.addEventListener('click', () => {
  increaseSize();
});

decreaseSizeBtn.addEventListener('click', () => {
  decreaseSize();
});

transcript.addEventListener('dblclick', () => {
  transcript.textContent = '음성인식 결과가 여기에 표시됩니다.';
});

recognition.start();
