// modules/pacientes.js
document.addEventListener('DOMContentLoaded', () => {
  const KEY = 'hospital_pacientes_v1';

  // Elementos
  const btnNovo = document.getElementById('btnNovo');
  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnExportPDF = document.getElementById('btnExportPDF');
  const search = document.getElementById('search');

  const formContainer = document.getElementById('formContainer');
  const formTitle = document.getElementById('formTitle');
  const pacienteForm = document.getElementById('pacienteForm');
  const nomeEl = document.getElementById('nome');
  const idadeEl = document.getElementById('idade');
  const cpfEl = document.getElementById('cpf');
  const enderecoEl = document.getElementById('endereco');
  const historicoEl = document.getElementById('historico');
  const btnCancelar = document.getElementById('btnCancelar');

  const tabela = document.getElementById('tabelaPacientes');
  const vazio = document.getElementById('vazio');

  let pacientes = [];
  let editIndex = -1;

  // Helpers
  function load() {
    try {
      pacientes = JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      pacientes = [];
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(pacientes));
  }

  function render(filter = '') {
    tabela.innerHTML = '';
    const filtro = filter.trim().toLowerCase();
    const filtrados = pacientes.filter(p => {
      if (!filtro) return true;
      return (
        (p.nome || '').toLowerCase().includes(filtro) ||
        (p.cpf || '').toLowerCase().includes(filtro)
      );
    });

    if (filtrados.length === 0) {
      vazio.style.display = 'block';
    } else {
      vazio.style.display = 'none';
      filtrados.forEach((p, idx) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td>${escapeHtml(p.nome)}</td>
          <td>${escapeHtml(p.idade)}</td>
          <td>${escapeHtml(p.cpf)}</td>
          <td>${escapeHtml(p.endereco || '')}</td>
          <td>${escapeHtml(p.historico || '')}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary btn-edit" data-index="${idx}">Editar</button>
            <button class="btn btn-sm btn-outline-danger btn-del ms-2" data-index="${idx}">Remover</button>
          </td>
        `;
        tabela.appendChild(tr);
      });
    }
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
  }

  function abrirFormulario(editIdx = -1) {
    editIndex = editIdx;
    if (editIdx >= 0) {
      formTitle.textContent = 'Editar Paciente';
      const p = pacientes[editIdx];
      nomeEl.value = p.nome || '';
      idadeEl.value = p.idade || '';
      cpfEl.value = p.cpf || '';
      enderecoEl.value = p.endereco || '';
      historicoEl.value = p.historico || '';
    } else {
      formTitle.textContent = 'Cadastrar Paciente';
      pacienteForm.reset();
    }
    formContainer.style.display = 'block';
    nomeEl.focus();
  }

  function fecharFormulario() {
    editIndex = -1;
    formContainer.style.display = 'none';
    pacienteForm.reset();
  }

  // Eventos
  btnNovo.addEventListener('click', () => abrirFormulario());

  btnCancelar.addEventListener('click', () => fecharFormulario());

  pacienteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const novo = {
      nome: nomeEl.value.trim(),
      idade: idadeEl.value ? Number(idadeEl.value) : '',
      cpf: cpfEl.value.trim(),
      endereco: enderecoEl.value.trim(),
      historico: historicoEl.value.trim()
    };

    if (!novo.nome || !novo.cpf) {
      alert('Nome e CPF são obrigatórios.');
      return;
    }

    if (editIndex >= 0) {
      pacientes[editIndex] = novo;
    } else {
      pacientes.push(novo);
    }

    save();
    render(search.value);
    fecharFormulario();
  });

  tabela.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const delBtn = e.target.closest('.btn-del');
    if (editBtn) {
      const idx = Number(editBtn.dataset.index);
      abrirFormulario(idx);
    } else if (delBtn) {
      const idx = Number(delBtn.dataset.index);
      if (confirm('Remover este paciente?')) {
        pacientes.splice(idx, 1);
        save();
        render(search.value);
      }
    }
  });

  search.addEventListener('input', () => render(search.value));

  btnExportCSV.addEventListener('click', () => {
    if (!pacientes.length) { alert('Nenhum paciente para exportar.'); return; }
    const rows = [
      ['Nome','Idade','CPF','Endereço','Histórico'],
      ...pacientes.map(p => [p.nome, p.idade, p.cpf, p.endereco, p.historico])
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell || '').replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pacientes.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  btnExportPDF.addEventListener('click', () => {
    if (!pacientes.length) { alert('Nenhum paciente para exportar.'); return; }
    // Usa jsPDF simples: cada paciente em nova linha
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text('Pacientes', 14, 20);
      let y = 30;
      pacientes.forEach((p, i) => {
        const line = `${i+1}. ${p.nome} — ${p.idade} — ${p.cpf}`;
        doc.text(line, 14, y);
        y += 8;
        if (y > 280) { doc.addPage(); y = 20; }
      });
      doc.save('pacientes.pdf');
    } catch (err) {
      alert('Erro ao gerar PDF. Verifique se o jsPDF está carregado.');
    }
  });

  // Inicializa
  load();
  render();
});
