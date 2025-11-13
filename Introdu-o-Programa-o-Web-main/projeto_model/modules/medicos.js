document.addEventListener("DOMContentLoaded", () => {
  const tabela = document.getElementById("tabelaMedicos");
  const formContainer = document.getElementById("formMedicoContainer");
  const form = document.getElementById("medicoForm");
  const btnNovo = document.getElementById("btnNovoMedico");
  const btnCancelar = document.getElementById("btnCancelarMedico");
  const search = document.getElementById("searchMedico");
  const vazio = document.getElementById("vazioMedicos");
  let editId = null;

  btnNovo.addEventListener("click", () => {
    formContainer.style.display = "block";
  });

  btnCancelar.addEventListener("click", resetar);

  form.addEventListener("submit", salvarMedico);
  search.addEventListener("input", buscar);

  function salvarMedico(e) {
    e.preventDefault();
    const medico = {
      id: editId || Date.now().toString(36),
      nome: nomeMedico.value.trim(),
      crm: crm.value.trim(),
      especialidade: especialidade.value.trim(),
      contato: contato.value.trim()
    };

    if (!medico.nome || !medico.crm) {
      alert("⚠️ Nome e CRM são obrigatórios!");
      return;
    }

    let medicos = JSON.parse(localStorage.getItem("medicos")) || [];

    if (editId) {
      const i = medicos.findIndex(m => m.id === editId);
      medicos[i] = medico;
      editId = null;
    } else {
      medicos.push(medico);
    }

    localStorage.setItem("medicos", JSON.stringify(medicos));
    resetar();
    listar();
  }

  function listar() {
    const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
    tabela.innerHTML = "";

    if (medicos.length === 0) {
      vazio.style.display = "block";
      return;
    }
    vazio.style.display = "none";

    medicos.forEach(m => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${m.nome}</td>
        <td>${m.crm}</td>
        <td>${m.especialidade}</td>
        <td>${m.contato}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary me-2" onclick="editarMedico('${m.id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="excluirMedico('${m.id}')">Excluir</button>
        </td>`;
      tabela.appendChild(tr);
    });
  }

  window.editarMedico = id => {
    const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
    const medico = medicos.find(m => m.id === id);
    if (!medico) return;
    nomeMedico.value = medico.nome;
    crm.value = medico.crm;
    especialidade.value = medico.especialidade;
    contato.value = medico.contato;
    editId = id;
    formContainer.style.display = "block";
  };

  window.excluirMedico = id => {
    if (!confirm("Excluir este médico?")) return;
    let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
    medicos = medicos.filter(m => m.id !== id);
    localStorage.setItem("medicos", JSON.stringify(medicos));
    listar();
  };

  function buscar() {
    const termo = search.value.toLowerCase();
    tabela.querySelectorAll("tr").forEach(linha => {
      const nome = linha.children[0].textContent.toLowerCase();
      const esp = linha.children[2].textContent.toLowerCase();
      linha.style.display = nome.includes(termo) || esp.includes(termo) ? "" : "none";
    });
  }

  function resetar() {
    form.reset();
    editId = null;
    formContainer.style.display = "none";
  }

  listar();
});
