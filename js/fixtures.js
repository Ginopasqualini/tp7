// Sistema de Gestión de Fixtures
// Laboratorio de Programación - 6° G

// Estructura de datos para almacenar fixtures
class FixturesManager {
  constructor() {
    this.fixtures = this.loadFromLocalStorage() || [];
    this.teams = ['Equipo A', 'Equipo B', 'Equipo C', 'Equipo D', 'Equipo E', 'Equipo F'];
  }

  // Guardar en localStorage
  saveToLocalStorage() {
    localStorage.setItem('fixtures', JSON.stringify(this.fixtures));
  }

  // Cargar desde localStorage
  loadFromLocalStorage() {
    const data = localStorage.getItem('fixtures');
    return data ? JSON.parse(data) : null;
  }

  // Agregar un nuevo fixture
  addFixture(fecha, equipo1, equipo2, hora, ubicacion) {
    const fixture = {
      id: Date.now(),
      fecha,
      equipo1,
      equipo2,
      hora,
      ubicacion,
      resultado: null,
      createdAt: new Date().toLocaleString('es-AR')
    };
    this.fixtures.push(fixture);
    this.saveToLocalStorage();
    return fixture;
  }

  // Obtener todos los fixtures
  getAllFixtures() {
    return this.fixtures.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }

  // Obtener próximos fixtures
  getUpcomingFixtures(limit = 5) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.fixtures
      .filter(f => new Date(f.fecha) >= today)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(0, limit);
  }

  // Eliminar un fixture
  deleteFixture(id) {
    this.fixtures = this.fixtures.filter(f => f.id !== id);
    this.saveToLocalStorage();
  }

  // Buscar fixture por ID
  getFixtureById(id) {
    return this.fixtures.find(f => f.id === id);
  }
}

// Instancia global
const manager = new FixturesManager();

// Funciones para el Dashboard
function initDashboard() {
  const nextMatchesDiv = document.getElementById('next-matches');
  if (!nextMatchesDiv) return;

  const upcoming = manager.getUpcomingFixtures(3);
  
  if (upcoming.length === 0) {
    nextMatchesDiv.innerHTML = '<p style="color: #999;">No hay encuentros próximos registrados.</p>';
    return;
  }

  let html = '<ul style="list-style: none; padding: 0;">';
  upcoming.forEach(fixture => {
    html += `
      <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
        <strong>${fixture.equipo1}</strong> vs <strong>${fixture.equipo2}</strong><br>
        <small style="color: #999;">📅 ${new Date(fixture.fecha).toLocaleDateString('es-AR')} - ${fixture.hora}</small>
      </li>
    `;
  });
  html += '</ul>';
  nextMatchesDiv.innerHTML = html;
}

// Funciones para Alta de Fixtures
function initAltaFixture() {
  const form = document.querySelector('form');
  if (!form) return;

  // Llenar select de equipos si existen
  const selects = document.querySelectorAll('select');
  selects.forEach(select => {
    if (select.name === 'equipo1' || select.name === 'equipo2') {
      manager.teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        select.appendChild(option);
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fecha = document.querySelector('input[name="fecha"]')?.value;
    const equipo1 = document.querySelector('select[name="equipo1"]')?.value || document.querySelector('input[name="equipo1"]')?.value;
    const equipo2 = document.querySelector('select[name="equipo2"]')?.value || document.querySelector('input[name="equipo2"]')?.value;
    const hora = document.querySelector('input[name="hora"]')?.value;
    const ubicacion = document.querySelector('input[name="ubicacion"]')?.value;

    if (!fecha || !equipo1 || !equipo2 || !hora || !ubicacion) {
      showAlert('Por favor completa todos los campos.', 'error');
      return;
    }

    if (equipo1 === equipo2) {
      showAlert('Los dos equipos no pueden ser iguales.', 'error');
      return;
    }

    try {
      manager.addFixture(fecha, equipo1, equipo2, hora, ubicacion);
      showAlert('¡Encuentro registrado correctamente!', 'success');
      form.reset();
      
      // Redirigir a ver fixture después de 1.5 segundos
      setTimeout(() => {
        window.location.href = './ver-fixture.html';
      }, 1500);
    } catch (error) {
      showAlert('Error al registrar el encuentro.', 'error');
    }
  });
}

// Funciones para Ver Fixtures
function initVerFixture() {
  const fixturesContainer = document.getElementById('fixtures-container') || document.querySelector('main');
  if (!fixturesContainer) return;

  const fixtures = manager.getAllFixtures();

  if (fixtures.length === 0) {
    fixturesContainer.innerHTML = '<div class="alert alert-info">No hay encuentros registrados aún.</div>';
    return;
  }

  let html = '<table><thead><tr><th>Equipo 1</th><th>Equipo 2</th><th>Fecha</th><th>Hora</th><th>Ubicación</th><th>Acciones</th></tr></thead><tbody>';
  
  fixtures.forEach(fixture => {
    html += `
      <tr>
        <td>${fixture.equipo1}</td>
        <td>${fixture.equipo2}</td>
        <td>${new Date(fixture.fecha).toLocaleDateString('es-AR')}</td>
        <td>${fixture.hora}</td>
        <td>${fixture.ubicacion}</td>
        <td>
          <button class="btn btn-secondary" onclick="editFixture(${fixture.id})">Editar</button>
          <button class="btn btn-danger" onclick="deleteFixture(${fixture.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });
  
  html += '</tbody></table>';

  // Crear contenedor si no existe
  let container = document.getElementById('fixtures-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'fixtures-container';
    container.className = 'container';
    document.querySelector('main').appendChild(container);
  }
  
  container.innerHTML = html;
}

// Eliminar fixture
function deleteFixture(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este encuentro?')) {
    manager.deleteFixture(id);
    showAlert('Encuentro eliminado correctamente.', 'success');
    setTimeout(() => location.reload(), 1000);
  }
}

// Editar fixture (puede expandirse)
function editFixture(id) {
  const fixture = manager.getFixtureById(id);
  if (fixture) {
    alert(`Editar: ${fixture.equipo1} vs ${fixture.equipo2}\nEsta funcionalidad puede expandirse para edición completa.`);
  }
}

// Mostrar alertas
function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  
  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(alert, container.firstChild);
    setTimeout(() => alert.remove(), 4000);
  }
}

// Marcar enlace de navegación activo
function markActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Inicializar según la página
document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (currentPage === 'index.html' || currentPage === '') {
    initDashboard();
  } else if (currentPage === 'alta-fixture.html') {
    initAltaFixture();
  } else if (currentPage === 'ver-fixture.html') {
    initVerFixture();
  }
});

// Exportar para uso en consola o pruebas
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FixturesManager, manager };
}