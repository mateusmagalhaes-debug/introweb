document.addEventListener('DOMContentLoaded', () => {
  const PACIENTES_KEY = 'hospital_pacientes_v1';
  const MEDICOS_KEY = 'hospital_medicos_v1';
  const CONSULTAS_KEY = 'hospital_consultas_v1';

  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  function atualizarDashboard() {
    const pacientes = load(PACIENTES_KEY);
    const medicos = load(MEDICOS_KEY);
    const consultas = load(CONSULTAS_KEY);

    // Atualizar cards
    document.getElementById('totalPacientes').textContent = pacientes.length;
    document.getElementById('totalMedicos').textContent = medicos.length;
    document.getElementById('totalConsultas').textContent = consultas.length;

    // Especialidades únicas
    const especialidades = new Set(medicos.map(m => m.especialidade).filter(e => e));
    document.getElementById('totalEspecialidades').textContent = especialidades.size;

    // Últimos pacientes
    const ultimosPacientes = pacientes.slice(-5).reverse();
    const tabelaPacientes = document.getElementById('ultimosPacientes');
    if (ultimosPacientes.length === 0) {
      tabelaPacientes.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhum paciente cadastrado</td></tr>';
    } else {
      tabelaPacientes.innerHTML = ultimosPacientes.map(p => `
        <tr>
          <td>${escapeHtml(p.nome)}</td>
          <td>${escapeHtml(p.cpf)}</td>
          <td>${p.idade}</td>
        </tr>
      `).join('');
    }

    // Últimos médicos
    const ultimosMedicos = medicos.slice(-5).reverse();
    const tabelaMedicos = document.getElementById('ultimosMedicos');
    if (ultimosMedicos.length === 0) {
      tabelaMedicos.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhum médico cadastrado</td></tr>';
    } else {
      tabelaMedicos.innerHTML = ultimosMedicos.map(m => `
        <tr>
          <td>${escapeHtml(m.nome)}</td>
          <td>${escapeHtml(m.crm)}</td>
          <td>${escapeHtml(m.especialidade)}</td>
        </tr>
      `).join('');
    }
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
  }

  atualizarDashboard();
});