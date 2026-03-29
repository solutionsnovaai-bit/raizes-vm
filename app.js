const MSGS = [
  'Lendo a prestação de contas do condomínio.',
  'Identificando receitas e despesas do mês.',
  'Organizando os dados financeiros.',
  'Redigindo o comunicado para os moradores.',
  'Revisando tom e clareza do texto.',
  'Finalizando e preparando o documento Word.',
];

const fileInput  = document.getElementById('file-input');
const uploadZone = document.getElementById('upload-zone');
const filePill   = document.getElementById('file-pill');
const fpName     = document.getElementById('fp-name');
const fpSize     = document.getElementById('fp-size');
const fpRm       = document.getElementById('fp-rm');
const btnSend    = document.getElementById('btn-send');
const errMsg     = document.getElementById('err-msg');
const stUpload   = document.getElementById('state-upload');
const stProc     = document.getElementById('state-processing');
const stSuc      = document.getElementById('state-success');
const procMsg    = document.getElementById('proc-msg');
const btnNovo    = document.getElementById('btn-novo');

let file     = null;
let msgTimer = null;

// ─────────────────────────────────────────────
// ⚠️ COLE AQUI A URL DO WEBHOOK DO MAKE
// ─────────────────────────────────────────────
const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/yxqs3w0cs1vuo9ip01le3rkzc3j48fg1';

function fmt(b) {
  return b < 1048576 ? (b/1024).toFixed(0)+' KB' : (b/1048576).toFixed(1)+' MB';
}

function showErr(msg) {
  errMsg.textContent = msg;
  errMsg.classList.add('show');
}

function hideErr() {
  errMsg.classList.remove('show');
}

function selectFile(f) {
  file = f;
  fpName.textContent = f.name;
  fpSize.textContent = fmt(f.size);
  filePill.classList.add('show');
  btnSend.classList.add('show');
  hideErr();
  setTimeout(() => {
    btnSend.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function clearFile() {
  file = null;
  fileInput.value = '';
  filePill.classList.remove('show');
  btnSend.classList.remove('show');
  hideErr();
}

function showState(s) {
  stUpload.style.display = s === 'upload' ? '' : 'none';
  stProc.style.display   = s === 'proc'   ? 'flex' : 'none';
  stProc.className       = s === 'proc'   ? 'show' : '';
  stSuc.style.display    = s === 'suc'    ? 'flex' : 'none';
  stSuc.className        = s === 'suc'    ? 'show' : '';
}

function startMsgs() {
  let i = 0;
  procMsg.textContent = MSGS[0];
  msgTimer = setInterval(() => {
    i = (i + 1) % MSGS.length;
    procMsg.style.opacity = '0';
    setTimeout(() => {
      procMsg.textContent   = MSGS[i];
      procMsg.style.opacity = '1';
    }, 300);
  }, 3200);
}

// iOS fix
uploadZone.addEventListener('click', (e) => {
  if (e.target === fileInput) return;
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files && fileInput.files[0]) selectFile(fileInput.files[0]);
});

uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag');
  if (e.dataTransfer.files[0]) selectFile(e.dataTransfer.files[0]);
});

fpRm.addEventListener('click', (e) => { e.stopPropagation(); clearFile(); });

// ─────────────────────────────────────────────
// ENVIO — multipart/form-data direto pro Make
// Sem limite de tamanho, sem servidor no meio
// ─────────────────────────────────────────────
btnSend.addEventListener('click', async () => {
  if (!file) return;
  hideErr();

  showState('proc');
  startMsgs();

  try {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('fileName', file.name);
    formData.append('timestamp', new Date().toLocaleString('pt-BR'));

    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Erro no servidor');

    clearInterval(msgTimer);
    showState('suc');

  } catch (err) {
    clearInterval(msgTimer);
    console.error('Erro:', err);
    showErr('Erro ao enviar. Verifique sua conexão e tente novamente.');
    showState('upload');
  }
});

btnNovo.addEventListener('click', () => { clearFile(); showState('upload'); });
