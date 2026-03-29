const MSGS = [
  'Lendo a prestação de contas do condomínio.',
  'Identificando receitas e despesas do mês.',
  'Organizando os dados financeiros.',
  'Redigindo o comunicado para os moradores.',
  'Revisando tom e clareza do texto.',
  'Finalizando e preparando o documento Word.',
];

const EMAILJS_PUBLIC_KEY  = 'pn4m8lGygkWfEU-zU';
const EMAILJS_SERVICE_ID  = 'service_yruxmn6';
const EMAILJS_TEMPLATE_ID = 'template_t3rcagb';

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

let file = null;
let msgTimer = null;

function fmt(b) {
  return b < 1048576 ? (b/1024).toFixed(0)+' KB' : (b/1048576).toFixed(1)+' MB';
}
function showErr(msg) { errMsg.textContent = msg; errMsg.classList.add('show'); }
function hideErr()    { errMsg.classList.remove('show'); }

function selectFile(f) {
  file = f;
  fpName.textContent = f.name;
  fpSize.textContent = fmt(f.size);
  filePill.classList.add('show');
  btnSend.classList.add('show');
  hideErr();
  setTimeout(() => btnSend.scrollIntoView({ behavior:'smooth', block:'nearest' }), 100);
}

function clearFile() {
  file = null; fileInput.value = '';
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
    setTimeout(() => { procMsg.textContent = MSGS[i]; procMsg.style.opacity = '1'; }, 300);
  }, 3200);
}

function toBase64(f) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(',')[1]);
    r.onerror = () => rej(new Error('Falha ao ler arquivo'));
    r.readAsDataURL(f);
  });
}

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
  e.preventDefault(); uploadZone.classList.remove('drag');
  if (e.dataTransfer.files[0]) selectFile(e.dataTransfer.files[0]);
});
fpRm.addEventListener('click', (e) => { e.stopPropagation(); clearFile(); });

btnSend.addEventListener('click', async () => {
  if (!file) return;
  hideErr();

  showState('proc');
  startMsgs();

  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const base64 = await toBase64(file);

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      file_name : file.name,
      file_data : base64,
      file_type : file.type || 'application/pdf',
      timestamp : new Date().toLocaleString('pt-BR'),
    });

    clearInterval(msgTimer);
    showState('suc');

  } catch (err) {
    clearInterval(msgTimer);
    console.error('Erro:', err);
    showErr('Erro ao enviar. Tente novamente.');
    showState('upload');
  }
});

btnNovo.addEventListener('click', () => { clearFile(); showState('upload'); });
