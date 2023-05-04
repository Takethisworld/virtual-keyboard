import './style/main.scss';

const link = document.createElement('link');
link.rel = 'icon';
link.href = 'assets/keyboard-key.png';
document.head.appendChild(link);

const preloader = document.createElement('div');
preloader.className = 'preloader';
document.body.append(preloader);

const preloaderPhrase = 'virtual keyboard';

for (let i = 0; i < preloaderPhrase.length; i += 1) {
  const spanPreloader = document.createElement('span');
  spanPreloader.className = `let${i + 1}`;
  spanPreloader.innerHTML = preloaderPhrase[i];

  preloader.append(spanPreloader);
}

window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.add('loaded_hiding');
    window.setTimeout(() => {
      document.body.classList.add('loaded');
      document.body.classList.remove('loaded_hiding');
    }, 300);
  }, 2300);
});

const shiftLeft = 'ShiftLeft';
const shiftRight = 'ShiftRight';

let activeLang = localStorage.getItem('lang') ? localStorage.getItem('lang') : 'ru';
localStorage.setItem('lang', activeLang);

const textarea = document.createElement('textarea');
textarea.cols = 91;
textarea.rows = 10;
textarea.wrap = '\n';
document.body.append(textarea);
setInterval(() => {
  textarea.focus();
}, 0);

const keyboard = document.createElement('div');
keyboard.className = 'keyboard';
document.body.append(keyboard);

let capsPressed = false;

const currentKeyboard = {};
let keysOnPage;

const apiUrl = 'https://api.unsplash.com/photos/random?query=mountain&client_id=rUN6SVBzNg2SgWb6g-O7jaDK7koUVbBEMhiD2Q2Ddb4&orientation=landscape';

async function getBgImage() {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    document.body.style.backgroundImage = `url(${data.urls.raw +"&w=1300&dpr=2"})`;
  } catch {
    document.body.style.backgroundImage = 'url(\'../assets/images/aaron-burden-uyJ-osS2YQI-unsplash.jpg\')';
  }
}
getBgImage();

async function getData() {
  const keyboardData = 'assets/keyboard.json';
  const res = await fetch(keyboardData);
  const data = await res.json();

  return data;
}

function changeCurrentKeyboard(language, shift = false) {
  getData().then((result) => {
    result[language].forEach((key) => {
      if (!document.getElementById(key.eventCode)) {
        const newKey = document.createElement('div');
        newKey.className = key.type;
        newKey.id = key.eventCode;
        newKey.innerHTML = key.character;

        keyboard.append(newKey);

        newKey.addEventListener('mousedown', () => {
          if (newKey.id === shiftLeft || newKey.id === shiftRight) textarea.dispatchEvent(new KeyboardEvent('keydown', { key: currentKeyboard[newKey.id].character, code: newKey.id, shiftKey: true }));
          else if (currentKeyboard[newKey.id].type === 'functional' || currentKeyboard[newKey.id].type === 'spacing') textarea.dispatchEvent(new KeyboardEvent('keydown', { key: currentKeyboard[newKey.id].character, code: newKey.id }));
          else textarea.dispatchEvent(new KeyboardEvent('keydown', { code: newKey.id }));
        });
        newKey.addEventListener('mouseup', () => {
          if (newKey.id === shiftLeft || shiftRight) textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', code: newKey.id, shiftKey: false }));
          else if (currentKeyboard[newKey.id].type === 'functional') textarea.dispatchEvent(new KeyboardEvent('keyup', { key: currentKeyboard[newKey.id].character, code: newKey.id }));
          else textarea.dispatchEvent(new KeyboardEvent('keyup', { code: newKey.id }));
        });
        keysOnPage = [...document.querySelectorAll('.keyboard div')];
      } else {
        document.getElementById(key.eventCode).innerHTML = key.character;
        if (shift) Shift(true, capsPressed);
        else if (capsPressed) CapsLock(capsPressed);
      }

      currentKeyboard[key.eventCode] = key;
      textarea.placeholder = activeLang === 'ru' ? 'Клавиатура создана в операционной системе Windows\nДля переключения языка комбинация: левыe ctrl + alt' : 'The keyboard was created in the Windows operating system\nCombination to switch the language: left ctrl + alt';
    });
  });
}

changeCurrentKeyboard(activeLang);


textarea.addEventListener('keydown', (e) => {
  if (document.getElementById(`${e.code === '' ? `${e.key}Right` : e.code}`)) {
    document.getElementById(`${e.code === '' ? `${e.key}Right` : e.code}`).classList.add('active');
  } else return false;
  if (e.code === 'CapsLock') {
    capsPressed = !capsPressed;
    CapsLock(capsPressed, e.shiftKey);
  } else if (e.key === 'Shift') Shift(e.shiftKey, capsPressed);
  else if (currentKeyboard[e.code].type === 'letter'
    || currentKeyboard[e.code].type === 'changable'
    || currentKeyboard[e.code].type === 'spacing') {
    replaceCharacter(currentKeyboard[e.code].type === 'spacing' ? (
      e.code === 'Enter' ? '\n'
        : e.code === 'Tab' ? '\t' : '')
      : document.getElementById(`${e.code}`).textContent, e);
  } else if (e.code === 'Backspace') Backspace(e);
  else if (e.code === 'Delete') Delete(e);
  else if (e.key === 'Alt' || e.key === 'Control') ControlAlt(e);
});
textarea.addEventListener('keyup', (e) => {
  if (!document.getElementById(`${e.code === '' ? `${e.key}Right` : e.code}`)) return false;
  setTimeout(() => {
    document.getElementById(`${e.code === '' ? `${e.key}Right` : e.code}`).classList.remove('active');
  }, 300);
  if (e.key === 'Shift') Shift(e.shiftKey, capsPressed);
});


function replaceCharacter(newChar, e) {
  const start = e.target.selectionStart;
  const end = e.target.selectionEnd;
  const oldValue = e.target.value;

  const newValue = oldValue.slice(0, start) + newChar + oldValue.slice(end);
  e.target.value = newValue;

  e.target.selectionStart = start + 1;
  e.target.selectionEnd = e.target.selectionStart;

  e.preventDefault(); 
}


function CapsLock(caps, shift = false) {
  keysOnPage.forEach((key) => {
    if (currentKeyboard[key.id].type === 'letter') {
      if (caps) key.innerHTML = shift ? key.innerHTML.toLowerCase() : key.innerHTML.toUpperCase();
      else if (!caps) {
        key.innerHTML = shift ? key.innerHTML.toUpperCase() : key.innerHTML.toLowerCase();
      }
    }
  });
}

function Shift(shift, caps) {
  keysOnPage.forEach((key) => {
    if (currentKeyboard[key.id].type === 'letter' && caps) {
      key.innerHTML = shift ? key.innerHTML.toLowerCase() : key.innerHTML.toUpperCase();
    } else if (currentKeyboard[key.id].type === 'letter' && !caps) {
      key.innerHTML = shift ? key.innerHTML.toUpperCase() : key.innerHTML.toLowerCase();
    }
    if (currentKeyboard[key.id].type === 'changable') {
      key.innerHTML = shift ? currentKeyboard[key.id].shiftedCharacter
        : currentKeyboard[key.id].character;
    }
  });
}

function ControlAlt(e) {
  if (e.ctrlKey && e.altKey) {
    activeLang = (activeLang === 'ru' ? 'en' : 'ru');
    localStorage.setItem('lang', activeLang);
    changeCurrentKeyboard(activeLang, e.shiftKey);
  }

  e.preventDefault();
}

function Backspace(e) {
  const start = e.target.selectionStart;
  const end = e.target.selectionEnd;
  const oldValue = e.target.value;

  const newValue = oldValue.slice(0, start === end ? start - 1 : start) + oldValue.slice(end);
  e.target.value = newValue;

  e.target.selectionStart = start === end ? start - 1 : start;
  e.target.selectionEnd = e.target.selectionStart;

  e.preventDefault();
}

function Delete(e) {
  const start = e.target.selectionStart;
  const end = e.target.selectionEnd;
  const oldValue = e.target.value;

  if (!(oldValue.length > end)) return false;

  const newValue = oldValue.slice(0, start) + oldValue.slice(end + 1);
  e.target.value = newValue;

  e.target.selectionStart = start;
  e.target.selectionEnd = e.target.selectionStart;

  e.preventDefault();
}