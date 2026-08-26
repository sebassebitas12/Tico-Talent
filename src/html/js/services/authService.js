const API_URL = 'http://localhost:3000';

class AuthService {
  constructor() {
    this.form = document.getElementById('loginForm');
    this.inputUser = document.getElementById('loginEmail');
    this.inputPass = document.getElementById('loginPassword');
    this.btnLogin = document.getElementById('btnLogin');
    this.errorDiv = document.getElementById('loginError');
    this.togglePass = document.getElementById('togglePassword');
    this.particlesContainer = document.getElementById('particles');

    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.inputUser.addEventListener('input', () => this.clearError());
    this.inputPass.addEventListener('input', () => this.clearError());

    if (this.togglePass) {
      this.togglePass.addEventListener('click', () => this.togglePassword());
    }

    this.inputUser.addEventListener('focus', () => this.onFocus(this.inputUser));
    this.inputUser.addEventListener('blur', () => this.onBlur(this.inputUser));
    this.inputPass.addEventListener('focus', () => this.onFocus(this.inputPass));
    this.inputPass.addEventListener('blur', () => this.onBlur(this.inputPass));

    this.inputUser.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.inputPass.focus();
      }
    });

    this.inputPass.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.form.dispatchEvent(new Event('submit'));
      }
    });

    this.createParticles();
  }

  createParticles() {
    if (!this.particlesContainer) return;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.classList.add('login__particle');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 8 + 6) + 's';
      particle.style.animationDelay = (Math.random() * 5) + 's';
      particle.style.width = (Math.random() * 4 + 2) + 'px';
      particle.style.height = particle.style.width;
      this.particlesContainer.appendChild(particle);
    }
  }

  onFocus(input) {
    input.parentElement.classList.add('login__field--focused');
  }

  onBlur(input) {
    input.parentElement.classList.remove('login__field--focused');
  }

  togglePassword() {
    const isPassword = this.inputPass.type === 'password';
    this.inputPass.type = isPassword ? 'text' : 'password';
    this.togglePass.textContent = isPassword ? '🙈' : '👁';
  }

  showError(msg) {
    this.errorDiv.innerHTML = `<span>⚠️</span> ${msg}`;
    this.errorDiv.classList.remove('d-none');
    this.inputUser.classList.add('login__input--error');
    this.inputPass.classList.add('login__input--error');

    setTimeout(() => {
      this.inputUser.classList.remove('login__input--error');
      this.inputPass.classList.remove('login__input--error');
    }, 1000);
  }

  clearError() {
    this.errorDiv.classList.add('d-none');
    this.inputUser.classList.remove('login__input--error');
    this.inputPass.classList.remove('login__input--error');
  }

  setLoading(loading) {
    if (loading) {
      this.btnLogin.classList.add('login__btn--loading');
      this.btnLogin.disabled = true;
      this.btnLogin.querySelector('.btn__text').textContent = 'Verificando...';
    } else {
      this.btnLogin.classList.remove('login__btn--loading');
      this.btnLogin.disabled = false;
      this.btnLogin.querySelector('.btn__text').textContent = 'Iniciar Sesión';
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const username = this.inputUser.value.trim();
    const password = this.inputPass.value.trim();

    if (!username || !password) {
      this.showError('Por favor completa todos los campos');
      return;
    }

    this.setLoading(true);

    try {
      const res = await fetch(`${API_URL}/usuarios`);
      const users = await res.json();

      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        this.inputUser.classList.add('login__input--success');
        this.inputPass.classList.add('login__input--success');

        this.btnLogin.querySelector('.btn__text').textContent = '¡Bienvenido!';

        sessionStorage.setItem('user', JSON.stringify({
          id: user.id,
          username: user.username,
          nombre: user.nombre,
          rol: user.rol
        }));

        setTimeout(() => {
          window.location.href = 'principal.html';
        }, 800);
      } else {
        this.setLoading(false);
        this.showError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      this.setLoading(false);
      this.showError('Error de conexión. Verifica que el servidor esté activo.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AuthService();
});
