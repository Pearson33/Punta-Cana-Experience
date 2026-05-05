/* ============================================================
   PUNTA CANA — SITIO WEB ACCESIBLE (WCAG 2.2 AA)
   Script principal: formulario postal, navegación, accesibilidad
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ========================================
     1. MENÚ HAMBURGUESA ACCESIBLE
     WCAG 2.2 (2.1.1): Navegable por teclado.
     aria-expanded informa del estado al lector de pantalla.
  ======================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const navPrincipal = document.getElementById('nav-principal');

  if (menuToggle && navPrincipal) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menú de navegación' : 'Cerrar menú de navegación');
      navPrincipal.classList.toggle('is-open', !isOpen);
    });

    // Cerrar menú al hacer clic en un enlace (para single-page)
    navPrincipal.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
        navPrincipal.classList.remove('is-open');
      });
    });

    // WCAG 2.2 (2.1.1): Cerrar menú con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navPrincipal.classList.contains('is-open')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        navPrincipal.classList.remove('is-open');
        menuToggle.focus(); // Devolver foco al botón
      }
    });
  }

  /* ========================================
     2. HEADER CON EFECTO SCROLL
     Cambio visual sutil al hacer scroll.
  ======================================== */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('header-scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  /* ========================================
     3. FORMULARIO POSTAL ACCESIBLE
     WCAG 2.2 (3.3.1, 3.3.2): Validación con
     mensajes de error descriptivos y aria-live.
  ======================================== */
  const form = document.getElementById('postal-form');
  const formStatus = document.getElementById('form-status');
  const modal = document.getElementById('postal-confirmacion');
  const modalCerrar = document.getElementById('modal-cerrar');
  const modalPreview = document.getElementById('modal-preview');
  const modalMensaje = document.getElementById('modal-mensaje');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Simulación: no enviar realmente

      // Limpiar errores previos
      limpiarErrores();

      // Validar campos
      let esValido = true;
      const campos = [
        { id: 'postal-nombre', errorId: 'nombre-error', msg: 'Por favor, introduce tu nombre.' },
        { id: 'postal-email', errorId: 'email-error', msg: 'Por favor, introduce un correo electrónico válido.', tipo: 'email' },
        { id: 'postal-destinatario', errorId: 'destinatario-error', msg: 'Por favor, introduce el nombre del destinatario.' },
        { id: 'postal-mensaje', errorId: 'mensaje-error', msg: 'Por favor, escribe un mensaje para tu postal.' }
      ];

      campos.forEach(campo => {
        const input = document.getElementById(campo.id);
        const error = document.getElementById(campo.errorId);
        if (!input || !error) return;

        let invalido = !input.value.trim();
        // Validación específica de email
        if (campo.tipo === 'email' && input.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          invalido = !emailRegex.test(input.value.trim());
        }

        if (invalido) {
          esValido = false;
          mostrarError(input, error, campo.msg);
        }
      });

      // Validar selección de imagen
      const imagenSeleccionada = form.querySelector('input[name="postal-imagen"]:checked');
      const imagenError = document.getElementById('imagen-error');
      if (!imagenSeleccionada) {
        esValido = false;
        if (imagenError) {
          imagenError.hidden = false;
          imagenError.textContent = 'Por favor, selecciona una imagen para tu postal.';
        }
      }

      if (!esValido) {
        // WCAG 2.2 (3.3.1): Anunciar error mediante aria-live
        if (formStatus) {
          formStatus.textContent = 'Hay errores en el formulario. Por favor, revisa los campos marcados.';
        }
        // Mover el foco al primer campo con error
        const primerError = form.querySelector('.input-error, .field-error:not([hidden])');
        if (primerError) {
          const campoError = primerError.classList.contains('input-error')
            ? primerError
            : primerError.previousElementSibling;
          if (campoError && campoError.focus) campoError.focus();
        }
        return;
      }

      // Envío simulado exitoso
      if (formStatus) {
        formStatus.textContent = '¡Tu postal ha sido enviada con éxito!';
      }

      // Mostrar modal de confirmación
      mostrarModal(imagenSeleccionada.value, campos);
    });
  }

  /**
   * Muestra un mensaje de error junto al campo.
   * WCAG 2.2 (3.3.1): role="alert" en el error lo anuncia automáticamente.
   */
  function mostrarError(input, errorEl, mensaje) {
    input.classList.add('input-error');
    errorEl.textContent = mensaje;
    errorEl.hidden = false;
  }

  /** Limpia todos los errores del formulario. */
  function limpiarErrores() {
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    form.querySelectorAll('.field-error').forEach(el => { el.hidden = true; });
  }

  /**
   * Muestra el modal de confirmación con vista previa de la postal.
   * WCAG 2.2 (2.4.3): Gestión del foco — al abrir, foco al modal; al cerrar, devolver.
   */
  let elementoAnteriorFoco = null;

  function mostrarModal(imagenValor, campos) {
    if (!modal) return;

    elementoAnteriorFoco = document.activeElement;

    // Vista previa de la postal
    const nombreRemitente = document.getElementById('postal-nombre').value;
    const destinatario = document.getElementById('postal-destinatario').value;

    if (modalMensaje) {
      modalMensaje.textContent = `Tu postal desde Punta Cana ha sido enviada a ${destinatario}. ¡Firmada por ${nombreRemitente}!`;
    }

    if (modalPreview) {
      modalPreview.innerHTML = `<img src="assets/images/${imagenValor}.png" alt="Postal seleccionada: ${imagenValor}" style="border-radius:12px;max-height:200px;margin:0 auto;">`;
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden'; // Evitar scroll de fondo

    // Foco al botón de cerrar
    if (modalCerrar) modalCerrar.focus();

    // Trampa de foco dentro del modal (WCAG 2.2)
    modal.addEventListener('keydown', trampaFocoModal);
  }

  function cerrarModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    modal.removeEventListener('keydown', trampaFocoModal);

    // Devolver foco al elemento anterior (WCAG 2.2: 2.4.3)
    if (elementoAnteriorFoco) elementoAnteriorFoco.focus();

    // Resetear formulario
    if (form) form.reset();
    limpiarErrores();
  }

  /**
   * Trampa de foco: impide que el foco salga del modal.
   * WCAG 2.2 (2.4.3): El foco debe mantenerse dentro del diálogo modal.
   */
  function trampaFocoModal(e) {
    if (e.key === 'Escape') {
      cerrarModal();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusables.length === 0) return;

    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }

  // Evento del botón cerrar modal
  if (modalCerrar) {
    modalCerrar.addEventListener('click', cerrarModal);
  }

  // Cerrar modal haciendo clic en el fondo
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModal();
    });
  }

  /* ========================================
     4. CARRUSEL COVERFLOW — GALERÍA
     Múltiples imágenes visibles, la activa centrada.
     WCAG 2.2 (2.1.1): Flechas de teclado.
     aria-live anuncia cambios a lectores de pantalla.
  ======================================== */
  const coverflowStage = document.getElementById('coverflow-stage');
  const cfItems = coverflowStage ? Array.from(coverflowStage.querySelectorAll('.coverflow-item')) : [];
  const cfPrev = document.getElementById('coverflow-prev');
  const cfNext = document.getElementById('coverflow-next');
  const cfDots = document.querySelectorAll('.coverflow-dot');
  const cfLive = document.getElementById('coverflow-live');
  let cfCurrent = 0;
  let cfAutoPlay = null;

  /**
   * Posicionar cada item según su distancia al activo.
   * Items a la izquierda rotan +45°, a la derecha -45°,
   * los más alejados se hacen más pequeños y transparentes.
   */
  function positionCoverflow(activeIndex) {
    cfCurrent = activeIndex;
    const SPACING = 220;   // px entre items adyacentes
    const DEPTH = -150;    // translateZ para items no activos
    const ANGLE = 45;      // grados de rotación Y

    cfItems.forEach((item, i) => {
      const offset = i - activeIndex;
      const absOff = Math.abs(offset);

      if (offset === 0) {
        // Item activo: centrado, sin rotación, escala completa
        item.style.setProperty('--tx', '0px');
        item.style.setProperty('--tz', '50px');
        item.style.setProperty('--ry', '0deg');
        item.style.setProperty('--sc', '1');
        item.style.setProperty('--op', '1');
        item.style.setProperty('--zi', '10');
        item.classList.add('is-active');
      } else {
        // Items laterales: desplazados, rotados, reducidos
        const tx = offset * SPACING;
        const ry = offset > 0 ? -ANGLE : ANGLE;
        const sc = Math.max(0.55, 1 - absOff * 0.15);
        const op = Math.max(0.2, 1 - absOff * 0.25);
        const zi = 10 - absOff;

        item.style.setProperty('--tx', `${tx}px`);
        item.style.setProperty('--tz', `${DEPTH}px`);
        item.style.setProperty('--ry', `${ry}deg`);
        item.style.setProperty('--sc', String(sc));
        item.style.setProperty('--op', String(op));
        item.style.setProperty('--zi', String(Math.max(0, zi)));
        item.classList.remove('is-active');
      }
    });

    // Actualizar dots
    cfDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
      dot.setAttribute('aria-current', String(i === activeIndex));
    });

    // Anunciar a lector de pantalla
    if (cfLive && cfItems[activeIndex]) {
      const caption = cfItems[activeIndex].querySelector('figcaption strong');
      cfLive.textContent = caption ? caption.textContent : `Imagen ${activeIndex + 1}`;
    }
  }

  function cfGoTo(index) {
    if (index < 0) index = cfItems.length - 1;
    if (index >= cfItems.length) index = 0;
    positionCoverflow(index);
    resetCfAutoPlay();
  }

  function resetCfAutoPlay() {
    clearInterval(cfAutoPlay);
    cfAutoPlay = setInterval(() => cfGoTo(cfCurrent + 1), 5000);
  }

  if (cfItems.length > 0) {
    // Botones
    if (cfPrev) cfPrev.addEventListener('click', () => cfGoTo(cfCurrent - 1));
    if (cfNext) cfNext.addEventListener('click', () => cfGoTo(cfCurrent + 1));

    // Dots
    cfDots.forEach(dot => {
      dot.addEventListener('click', () => cfGoTo(parseInt(dot.dataset.index, 10)));
    });

    // Click en items para centrarlos
    cfItems.forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index, 10);
        if (idx !== cfCurrent) cfGoTo(idx);
      });
    });

    // Teclado
    const coverflowEl = document.getElementById('coverflow');
    if (coverflowEl) {
      coverflowEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); cfGoTo(cfCurrent - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); cfGoTo(cfCurrent + 1); }
      });
      // Pausar auto-play en hover/focus
      coverflowEl.addEventListener('mouseenter', () => clearInterval(cfAutoPlay));
      coverflowEl.addEventListener('mouseleave', () => resetCfAutoPlay());
      coverflowEl.addEventListener('focusin', () => clearInterval(cfAutoPlay));
      coverflowEl.addEventListener('focusout', () => resetCfAutoPlay());
    }

    // Inicializar
    positionCoverflow(0);
    resetCfAutoPlay();
  }

  /* ========================================
     5. ANIMACIONES AL SCROLL (Intersection Observer)
     Anima elementos al entrar en viewport.
     Respeta prefers-reduced-motion.
  ======================================== */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const animarElementos = document.querySelectorAll('.about-card, .media-panel, .section-header');

    // Añadir estado inicial
    animarElementos.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animarElementos.forEach(el => observer.observe(el));
  }

  /* ========================================
     6. NAVEGACIÓN ACTIVA (Highlight link actual)
     Resalta el enlace de navegación correspondiente
     a la sección visible actualmente.
  ======================================== */
  const secciones = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (secciones.length > 0 && navLinks.length > 0) {
    const observerNav = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('nav-link--active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

    secciones.forEach(sec => observerNav.observe(sec));
  }
});
