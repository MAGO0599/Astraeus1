(function () {
  if (window.__ASTRAEUS_LOADED__) return;
  window.__ASTRAEUS_LOADED__ = true;

  // ============ ESTADO GLOBAL ============
  window.currentLang = 'en';
  window.commanderName = 'Cadet';
  window.currentLevel = 1;
  window.gameStarted = false;
  window.paused = false;
  window.activeKeys = {};
  window.mouse = { x: 0, y: 0, down: false };
  window.stars3D = Array.from({ length: 240 }, () => ({
    x: (Math.random() - 0.5) * 2400,
    y: (Math.random() - 0.5) * 1600,
    z: Math.random() * 1000 + 100
  }));

  window.scene3D = null;
  window.camera3D = null;
  window.renderer3D = null;
  window.controls3D = null;
  window.currentModel = null;
  window.autoRotate3D = true;

  window.lvl1 = {};
  window.lvl15 = {};
  window.lvl2 = {};
  window.lvl3 = { walkDir: 0 };
  window.lvl4 = {};

  // ============ DICCIONARIO BILINGÜE (INGLÉS / ESPAÑOL) ============
  const I18N = {
    es: {
      brandLogo: '🚀 ACADEMIA ASTRÆUS · ARTEMIS',
      missionTag: 'SIMULADOR CIENTÍFICO INTERACTIVO',
      coverEyebrow: '🌍 TIERRA → 🌙 POLO SUR LUNAR · 384,400 KM',
      coverTitle1: 'MISIÓN',
      coverDesc: '¡Conviértete en comandante espacial! Pilota la cápsula Orion, conduce el Rover bajo gravedad lunar (1/6 G), descontamina tu traje en el Airlock, sobrevive 14 días de noche lunar y descubre hielo antiguo en el Cráter Shackleton.',
      feat1: 'Ciencia Real NASA',
      feat2: 'Cabina 3D Interactiva',
      feat3: 'Insignias de Misión',
      btnStart: '¡EMPEZAR AVENTURA ESPACIAL! 🚀',
      footer1: 'GRAVEDAD LUNAR: 1.62 m/s² (6 VECES MENOR QUE EN LA TIERRA)',
      footer2: 'RETARDO DE RADIO: 1.28 SEGUNDOS',
      loginTitle: 'CREDENCIAL DE CADETE',
      loginSub: 'PREPARA TU TRAJE PARA EL DESPEGUE',
      userPlaceholder: 'Tu nombre de Astronauta (ej. Sofía)',
      passPlaceholder: 'Clave de nave (ej. 123)',
      loginBtn: 'PONERME EL CASCO Y DESPEGAR',
      loginError: '⚠ Escribe tu nombre y una clave de al menos 3 letras o números',
      nav1: 'ÓRBITA ORION',
      nav15: 'ROVER LUNAR',
      nav2: 'AIRLOCK UV',
      nav3: 'BASE 14 DÍAS',
      nav4: 'CRÁTER HIELO',
      nav5: 'MUSEO 3D',
      scienceHeader: '💡 ¿SABÍAS QUÉ?',
      astraTitle: 'ASTRA · GUÍA DE MISIÓN',
      btnScience: '📖 Ver Ciencia',
      walkLeft: '◀ SALA IZQ [A]',
      walkRight: 'SALA DER [D] ▶',
      radioLabel: 'RADIO TIERRA: 1.28s',
      btnCapcom: '📡 LLAMAR A HOUSTON',
      m1: '🛸 Módulo Lunar Apollo',
      m2: '🚙 Rover Presurizado SEV',
      m3: '🚀 Cápsula Freedom 7',
      m4: '🛰️ Cápsula Faith 7',
      m5: '🌑 Cara Oculta de la Luna',
      m6: '🏔️ Cráteres Apollo 16',
      m7: '☄️ Asteroide Bennu',
      m8: '🪨 Asteroide Vesta',
      understood: '¡ENTENDIDO, CONTINUAR MISIÓN!'
    },
    en: {
      brandLogo: '🚀 ASTRÆUS ACADEMY · ARTEMIS',
      missionTag: 'INTERACTIVE SCIENCE SIMULATOR',
      coverEyebrow: '🌍 EARTH → 🌙 LUNAR SOUTH POLE · 384,400 KM',
      coverTitle1: 'MISSION',
      coverDesc: 'Become a Space Commander! Pilot the Orion capsule, drive the Lunar Rover under 1/6 G gravity, decontaminate your suit in the Airlock, survive 14 days of lunar night, and discover ancient ice inside Shackleton Crater.',
      feat1: 'Real NASA Science',
      feat2: 'Interactive 3D Cockpit',
      feat3: 'Mission Badges',
      btnStart: 'START SPACE ADVENTURE! 🚀',
      footer1: 'LUNAR GRAVITY: 1.62 m/s² (6 TIMES WEAKER THAN EARTH)',
      footer2: 'RADIO DELAY: 1.28 SECONDS',
      loginTitle: 'CADET CREDENTIALS',
      loginSub: 'PREPARE YOUR SPACESUIT FOR LIFTOFF',
      userPlaceholder: 'Your Astronaut Name (e.g. Sophia)',
      passPlaceholder: 'Ship Passcode (e.g. 123)',
      loginBtn: 'PUT ON HELMET & LAUNCH',
      loginError: '⚠ Enter your name and a passcode with at least 3 characters',
      nav1: 'ORION ORBIT',
      nav15: 'LUNAR ROVER',
      nav2: 'UV AIRLOCK',
      nav3: '14-DAY BASE',
      nav4: 'ICE CRATER',
      nav5: '3D MUSEUM',
      scienceHeader: '💡 DID YOU KNOW?',
      astraTitle: 'ASTRA · MISSION GUIDE',
      btnScience: '📖 Science Lab',
      walkLeft: '◀ LEFT BAY [A]',
      walkRight: 'RIGHT BAY [D] ▶',
      radioLabel: 'EARTH RADIO: 1.28s',
      btnCapcom: '📡 CALL HOUSTON',
      m1: '🛸 Apollo Lunar Module',
      m2: '🚙 Pressurized Rover SEV',
      m3: '🚀 Freedom 7 Capsule',
      m4: '🛰️ Faith 7 Capsule',
      m5: '🌑 Far Side of the Moon',
      m6: '🏔️ Apollo 16 Craters',
      m7: '☄️ Asteroid Bennu',
      m8: '🪨 Asteroid Vesta',
      understood: 'GOT IT, CONTINUE MISSION!'
    }
  };

  function tr(key) {
    return (I18N[window.currentLang] && I18N[window.currentLang][key]) || I18N.en[key] || key;
  }

  window.applyLanguageUI = function () {
    const lang = window.currentLang;
    const isEs = lang === 'es';
    document.documentElement.lang = lang;
    const nextLabel = isEs ? '🌐 EN' : '🌐 ES';
    ['langBtnCover', 'langBtnLogin', 'langBtnGame'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = id === 'langBtnGame' ? nextLabel : (isEs ? '🌐 English' : '🌐 Español');
    });

    const map = [
      'brandLogo', 'missionTag', 'coverEyebrow', 'coverTitle1', 'coverDesc',
      'feat1', 'feat2', 'feat3', 'btnStart', 'footer1', 'footer2',
      'loginTitle', 'loginSub', 'loginBtn',
      'nav1', 'nav15', 'nav2', 'nav3', 'nav4', 'nav5',
      'scienceHeader', 'astraTitle', 'btnScience',
      'walkLeft', 'walkRight', 'radioLabel', 'btnCapcom',
      'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'
    ];
    map.forEach(k => {
      const el = document.getElementById('t-' + k);
      if (el) el.textContent = tr(k);
    });

    const uInput = document.getElementById('username');
    const pInput = document.getElementById('password');
    if (uInput) uInput.placeholder = tr('userPlaceholder');
    if (pInput) pInput.placeholder = tr('passPlaceholder');

    if (window.gameStarted) {
      const lesson = scienceLessons[window.currentLevel] || scienceLessons[1];
      document.getElementById('scienceFact').textContent = lesson.fact[lang];
      if (window.currentLevel === 1) { updateLvl1Texts(); renderLvl1Console(); }
      if (window.currentLevel === 1.5) { updateLvl15Texts(); renderLvl15Console(); }
      if (window.currentLevel === 2) { updateLvl2Texts(); renderLvl2Console(); }
      if (window.currentLevel === 3) { updateLvl3Texts(); renderLvl3Console(); }
      if (window.currentLevel === 4) { updateLvl4Texts(); renderLvl4Console(); }
    }
  };

  window.toggleLanguage = function () {
    window.currentLang = window.currentLang === 'es' ? 'en' : 'es';
    audioSys.beep(760, 0.08);
    window.applyLanguageUI();
  };

  // ============ CONTENIDO EDUCATIVO BILINGÜE ============
  const scienceLessons = {
    1: {
      badge: '🛰️',
      fact: {
        es: 'En el espacio no hay aire para repartir el calor: el lado al Sol llega a +120 °C y el lado en sombra cae a -150 °C.',
        en: 'In space there is no air to spread heat: the sunlit side reaches +120 °C while the shadow side drops to -150 °C.'
      },
      title: {
        es: 'CIENCIA REAL: CONTROL TÉRMICO Y FRENADO ORBITAL',
        en: 'REAL SCIENCE: THERMAL CONTROL & ORBITAL BRAKING'
      },
      detail: {
        es: '1) Giro PTC ("Barbecue Roll"): Las naves Apollo y Orion giran lentamente sobre su eje para que el Sol caliente todos sus lados por igual.\n2) Retro-propulsión (LOI): Como en el vacío no hay aire para frenar con paracaídas, la nave enciende su motor hacia adelante para reducir su velocidad y entrar en órbita lunar.',
        en: '1) PTC Roll ("Barbecue Roll"): Apollo and Orion spacecraft rotate slowly so the Sun warms all sides evenly.\n2) Retro-propulsion (LOI): Since there is no air in space for parachutes, the ship fires its engine forward to slow down and enter lunar orbit.'
      }
    },
    1.5: {
      badge: '🌙',
      fact: {
        es: 'La gravedad en la Luna es 1.62 m/s² (un sexto de la Tierra). ¡Si pesas 60 kg aquí, en la Luna pesarías solo 10 kg!',
        en: 'Lunar gravity is 1.62 m/s² (one-sixth of Earth). If you weigh 60 kg on Earth, you would weigh only 10 kg on the Moon!'
      },
      title: {
        es: 'CIENCIA REAL: GRAVEDAD 1/6 G Y ROVER LUNAR',
        en: 'REAL SCIENCE: 1/6 G GRAVITY & LUNAR ROVER'
      },
      detail: {
        es: 'Al tener 6 veces menos gravedad, cada paso o rueda del Rover rebota en cámara lenta y tarda más en volver al suelo. Por eso los astronautas saltaban como canguros y debían frenar con anticipación para no caer en cráteres.',
        en: 'With 6 times less gravity, every step or Rover wheel bounces in slow motion and takes longer to touch down. Astronauts hopped like kangaroos and had to brake early to avoid craters.'
      }
    },
    2: {
      badge: '🔬',
      fact: {
        es: 'El polvo lunar (regolito) nunca fue erosionado por viento ni agua: sus granos son afilados como vidrio microscópico.',
        en: 'Lunar dust (regolith) was never worn down by wind or water: its grains are sharp like microscopic glass.'
      },
      title: {
        es: 'CIENCIA REAL: AIRLOCK SUITPORT Y SALUD ESPACIAL',
        en: 'REAL SCIENCE: SUITPORT AIRLOCK & SPACE HEALTH'
      },
      detail: {
        es: '1) Regolito y UV: El polvo lunar se pega por electricidad estática y daña pulmones y sellos mecánicos.\n2) Presurización y Mareo: Al pasar de la baja presión del traje al aire normal de la estación (14.7 PSI), el oído interno tarda unos segundos en adaptarse a la gravedad 1/6 G.',
        en: '1) Regolith & UV: Lunar dust clings via static electricity and harms lungs and seals.\n2) Pressurization & Dizziness: Moving from low suit pressure to cabin air (14.7 PSI), the inner ear takes a few seconds to adapt to 1/6 G.'
      }
    },
    3: {
      badge: '❄️',
      fact: {
        es: 'Un día y una noche en la Luna duran 28 días terrestres: ¡14 días seguidos de oscuridad total a -173 °C!',
        en: 'One day and night on the Moon last 28 Earth days: 14 straight days of total darkness at -173 °C!'
      },
      title: {
        es: 'CIENCIA REAL: SOBREVIVIR LA NOCHE LUNAR',
        en: 'REAL SCIENCE: SURVIVING THE LUNAR NIGHT'
      },
      detail: {
        es: 'Durante 14 días sin Sol, los paneles solares no generan electricidad. La estación depende de reactores compactos Kilopower, reciclaje cerrado de agua (98%) y filtros de CO₂ para mantener el aire respirable.',
        en: 'During 14 sunless days, solar panels produce no power. The base relies on compact Kilopower reactors, 98% closed-loop water recycling, and CO₂ scrubbers to keep air breathable.'
      }
    },
    4: {
      badge: '🧊',
      fact: {
        es: 'En el fondo del Cráter Shackleton nunca entra luz solar desde hace miles de millones de años (-240 °C), conservando hielo antiguo.',
        en: 'Sunlight has not reached the bottom of Shackleton Crater for billions of years (-240 °C), preserving ancient water ice.'
      },
      title: {
        es: 'CIENCIA REAL: HIELO EN EL POLO SUR LUNAR (PSR)',
        en: 'REAL SCIENCE: ICE AT THE LUNAR SOUTH POLE (PSR)'
      },
      detail: {
        es: 'Las Regiones Permanentemente Sombreadas (PSR) guardan millones de toneladas de hielo. Al separarlo con electricidad (electrólisis), obtenemos oxígeno para respirar e hidrógeno líquido para fabricar combustible de cohetes.',
        en: 'Permanently Shadowed Regions (PSRs) hold millions of tons of ice. Splitting water with electricity (electrolysis) yields oxygen to breathe and liquid hydrogen for rocket fuel.'
      }
    },
    5: {
      badge: '🛸',
      fact: {
        es: 'Las naves espaciales reales no son aerodinámicas como aviones porque en el espacio no existe aire que las frene.',
        en: 'Real spacecraft are not streamlined like airplanes because there is no air in space to create drag.'
      },
      title: {
        es: 'MUSEO INTERACTIVO DE INGENIERÍA ESPACIAL',
        en: 'INTERACTIVE SPACE ENGINEERING MUSEUM'
      },
      detail: {
        es: 'Explora modelos reales de la NASA: observa las patas de aterrizaje del Módulo Lunar Apollo, la cabina presurizada del Rover SEV y el terreno real de los cráteres lunares.',
        en: 'Explore real NASA models: inspect the landing legs of the Apollo Lunar Module, the pressurized SEV Rover cabin, and real lunar crater terrain.'
      }
    }
  };

  window.openScienceLesson = function () {
    const lang = window.currentLang;
    const lesson = scienceLessons[window.currentLevel] || scienceLessons[1];
    audioSys.beep(780, 0.1);
    showModal(lesson.title[lang], lesson.detail[lang], [{ label: tr('understood') }], lesson.badge);
  };

  // ============ AUDIO ESPACIAL ============
  class SpaceAudio {
    constructor() { this.ctx = null; this.muted = false; }
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    toggle() {
      this.muted = !this.muted;
      document.getElementById('audioToggleBtn').textContent = this.muted ? '🔇' : '🔊';
      const bg = document.getElementById('bgMusic');
      if (this.muted) bg.pause(); else bg.play().catch(() => {});
    }
    quindar(intro = true) {
      if (this.muted) return; this.init();
      try {
        const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(intro ? 2525 : 2475, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.18);
      } catch (e) {}
    }
    beep(freq = 640, dur = 0.08, type = 'sine') {
      if (this.muted) return; this.init();
      try {
        const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + dur);
      } catch (e) {}
    }
    alarm() { this.beep(420, 0.15, 'sawtooth'); setTimeout(() => this.beep(560, 0.16, 'sawtooth'), 130); }
    success() { this.beep(523, 0.09, 'triangle'); setTimeout(() => this.beep(784, 0.16, 'triangle'), 85); }
  }
  window.audioSys = new SpaceAudio();

  // ============ CAPCOM CON RETARDO DE 1.28s ============
  window.capcom = {
    busy: false,
    say(msg, urgent = false, tip = "") {
      const el = document.getElementById('capcomText');
      if (!el) return;
      el.textContent = `[HOUSTON]: "${msg}"`;
      el.style.color = urgent ? '#fde047' : '#f8fafc';
      if (tip) document.getElementById('astraTip').textContent = tip;
    },
    transmit(txMsg, rxMsg, cb = null) {
      if (this.busy) return;
      this.busy = true;
      audioSys.quindar(true);
      const el = document.getElementById('capcomText'), fill = document.getElementById('delayFill');
      const prefix = window.currentLang === 'es' ? 'SEÑAL → TIERRA 384,400 KM' : 'SIGNAL → EARTH 384,400 KM';
      el.textContent = `[${prefix}]: "${txMsg}"`;
      el.style.color = '#38bdf8';
      const start = performance.now();
      const step = (now) => {
        const pct = Math.min(100, ((now - start) / 1280) * 100);
        if (fill) fill.style.width = pct + '%';
        if (now - start < 1280) requestAnimationFrame(step);
        else {
          if (fill) fill.style.width = '0%';
          audioSys.quindar(false);
          this.say(rxMsg); this.busy = false;
          if (cb) cb();
        }
      };
      requestAnimationFrame(step);
    },
    sendReport() {
      const es = window.currentLang === 'es';
      if (window.currentLevel === 1) {
        this.transmit(
          es ? "Houston, cabina Orion lista para frenado lunar." : "Houston, Orion cockpit ready for lunar braking.",
          es ? "Recibido. Ajusta giro PTC, sella escotillas y frena a 0 km/s." : "Copy. Set PTC roll, seal hatches, and brake to 0 km/s."
        );
      } else if (window.currentLevel === 1.5) {
        this.transmit(
          es ? "Houston, conduciendo Rover bajo gravedad 1/6 G." : "Houston, driving Rover under 1/6 G gravity.",
          es ? "Copiado. Esquiva los cráteres y llega al pórtico verde." : "Copy. Avoid craters and reach the green airlock gate."
        );
      } else if (window.currentLevel === 2) {
        const ready = lvl2.suitportClean && lvl2.uvDone && lvl2.presDone && lvl2.hydrated && lvl2.kilopowerOn && lvl2.eclssActive;
        if (!ready) {
          this.transmit(
            es ? "Houston, solicitando permiso de ingreso." : "Houston, requesting airlock entry clearance.",
            es ? "Aún faltan pasos: limpia el polvo, esteriliza UV, presuriza, haz chequeo médico e hidrátate." : "Steps missing: clean dust, UV sterilize, pressurize, pass medical check, and hydrate."
          );
        } else {
          this.transmit(
            es ? "Houston, traje descontaminado y signos vitales al 100%." : "Houston, suit decontaminated and vitals at 100%.",
            es ? "¡Excelente trabajo! Base Selene-Artemis lista para la noche lunar." : "Great job! Selene-Artemis Base ready for the lunar night.",
            () => { lvl2.reportDone = true; checkLevel2Win(); }
          );
        }
      } else if (window.currentLevel === 3) {
        this.transmit(
          es ? `Houston, reportando desde Base Lunar Día ${lvl3.day}/14.` : `Houston, reporting from Lunar Base Day ${lvl3.day}/14.`,
          es ? "Copiado. Mantén estables oxígeno, energía y comunicaciones." : "Copy. Keep oxygen, power, and comms nominal."
        );
      } else if (window.currentLevel === 4) {
        callHLSFromL4();
      } else if (window.currentLevel === 5) {
        this.transmit(
          es ? "Houston, explorando naves en el Museo 3D." : "Houston, inspecting spacecraft in the 3D Museum.",
          es ? "Usa el ratón o dedo para girar las naves y hacer zoom." : "Drag with mouse or finger to rotate and zoom the models."
        );
      }
    }
  };

  // ============ LOGIN Y NAVEGACIÓN ============
  window.goToLogin = function () {
    audioSys.init();
    audioSys.beep(720, 0.1);
    document.getElementById('coverScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    const userInput = document.getElementById('username');
    if (userInput) userInput.focus();
  };

  window.login = function () {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if (!user || pass.length < 3) {
      document.getElementById('errorMsg').textContent = tr('loginError');
      return;
    }
    window.commanderName = user;
    audioSys.success();
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    window.gameStarted = true;
    resize();
    canvas.focus();
    loadLevel(1);

    const bg = document.getElementById('bgMusic');
    if (bg) { bg.volume = 0.32; bg.play().catch(() => {}); }
  };

  document.getElementById('password')?.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  document.getElementById('username')?.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('password')?.focus(); });

  // ============ CANVAS, JOYSTICK Y CONTROLES ============
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const joyState = { active: false, x: 0, z: 0 };
  const joyEl = document.getElementById('joystick');
  const stickEl = document.getElementById('stick');

  function handleJoyMove(clientX, clientY) {
    const rect = joyEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2, maxR = 36;
    let dx = clientX - cx, dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
    stickEl.style.transform = `translate(${dx}px, ${dy}px)`;
    joyState.x = dx / maxR; joyState.z = -dy / maxR;
  }

  function resetJoy() {
    joyState.active = false; joyState.x = 0; joyState.z = 0;
    if (stickEl) stickEl.style.transform = 'translate(0px, 0px)';
  }

  joyEl?.addEventListener('mousedown', e => { joyState.active = true; handleJoyMove(e.clientX, e.clientY); });
  window.addEventListener('mousemove', e => { if (joyState.active) handleJoyMove(e.clientX, e.clientY); });
  window.addEventListener('mouseup', () => { if (joyState.active) resetJoy(); });

  canvas.addEventListener('touchstart', e => {
    if (e.touches.length > 0) {
      audioSys.init();
      mouse.down = true;
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      onCanvasClick();
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      onCanvasMove();
    }
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    mouse.down = false;
    if (lvl3) lvl3.holdActive = false;
    if (lvl2) { lvl2.uvHolding = false; lvl2.presHolding = false; }
  });

  joyEl?.addEventListener('touchstart', e => { e.preventDefault(); joyState.active = true; handleJoyMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  joyEl?.addEventListener('touchmove', e => { e.preventDefault(); if (joyState.active) handleJoyMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  joyEl?.addEventListener('touchend', resetJoy);

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (renderer3D && camera3D) {
      camera3D.aspect = window.innerWidth / window.innerHeight;
      camera3D.updateProjectionMatrix();
      renderer3D.setSize(window.innerWidth, window.innerHeight);
    }
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('keydown', e => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.type !== 'range') return;
    activeKeys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  }, true);

  window.addEventListener('keyup', e => { activeKeys[e.code] = false; }, true);
  window.addEventListener('blur', () => { activeKeys = {}; });

  canvas.addEventListener('mousedown', e => {
    audioSys.init(); mouse.down = true; mouse.x = e.clientX; mouse.y = e.clientY; onCanvasClick();
  });
  canvas.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY; onCanvasMove();
  });
  window.addEventListener('mouseup', () => {
    mouse.down = false;
    if (lvl3) lvl3.holdActive = false;
    if (lvl2) { lvl2.uvHolding = false; lvl2.presHolding = false; }
  });

  window.showModal = function (title, text, buttons, badge = '🚀') {
    window.paused = true; activeKeys = {};
    document.getElementById('modalBadge').textContent = badge;
    document.getElementById('messageTitle').textContent = title;
    document.getElementById('messageText').textContent = text;
    const box = document.getElementById('modalBtns'); box.innerHTML = '';
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.textContent = b.label;
      if (b.secondary) btn.className = 'secondary';
      btn.onclick = () => {
        document.getElementById('messageScreen').style.display = 'none';
        window.paused = false;
        if (window.currentLevel !== 5) canvas.focus();
        if (b.action) b.action();
      };
      box.appendChild(btn);
    });
    document.getElementById('messageScreen').style.display = 'flex';
  };

  // ============ THREE.JS (MUSEO 3D INTERACTIVO) ============
  window.initThreeJS = function () {
    const container = document.getElementById('threeContainer');
    container.innerHTML = '';
    scene3D = new THREE.Scene();

    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000 * 3; i++) starPos[i] = (Math.random() - 0.5) * 2000;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.3 }));
    scene3D.add(stars);

    camera3D = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera3D.position.set(0, 4, 12);

    renderer3D = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer3D.setSize(window.innerWidth, window.innerHeight);
    renderer3D.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer3D.domElement);

    if (typeof THREE.OrbitControls !== 'undefined') {
      controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
      controls3D.enableDamping = true;
      controls3D.dampingFactor = 0.05;
      controls3D.addEventListener('start', () => { autoRotate3D = false; });
    }

    scene3D.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    scene3D.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    backLight.position.set(-5, -5, -7);
    scene3D.add(backLight);

    function animate3D() {
      requestAnimationFrame(animate3D);
      if (window.currentLevel !== 5) return;
      if (currentModel && autoRotate3D) currentModel.rotation.y += 0.005;
      if (controls3D) controls3D.update();
      stars.rotation.y += 0.0001;
      renderer3D.render(scene3D, camera3D);
    }
    animate3D();
  };

  window.cargarModeloNASA = function (fileName, btnElement = null) {
    if (!window.THREE) return;
    if (!renderer3D) initThreeJS();
    if (currentModel) { scene3D.remove(currentModel); currentModel = null; }
    autoRotate3D = true;

    if (btnElement) {
      document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
      btnElement.classList.add('active');
    }

    const isGLB = fileName.toLowerCase().endsWith('.glb');
    if (isGLB && typeof THREE.GLTFLoader === 'undefined') return;
    if (!isGLB && typeof THREE.STLLoader === 'undefined') return;

    const loader = isGLB ? new THREE.GLTFLoader() : new THREE.STLLoader();
    const encoded = encodeURIComponent(fileName);
    const urls = [
      `https://cdn.jsdelivr.net/gh/MAGO0599/Astraeus@main/modelos/${encoded}`,
      `https://cdn.jsdelivr.net/gh/MAGO0599/Astraeus@main/ASTRAEUS_1/modelos/${encoded}`,
      `modelos/${encoded}`
    ];
    const es = window.currentLang === 'es';

    capcom.say(es ? `Cargando modelo 3D: ${fileName}...` : `Loading 3D model: ${fileName}...`);

    function tryLoad(idx) {
      if (idx >= urls.length) {
        capcom.say(es ? `⚠ No se pudo cargar "${fileName}".` : `⚠ Could not load "${fileName}".`, true);
        return;
      }
      loader.load(
        urls[idx],
        (result) => {
          if (isGLB) {
            currentModel = result.scene;
          } else {
            result.computeVertexNormals();
            const material = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.45, metalness: 0.25 });
            currentModel = new THREE.Mesh(result, material);
          }

          const box = new THREE.Box3().setFromObject(currentModel);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const scale = 5.5 / maxDim;
            currentModel.scale.set(scale, scale, scale);
            currentModel.position.sub(center.multiplyScalar(scale));
          }

          scene3D.add(currentModel);
          if (controls3D) {
            camera3D.position.set(0, 4, 12);
            controls3D.target.set(0, 0, 0);
            controls3D.update();
          }
          capcom.say(es ? `¡Listo! Arrastra con el dedo o ratón para girar "${fileName}".` : `Ready! Drag with mouse or touch to rotate "${fileName}".`);
        },
        undefined,
        () => tryLoad(idx + 1)
      );
    }

    tryLoad(0);
  };

  // ============ GESTOR DE NIVELES ============
  window.loadLevel = function (lvl) {
    window.currentLevel = lvl; window.paused = false; activeKeys = {}; resetJoy();
    document.getElementById('messageScreen').style.display = 'none';
    document.getElementById('visorEffects').style.boxShadow = 'none';
    document.getElementById('blurOverlay').style.backdropFilter = 'blur(0px)';
    document.getElementById('blurOverlay').style.background = 'rgba(56, 189, 248, 0)';
    document.getElementById('alarma').classList.remove('activa');
    document.getElementById('walkBar').style.display = lvl === 3 ? 'flex' : 'none';
    document.getElementById('joystick').style.display = (lvl === 1.5 || lvl === 4) ? 'block' : 'none';

    const lesson = scienceLessons[lvl] || scienceLessons[1];
    document.getElementById('scienceFact').textContent = lesson.fact[window.currentLang];

    const is3D = lvl === 5;
    document.getElementById('gameCanvas').style.display = is3D ? 'none' : 'block';
    document.getElementById('threeContainer').style.display = is3D ? 'block' : 'none';
    document.getElementById('modelSelector').style.display = is3D ? 'flex' : 'none';
    document.querySelector('.hud').style.display = is3D ? 'none' : 'flex';
    document.querySelector('.right-dock').style.display = is3D ? 'none' : 'flex';
    document.querySelector('.astra-helper').style.display = is3D ? 'none' : 'flex';

    const navIds = ['1', '15', '2', '3', '4', '5'];
    const targetId = lvl === 1.5 ? '15' : String(lvl);
    navIds.forEach(id => document.getElementById(`nav-${id}`)?.classList.toggle('active', id === targetId));

    if (document.activeElement) document.activeElement.blur();

    if (is3D) {
      if (!renderer3D) initThreeJS();
      if (!currentModel) cargarModeloNASA('Apolo_lunar.glb', document.querySelector('.model-btn'));
      return;
    }

    canvas.focus();
    if (lvl === 1) initLevel1();
    if (lvl === 1.5) initLevel15();
    if (lvl === 2) initLevel2();
    if (lvl === 3) initLevel3();
    if (lvl === 4) initLevel4();
  };

  /* ============================================================================
     ETAPA 1: CABINA ORION
     ============================================================================ */
  function updateLvl1Texts() {
    const es = window.currentLang === 'es';
    document.getElementById('objTitle').textContent = es ? '◈ ETAPA 1 · CABINA ORION' : '◈ STAGE 1 · ORION COCKPIT';
    document.getElementById('objectiveText').textContent = es
      ? '1) Ajusta giro PTC entre 1.5 y 1.8 RPM. 2) Cierra escotillas. 3) Mantén el Retro-Freno hasta llegar a 0 km/s.'
      : '1) Set PTC roll between 1.5 and 1.8 RPM. 2) Seal hatches. 3) Hold Retro-Brake down to 0 km/s.';
  }

  function initLevel1() {
    updateLvl1Texts();
    lvl1 = {
      yaw: 0, deltaV: 2800, hull: 100, velocity: 1.60,
      ptcRpm: 0.4, ptcOk: false, hatch1: false, hatch2: false, depressurized: false,
      meteorPrompted: false, timer: 0, rocks: [], thrust: false, done: false
    };
    const es = window.currentLang === 'es';
    capcom.say(
      es ? `¡Hola ${commanderName}! Estabiliza el giro térmico PTC y sella las escotillas antes de frenar.` : `Hello ${commanderName}! Stabilize PTC thermal roll and seal hatches before braking.`,
      false,
      es ? "Mueve el control PTC hasta que marque verde (1.5 - 1.8 RPM) y luego mantén pulsado Retro-Freno." : "Slide PTC roll into the green zone (1.5 - 1.8 RPM), then hold Retro-Brake."
    );
    renderLvl1Console();
  }

  window.renderLvl1Console = function () {
    const es = window.currentLang === 'es';
    document.getElementById('levelConsole').innerHTML = `
      <div class="ctrl-group ${!lvl1.ptcOk ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${es ? '1. Giro Térmico PTC' : '1. PTC Thermal Roll'}</span><span style="color:${lvl1.ptcOk ? '#4ade80' : '#fde047'}">${lvl1.ptcRpm.toFixed(1)} RPM</span></div>
        <div class="ctrl-desc">${es ? 'Pon la barra entre <b>1.5 y 1.8 RPM</b> para repartir el calor del Sol.' : 'Set slider between <b>1.5 and 1.8 RPM</b> to distribute solar heat.'}</div>
        <input type="range" min="0" max="3" step="0.1" value="${lvl1.ptcRpm}" oninput="lvl1.ptcRpm=parseFloat(this.value); lvl1.ptcOk=(lvl1.ptcRpm>=1.5&&lvl1.ptcRpm<=1.8); renderLvl1Console();">
      </div>
      <div class="ctrl-group ${lvl1.ptcOk && (!lvl1.hatch1 || !lvl1.hatch2 || !lvl1.depressurized) ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${es ? '2. Escotillas de Seguridad' : '2. Safety Hatches'}</span></div>
        <div class="btn-grid-2" style="margin-bottom:5px;">
          <button class="btn-action ${lvl1.hatch1 ? 'done' : ''}" onclick="lvl1.hatch1=!lvl1.hatch1; audioSys.beep(); renderLvl1Console();">${es ? 'Escotilla 1' : 'Hatch 1'}: ${lvl1.hatch1 ? (es ? 'SELLADA' : 'SEALED') : (es ? 'ABIERTA' : 'OPEN')}</button>
          <button class="btn-action ${lvl1.hatch2 ? 'done' : ''}" onclick="lvl1.hatch2=!lvl1.hatch2; audioSys.beep(); renderLvl1Console();">${es ? 'Escotilla 2' : 'Hatch 2'}: ${lvl1.hatch2 ? (es ? 'SELLADA' : 'SEALED') : (es ? 'ABIERTA' : 'OPEN')}</button>
        </div>
        <button class="btn-action ${lvl1.depressurized ? 'done' : ''}" onclick="lvl1.depressurized=!lvl1.depressurized; audioSys.beep(); renderLvl1Console();">
          ${lvl1.depressurized ? (es ? '✔ Cabina Lista para Vacío' : '✔ Cabin Ready for Vacuum') : (es ? 'Preparar Despresurización' : 'Prepare Depressurization')}
        </button>
      </div>
      <div class="ctrl-group ${lvl1.ptcOk && lvl1.hatch1 && lvl1.hatch2 && lvl1.depressurized ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${es ? '3. Motor Retro-Freno' : '3. Retro-Brake Engine'}</span><span>${lvl1.velocity.toFixed(2)} km/s</span></div>
        <button class="btn-action warn" onmousedown="lvl1.thrust=true" onmouseup="lvl1.thrust=false" onmouseleave="lvl1.thrust=false" ontouchstart="lvl1.thrust=true" ontouchend="lvl1.thrust=false">
          ${es ? '🔥 MANTENER RETRO-FRENO [ESPACIO]' : '🔥 HOLD RETRO-BRAKE [SPACE]'}
        </button>
      </div>
    `;
  };

  /* ============================================================================
     ETAPA 2: ROVER LUNAR (1/6 G)
     ============================================================================ */
  function updateLvl15Texts() {
    const es = window.currentLang === 'es';
    document.getElementById('objTitle').textContent = es ? '◈ ETAPA 2 · ROVER LUNAR (1/6 G)' : '◈ STAGE 2 · LUNAR ROVER (1/6 G)';
    document.getElementById('objectiveText').textContent = es
      ? 'Camina hacia el Rover con WASD o el Joystick, súbete y conduce esquivando cráteres hasta la Estación Artemis.'
      : 'Walk to the Rover using WASD or Joystick, board it, and drive around craters to Artemis Station.';
  }

  function initLevel15() {
    updateLvl15Texts();
    lvl15 = {
      mode: 'walk', x: 0, z: 18, vx: 0, vz: 0, yBounce: 0, vyBounce: 0,
      roverPos: { x: 24, z: 72 }, stationPos: { x: 0, z: 320 },
      craters: [
        { x: -32, z: 135, r: 24 }, { x: 36, z: 175, r: 26 },
        { x: -12, z: 225, r: 25 }, { x: 45, z: 265, r: 24 }, { x: -48, z: 280, r: 22 }
      ],
      touchDir: { x: 0, z: 0 }, suitO2: 100, crashed: false, arrived: false
    };
    const es = window.currentLang === 'es';
    capcom.say(
      es ? "¡Pisaste la Luna! Acércate al Rover LTV usando el Joystick o WASD." : "You stepped on the Moon! Walk to the LTV Rover using the Joystick or WASD.",
      false,
      es ? "Nota cómo rebotas suavemente: la gravedad lunar es 6 veces más débil que en la Tierra." : "Notice the gentle bounce: lunar gravity is 6 times weaker than Earth's."
    );
    renderLvl15Console();
  }

  window.boardRover15 = function () {
    if (lvl15.mode === 'drive') return;
    const es = window.currentLang === 'es';
    const distToRover = Math.hypot(lvl15.x - lvl15.roverPos.x, lvl15.z - lvl15.roverPos.z);
    if (distToRover <= 28) {
      lvl15.mode = 'drive'; lvl15.x = lvl15.roverPos.x; lvl15.z = lvl15.roverPos.z;
      lvl15.vx = 0; lvl15.vz = 0; lvl15.vyBounce = 14;
      audioSys.success();
      capcom.say(es ? "¡Subiste al Rover! Conduce hacia la entrada verde de la Estación Artemis." : "Boarded Rover! Drive toward the green entrance of Artemis Station.");
      renderLvl15Console();
    } else {
      audioSys.alarm();
      capcom.say(es ? `Faltan ${Math.round(distToRover)}m para llegar al Rover.` : `${Math.round(distToRover)}m away from Rover. Get closer.`, true);
    }
  };

  window.renderLvl15Console = function () {
    const es = window.currentLang === 'es';
    const distRover = Math.round(Math.hypot(lvl15.x - lvl15.roverPos.x, lvl15.z - lvl15.roverPos.z));
    const distStation = Math.round(Math.hypot(lvl15.x - lvl15.stationPos.x, lvl15.z - lvl15.stationPos.z));
    const nearRover = distRover <= 28;

    document.getElementById('levelConsole').innerHTML = `
      <div class="ctrl-group ${lvl15.mode === 'walk' ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${es ? '1. Subir al Rover LTV' : '1. Board LTV Rover'}</span><span>${lvl15.mode === 'drive' ? (es ? 'A BORDO' : 'ONBOARD') : distRover + 'm'}</span></div>
        <button class="btn-action ${lvl15.mode === 'drive' ? 'done' : (nearRover ? 'warn' : '')}" onclick="boardRover15()" ${lvl15.mode === 'drive' ? 'disabled' : ''}>
          ${lvl15.mode === 'drive' ? (es ? '✔ Conduciendo Rover LTV' : '✔ Driving LTV Rover') : (nearRover ? (es ? '🚙 ¡SUBIR AL ROVER AHORA!' : '🚙 BOARD ROVER NOW!') : (es ? `Acércate al Rover (${distRover}m)` : `Approach Rover (${distRover}m)`))}
        </button>
      </div>
      <div class="ctrl-group ${lvl15.mode === 'drive' ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${es ? '2. Ruta a Estación' : '2. Route to Station'}</span><span>${distStation}m</span></div>
        <div class="ctrl-desc">${es ? 'Usa el Joystick circular o estas flechas:' : 'Use the circular Joystick or these arrows:'}</div>
        <div class="btn-grid-3">
          <div></div>
          <button class="btn-action" onmousedown="lvl15.touchDir.z=1" onmouseup="lvl15.touchDir.z=0" onmouseleave="lvl15.touchDir.z=0" ontouchstart="lvl15.touchDir.z=1" ontouchend="lvl15.touchDir.z=0">▲</button>
          <div></div>
          <button class="btn-action" onmousedown="lvl15.touchDir.x=-1" onmouseup="lvl15.touchDir.x=0" onmouseleave="lvl15.touchDir.x=0" ontouchstart="lvl15.touchDir.x=-1" ontouchend="lvl15.touchDir.x=0">◀</button>
          <button class="btn-action" onmousedown="lvl15.touchDir.z=-1" onmouseup="lvl15.touchDir.z=0" onmouseleave="lvl15.touchDir.z=0" ontouchstart="lvl15.touchDir.z=-1" ontouchend="lvl15.touchDir.z=0">▼</button>
          <button class="btn-action" onmousedown="lvl15.touchDir.x=1" onmouseup="lvl15.touchDir.x=0" onmouseleave="lvl15.touchDir.x=0" ontouchstart="lvl15.touchDir.x=1" ontouchend="lvl15.touchDir.x=0">▶</button>
        </div>
      </div>
    `;
  };

  /* ============================================================================
     ETAPA 3: AIRLOCK Y CHEQUEO MÉDICO
     ============================================================================ */
  function updateLvl2Texts() {
    const es = window.currentLang === 'es';
    document.getElementById('objTitle').textContent = es ? '◈ ETAPA 3 · AIRLOCK SUITPORT' : '◈ STAGE 3 · SUITPORT AIRLOCK';
    document.getElementById('objectiveText').textContent = es
      ? 'Limpia el polvo lunar pasando el dedo/ratón por el traje, esteriliza con UV, presuriza y equilibra tus signos vitales.'
      : 'Wipe lunar dust off the suit with mouse/touch, UV sterilize, pressurize, and balance your vital signs.';
  }

  function initLevel2() {
    updateLvl2Texts();
    const isMobile = canvas.width <= 768;
    const cx = canvas.width * (isMobile ? 0.26 : 0.42), cy = canvas.height * 0.56;
    const dustSpots = [
      { ox: -18, oy: -102, r: 16 }, { ox: 14, oy: -98, r: 15 }, { ox: 0, oy: -115, r: 13 },
      { ox: -32, oy: -25, r: 20 }, { ox: 28, oy: -18, r: 19 }, { ox: 0, oy: 12, r: 22 },
      { ox: -68, oy: 15, r: 16 }, { ox: 68, oy: 20, r: 16 },
      { ox: -28, oy: 92, r: 19 }, { ox: 28, oy: 95, r: 19 },
      { ox: -34, oy: 132, r: 17 }, { ox: 34, oy: 132, r: 17 }
    ];
    lvl2 = {
      visorDust: dustSpots.map(s => ({ x: cx + s.ox, y: cy + s.oy, r: s.r, clean: false })),
      suitportClean: false, uvPct: 0, uvHolding: false, uvDone: false,
      presPct: 0, presHolding: false, presDone: false, mareoTimer: 0, mareoDone: false,
      spo2: 92, pulso: 105, tension: 100, establePct: 0, medDone: false,
      hydrated: false, kilopowerOn: false, eclssActive: false, reportDone: false
    };
    const es = window.currentLang === 'es';
    capcom.say(
      es ? "Antes de entrar a la base, limpia el regolito del traje pasando el cursor por encima." : "Before entering the base, wipe regolith dust off the suit by dragging across it.",
      false,
      es ? "El polvo lunar es afilado como vidrio: primero lo limpiamos y luego esterilizamos con luz UV." : "Lunar dust is sharp like glass: first wipe it clean, then sterilize with UV light."
    );
    renderLvl2Console();
  }

  window.renderLvl2Console = function () {
    const es = window.currentLang === 'es';
    const cleanPct = Math.round((lvl2.visorDust.filter(d => d.clean).length / lvl2.visorDust.length) * 100);
    const spo2Pos = ((lvl2.spo2 - 70) / 30) * 100;
    const pulsoPos = ((lvl2.pulso - 40) / 120) * 100;
    const tensPos = ((lvl2.tension - 60) / 100) * 100;

    let airlockSubUI = '';
    if (!lvl2.uvDone) {
      airlockSubUI = `
        <div class="ctrl-desc">${es ? 'Mantén presionado para desinfectar con luz UV' : 'Hold button to disinfect with UV light'} (<b>${Math.round(lvl2.uvPct)}%</b>):</div>
        <button class="btn-action warn" onmousedown="lvl2.uvHolding=true" onmouseup="lvl2.uvHolding=false" onmouseleave="lvl2.uvHolding=false" ontouchstart="lvl2.uvHolding=true" ontouchend="lvl2.uvHolding=false">${es ? '☀️ ESTERILIZAR UV (Mantener)' : '☀️ UV STERILIZE (Hold)'}</button>
        <div class="task-progress-box"><div class="task-progress-bar"><div class="task-progress-fill" style="width:${lvl2.uvPct}%"></div></div></div>
      `;
    } else if (!lvl2.presDone) {
      airlockSubUI = `
        <div class="ctrl-desc">${es ? 'Mantén presionado para llenar de aire la cámara' : 'Hold button to fill chamber with air'} (<b>${Math.round(lvl2.presPct)}%</b>):</div>
        <button class="btn-action warn" onmousedown="lvl2.presHolding=true" onmouseup="lvl2.presHolding=false" onmouseleave="lvl2.presHolding=false" ontouchstart="lvl2.presHolding=true" ontouchend="lvl2.presHolding=false">${es ? '💨 PRESURIZAR AIRLOCK (Mantener)' : '💨 PRESSURIZE AIRLOCK (Hold)'}</button>
        <div class="task-progress-box"><div class="task-progress-bar"><div class="task-progress-fill" style="width:${lvl2.presPct}%"></div></div></div>
      `;
    } else if (!lvl2.mareoDone) {
      const mareoPct = Math.min(100, Math.round((lvl2.mareoTimer / 3.2) * 100));
      airlockSubUI = `
        <div class="ctrl-desc" style="color:#fde047;">${es ? '😵 Te quitaste el casco y tu oído se adapta a la baja gravedad...' : '😵 Helmet off! Your inner ear is adapting to low lunar gravity...'}</div>
        <div class="task-progress-box"><div class="task-progress-bar"><div class="task-progress-fill" style="width:${mareoPct}%"></div></div></div>
      `;
    } else if (!lvl2.medDone) {
      airlockSubUI = `
        <div class="ctrl-desc">${es ? 'Lleva las 3 barras azules dentro de la <b>zona verde</b>' : 'Align all 3 blue bars inside the <b>green zone</b>'} (<b>${Math.round(lvl2.establePct)}%</b>):</div>
        <div class="gauge-box">
          <div class="gauge-label"><span>${es ? 'Oxígeno SpO₂' : 'Oxygen SpO₂'} (95-99%)</span><span>${lvl2.spo2}%</span></div>
          <div class="gauge-track"><div class="gauge-zone" style="left:83%;width:14%"></div><div class="gauge-marker" style="left:${spo2Pos}%"></div></div>
          <input type="range" min="70" max="100" value="${lvl2.spo2}" oninput="lvl2.spo2=parseInt(this.value); renderLvl2Console();">
        </div>
        <div class="gauge-box">
          <div class="gauge-label"><span>${es ? 'Pulso' : 'Heart Rate'} (65-85 bpm)</span><span>${lvl2.pulso} bpm</span></div>
          <div class="gauge-track"><div class="gauge-zone" style="left:21%;width:17%"></div><div class="gauge-marker" style="left:${pulsoPos}%"></div></div>
          <input type="range" min="40" max="160" value="${lvl2.pulso}" oninput="lvl2.pulso=parseInt(this.value); renderLvl2Console();">
        </div>
        <div class="gauge-box">
          <div class="gauge-label"><span>${es ? 'Tensión' : 'Blood Pressure'} (110-125)</span><span>${lvl2.tension} mmHg</span></div>
          <div class="gauge-track"><div class="gauge-zone" style="left:50%;width:15%"></div><div class="gauge-marker" style="left:${tensPos}%"></div></div>
          <input type="range" min="60" max="160" value="${lvl2.tension}" oninput="lvl2.tension=parseInt(this.value); renderLvl2Console();">
        </div>
        <div class="task-progress-box"><div class="task-progress-bar"><div class="task-progress-fill" style="width:${lvl2.establePct}%"></div></div></div>
      `;
    } else {
      airlockSubUI = `
        <button class="btn-action ${lvl2.hydrated ? 'done' : 'warn'}" onclick="lvl2.hydrated=true; audioSys.success(); renderLvl2Console(); checkLevel2Win();">
          ${lvl2.hydrated ? (es ? '✔ Hidratación Completada' : '✔ Hydration Complete') : (es ? '💧 BEBER AGUA (Recuperar Energía)' : '💧 DRINK WATER (Hydrate)')}
        </button>
      `;
    }

    document.getElementById('levelConsole').innerHTML = `
      <div class="ctrl-group ${!lvl2.suitportClean ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${es ? '1. Limpiar Polvo Lunar' : '1. Clean Lunar Dust'}</span><span>${cleanPct}%</span></div>
        <div class="ctrl-desc">${es ? 'Pasa el ratón o dedo sobre las manchas grises del traje.' : 'Drag mouse or finger over the gray dust spots on the suit.'}</div>
      </div>
      <div class="ctrl-group ${lvl2.suitportClean && !lvl2.hydrated ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${es ? '2. Descontaminación y Salud' : '2. Decontamination & Vitals'}</span><span>${lvl2.hydrated ? 'OK' : 'ACTIVO'}</span></div>
        ${airlockSubUI}
      </div>
      <div class="ctrl-group ${lvl2.hydrated && (!lvl2.kilopowerOn || !lvl2.eclssActive) ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${es ? '3. Encender Base y Reportar' : '3. Power Base & Report'}</span></div>
        <div class="btn-grid-2" style="margin-bottom:5px;">
          <button class="btn-action ${lvl2.kilopowerOn ? 'done' : ''}" onclick="lvl2.kilopowerOn=true; audioSys.success(); renderLvl2Console(); checkLevel2Win();">⚡ Kilopower 10kW</button>
          <button class="btn-action ${lvl2.eclssActive ? 'done' : ''}" onclick="lvl2.eclssActive=true; audioSys.success(); renderLvl2Console(); checkLevel2Win();">💧 ${es ? 'Reciclaje Agua' : 'Water Recycling'}</button>
        </div>
        <div class="ctrl-desc" style="margin-bottom:0;">${es ? 'Luego pulsa <b>📡 LLAMAR A HOUSTON</b> abajo.' : 'Then press <b>📡 CALL HOUSTON</b> below.'}</div>
      </div>
    `;
  };

  window.checkLevel2Win = function () {
    const es = window.currentLang === 'es';
    if (lvl2.suitportClean && lvl2.uvDone && lvl2.presDone && lvl2.medDone && lvl2.hydrated && lvl2.kilopowerOn && lvl2.eclssActive && lvl2.reportDone) {
      showModal(
        es ? '🌕 ¡INGRESO A LA BASE COMPLETADO!' : '🌕 BASE ENTRY COMPLETE!',
        es ? `¡Bien hecho, ${commanderName}! Tu traje está limpio, tus signos vitales son perfectos y la estación tiene energía.` : `Well done, ${commanderName}! Your suit is clean, vitals are optimal, and the base is powered up.`,
        [{ label: es ? 'ENTRAR A LA BASE LUNAR (ETAPA 4)' : 'ENTER LUNAR BASE (STAGE 4)', action: () => loadLevel(3) }],
        '🏅'
      );
    }
  };

  /* ============================================================================
     ETAPA 4: BASE LUNAR (14 DÍAS DE NOCHE LUNAR)
     ============================================================================ */
  const day3Catalog = [
    null,
    { room: 0, roomName: { es: 'PUENTE CENTRAL', en: 'CENTRAL BRIDGE' }, station: { es: 'OXÍGENO & PANELES', en: 'OXYGEN & SOLAR' }, type: 'dualSlider',
      title: { es: 'Día 1: Oxígeno (21%) & Paneles (80%)', en: 'Day 1: Oxygen (21%) & Solar (80%)' },
      desc: { es: 'Ajusta el Oxígeno al 21% y orienta los Paneles al 80%.', en: 'Set Oxygen to 21% and align Solar Panels to 80%.' },
      s1: { label: { es: 'Oxígeno Cabina', en: 'Cabin Oxygen' }, min: 15, max: 25, target: 21, unit: '%' },
      s2: { label: { es: 'Ángulo Solar', en: 'Solar Angle' }, min: 0, max: 100, target: 80, unit: '%' }
    },
    { room: 0, roomName: { es: 'PUENTE CENTRAL', en: 'CENTRAL BRIDGE' }, station: { es: 'BATERÍAS TÉRMICAS', en: 'THERMAL BATTERIES' }, type: 'sequence',
      title: { es: 'Día 2: Calentar Baterías (-173 °C)', en: 'Day 2: Warm Batteries (-173 °C)' },
      desc: { es: 'Activa los 3 calentadores en orden: 1 → 2 → 3.', en: 'Activate all 3 heaters in order: 1 → 2 → 3.' },
      labels: { es: ['1. Banco A', '2. Banco B', '3. Bus Central'], en: ['1. Bank A', '2. Bank B', '3. Main Bus'] }
    },
    { room: -1, roomName: { es: 'SALA IZQUIERDA (ESCLUSA)', en: 'LEFT BAY (AIRLOCK)' }, station: { es: 'RECICLAJE DE AGUA', en: 'WATER RECYCLING' }, type: 'pump',
      title: { es: 'Día 3: Reciclar Agua (87 → 200 L)', en: 'Day 3: Recycle Water (87 → 200 L)' },
      desc: { es: 'Ve a Sala Izquierda [A] y pulsa 6 veces para purificar el agua.', en: 'Walk to Left Bay [A] and pump 6 times to purify water.' },
      targetPumps: 6, btnLabel: { es: '♻️ Purificar Ciclo de Agua', en: '♻️ Pump Water Cycle' }
    },
    { room: -1, roomName: { es: 'SALA IZQUIERDA (ESCLUSA)', en: 'LEFT BAY (AIRLOCK)' }, station: { es: 'ESCLUSA TÉRMICA', en: 'THERMAL AIRLOCK' }, type: 'scrub',
      title: { es: 'Día 4: Sellar Escotilla con Kapton', en: 'Day 4: Seal Hatch with Kapton' },
      desc: { es: 'Ve a Sala Izquierda [A] y pasa el cursor sobre los 5 puntos de fuga.', en: 'Walk to Left Bay [A] and wipe across the 5 leak spots.' }
    },
    { room: 0, roomName: { es: 'PUENTE CENTRAL', en: 'CENTRAL BRIDGE' }, station: { es: 'ANTENA HACIA LA TIERRA', en: 'EARTH ANTENNA' }, type: 'antenna',
      title: { es: 'Día 5: Apuntar Antena a la Tierra', en: 'Day 5: Aim Antenna at Earth' },
      desc: { es: 'Usa ◀ y ▶ para girar la antena hasta alcanzar 100% de señal.', en: 'Use ◀ and ▶ to rotate the dish until signal hits 100%.' },
      targetAngle: 35
    },
    { room: 1, roomName: { es: 'SALA DERECHA (BAHÍA)', en: 'RIGHT BAY (ROVER)' }, station: { es: 'ROVER LTV', en: 'LTV ROVER' }, type: 'scrub',
      title: { es: 'Día 6: Limpiar Regolito del Rover', en: 'Day 6: Clean Regolith off Rover' },
      desc: { es: 'Ve a Sala Derecha [D] y limpia las 7 manchas de polvo del Rover.', en: 'Walk to Right Bay [D] and wipe the 7 dust spots off the Rover.' }
    },
    { room: -1, roomName: { es: 'SALA IZQUIERDA (ESCLUSA)', en: 'LEFT BAY (AIRLOCK)' }, station: { es: 'FILTROS HEPA', en: 'HEPA FILTERS' }, type: 'pump',
      title: { es: 'Día 7: Limpiar Filtros HEPA', en: 'Day 7: Clean HEPA Filters' },
      desc: { es: 'Ve a Sala Izquierda [A] y realiza 6 ciclos de aspirado.', en: 'Walk to Left Bay [A] and run 6 vacuum cycles.' },
      targetPumps: 6, btnLabel: { es: '🫁 Aspirar Polvo Lunar', en: '🫁 Vacuum Lunar Dust' }
    },
    { room: 1, roomName: { es: 'SALA DERECHA (LAB)', en: 'RIGHT BAY (LAB)' }, station: { es: 'RADIOTELESCOPIO LuSEE', en: 'LuSEE RADIO' }, type: 'dualSlider',
      title: { es: 'Día 8: Sintonizar Radio Lunar', en: 'Day 8: Tune Lunar Radio' },
      desc: { es: 'Ve a Sala Derecha [D]: ajusta frecuencia a 75 MHz y presión a 40 PSI.', en: 'Walk to Right Bay [D]: tune frequency to 75 MHz and pressure to 40 PSI.' },
      s1: { label: { es: 'Frecuencia Radio', en: 'Radio Frequency' }, min: 40, max: 100, target: 75, unit: 'MHz' },
      s2: { label: { es: 'Presión Bomba', en: 'Pump Pressure' }, min: 15, max: 60, target: 40, unit: 'PSI' }
    },
    { room: 1, roomName: { es: 'SALA DERECHA (LAB)', en: 'RIGHT BAY (LAB)' }, station: { es: 'GENERADOR MMRTG', en: 'MMRTG GENERATOR' }, type: 'hold',
      title: { es: 'Día 9: Extender Brazo MMRTG', en: 'Day 9: Extend MMRTG Boom' },
      desc: { es: 'Ve a Sala Derecha [D] y mantén pulsado el botón 2.5 segundos.', en: 'Walk to Right Bay [D] and hold button for 2.5 seconds.' },
      holdTime: 2.5, btnLabel: { es: '☢️ Mantener Despliegue', en: '☢️ Hold Deployment' }
    },
    { room: -1, roomName: { es: 'SALA IZQUIERDA (ESCLUSA)', en: 'LEFT BAY (AIRLOCK)' }, station: { es: 'FILTRO CO₂ APOLLO 13', en: 'APOLLO 13 CO₂ FILTER' }, type: 'sequence',
      title: { es: 'Día 10: Adaptador "Mailbox" CO₂', en: 'Day 10: CO₂ "Mailbox" Adapter' },
      desc: { es: 'En Sala Izquierda [A], une las piezas en orden: 1 → 2 → 3.', en: 'In Left Bay [A], assemble parts in order: 1 → 2 → 3.' },
      labels: { es: ['1. Filtro Cuadrado', '2. Cubierta', '3. Cinta Selladora'], en: ['1. Square Filter', '2. Cover', '3. Duct Tape'] }
    },
    { room: 1, roomName: { es: 'SALA DERECHA (LAB)', en: 'RIGHT BAY (LAB)' }, station: { es: 'INVERNADERO ESPACIAL', en: 'SPACE GREENHOUSE' }, type: 'scrub',
      title: { es: 'Día 11: Descongelar Plantas', en: 'Day 11: Defrost Greenhouse' },
      desc: { es: 'Ve a Sala Derecha [D] y derrite los 5 bloques de hielo pasando el cursor.', en: 'Walk to Right Bay [D] and melt the 5 ice blocks by wiping over them.' }
    },
    { room: -1, roomName: { es: 'SALA IZQUIERDA (ESCLUSA)', en: 'LEFT BAY (AIRLOCK)' }, station: { es: 'TRAJE ESPACIAL xEMU', en: 'xEMU SPACESUIT' }, type: 'hold',
      title: { es: 'Día 12: Probar Presión del Traje', en: 'Day 12: Test Suit Pressure' },
      desc: { es: 'Ve a Sala Izquierda [A] y mantén pulsado 2.5 segundos.', en: 'Walk to Left Bay [A] and hold button for 2.5 seconds.' },
      holdTime: 2.5, btnLabel: { es: '👨‍🚀 Mantener Prueba Traje', en: '👨‍🚀 Hold Suit Test' }
    },
    { room: 0, roomName: { es: 'PUENTE CENTRAL', en: 'CENTRAL BRIDGE' }, station: { es: 'MAPA 3D SHACKLETON', en: 'SHACKLETON 3D MAP' }, type: 'sequence',
      title: { es: 'Día 13: Trazar Ruta Segura', en: 'Day 13: Plot Safe Route' },
      desc: { es: 'Valida los 3 tramos sin pendientes peligrosas: 1 → 2 → 3.', en: 'Validate all 3 safe slope segments: 1 → 2 → 3.' },
      labels: { es: ['1. Borde Norte', '2. Cresta Solar', '3. Bajada Cráter'], en: ['1. North Rim', '2. Solar Ridge', '3. Crater Descent'] }
    },
    { room: -1, roomName: { es: 'SALA IZQUIERDA (ESCLUSA)', en: 'LEFT BAY (AIRLOCK)' }, station: { es: 'VISOR SOLAR DORADO', en: 'GOLD SOLAR VISOR' }, type: 'scrub',
      title: { es: 'Día 14: Aplicar Filtro Solar Oro', en: 'Day 14: Apply Gold Solar Coat' },
      desc: { es: 'En Sala Izquierda [A], aplica la capa protectora pasando el cursor.', en: 'In Left Bay [A], apply the protective solar coat by dragging across.' }
    }
  ];

  function updateLvl3Texts() {
    const es = window.currentLang === 'es';
    document.getElementById('objTitle').textContent = es ? '◈ ETAPA 4 · BASE LUNAR (14 DÍAS)' : '◈ STAGE 4 · LUNAR BASE (14 DAYS)';
    document.getElementById('objectiveText').textContent = es
      ? 'Camina entre salas con [A / D] y resuelve cada reto científico para sobrevivir la noche lunar.'
      : 'Walk between bays with [A / D] and solve each science challenge to survive the lunar night.';
  }

  function initLevel3() {
    updateLvl3Texts();
    lvl3 = {
      day: 1, walkX: 0, walkDir: 0, headBob: 0, solved: false,
      co2: 1200, psi: 14.5, temp: 21.0, energy: 95,
      s1Val: 18, s2Val: 30, antAngle: -25, seqStep: 0, pumps: 0, holdTimer: 0, holdActive: false,
      scrubSpots: [], hotspotRect: null
    };
    setupDay3(1);
  }

  function getCurrentRoom3() { return lvl3.walkX < -45 ? -1 : (lvl3.walkX > 45 ? 1 : 0); }

  window.setupDay3 = function (d) {
    const lang = window.currentLang;
    lvl3.day = d; lvl3.solved = false; lvl3.seqStep = 0; lvl3.pumps = 0; lvl3.holdTimer = 0; lvl3.holdActive = false;
    lvl3.co2 = (d === 3 || d === 7 || d === 10) ? 2350 : 1250;
    lvl3.psi = (d === 4 || d === 12) ? 13.3 : 14.4;
    lvl3.temp = (d === 5 || d === 11 || d === 14) ? 26.8 : 20.5;
    lvl3.energy = (d === 2 || d === 6 || d === 9) ? 66 : 86;
    lvl3.antAngle = -35;

    const info = day3Catalog[d];
    if (info.type === 'dualSlider') {
      lvl3.s1Val = d === 1 ? 18 : info.s1.min + Math.round((info.s1.max - info.s1.min) * 0.2);
      lvl3.s2Val = d === 1 ? 30 : info.s2.min + Math.round((info.s2.max - info.s2.min) * 0.2);
    }
    if (info.type === 'scrub') {
      const count = d === 6 ? 7 : 5;
      lvl3.scrubSpots = Array.from({ length: count }, (_, idx) => ({
        ox: -90 + (idx % 4) * 58 + (idx > 3 ? 25 : 0),
        oy: -35 + Math.floor(idx / 4) * 55,
        r: d === 6 ? 18 : 16, done: false
      }));
    }
    capcom.say(lang === 'es' ? `DÍA ${d}/14: ${info.title.es} → Ve a ${info.roomName.es}.` : `DAY ${d}/14: ${info.title.en} → Go to ${info.roomName.en}.`, true);
    renderLvl3Console();
  };

  window.checkDualSlider3 = function () {
    const info = day3Catalog[lvl3.day];
    if (Math.abs(lvl3.s1Val - info.s1.target) <= 2 && Math.abs(lvl3.s2Val - info.s2.target) <= 3) completeDay3();
  };

  window.moveAntenna3 = function (delta) {
    if (lvl3.solved) return;
    const info = day3Catalog[lvl3.day];
    lvl3.antAngle = Math.max(-60, Math.min(60, lvl3.antAngle + delta));
    const sig = Math.max(0, Math.round(100 - Math.abs(lvl3.antAngle - info.targetAngle) * 2.5));
    audioSys.beep(440 + sig * 4, 0.06);
    if (sig >= 95) completeDay3();
    else renderLvl3Console();
  };

  window.clickSeq3 = function (idx) {
    if (lvl3.solved) return;
    if (idx === lvl3.seqStep) {
      lvl3.seqStep++; audioSys.beep(580 + idx * 120, 0.1);
      if (lvl3.seqStep >= 3) completeDay3();
      else renderLvl3Console();
    } else {
      lvl3.seqStep = 0; audioSys.alarm();
      capcom.say(window.currentLang === 'es' ? "¡Ups! Sigue el orden 1 → 2 → 3." : "Oops! Follow the order 1 → 2 → 3.", true);
      renderLvl3Console();
    }
  };

  window.pumpAction3 = function () {
    if (lvl3.solved) return;
    const info = day3Catalog[lvl3.day];
    lvl3.pumps++; audioSys.beep(520 + lvl3.pumps * 45, 0.08);
    if (lvl3.pumps >= info.targetPumps) completeDay3();
    else renderLvl3Console();
  };

  window.renderLvl3Console = function () {
    const lang = window.currentLang;
    const es = lang === 'es';
    const info = day3Catalog[lvl3.day];
    const curRoom = getCurrentRoom3();
    const inRightRoom = curRoom === info.room;
    const roomLabels = es
      ? { '-1': 'SALA IZQUIERDA (ESCLUSA)', '0': 'PUENTE CENTRAL', '1': 'SALA DERECHA (LAB/BAHÍA)' }
      : { '-1': 'LEFT BAY (AIRLOCK)', '0': 'CENTRAL BRIDGE', '1': 'RIGHT BAY (LAB/ROVER)' };
    document.getElementById('roomIndicator').textContent = roomLabels[curRoom];

    let actionUI = '';
    if (!inRightRoom) {
      actionUI = `<div class="ctrl-desc" style="color:#fde047;">🚶 ${es ? 'Camina con <b>[A / D]</b> hasta:' : 'Walk with <b>[A / D]</b> to:'} <b>${info.roomName[lang]}</b></div>`;
    } else if (lvl3.solved) {
      actionUI = `<button class="btn-action done">✔ ${info.station[lang]} ${es ? 'Reparado' : 'Fixed'}</button>`;
    } else if (info.type === 'dualSlider') {
      actionUI = `
        <div class="ctrl-desc">${info.s1.label[lang]}: <b>${lvl3.s1Val}${info.s1.unit}</b> (${es ? 'Meta' : 'Target'}: ${info.s1.target}${info.s1.unit})</div>
        <input type="range" min="${info.s1.min}" max="${info.s1.max}" value="${lvl3.s1Val}" oninput="lvl3.s1Val=parseInt(this.value); checkDualSlider3(); renderLvl3Console();">
        <div class="ctrl-desc">${info.s2.label[lang]}: <b>${lvl3.s2Val}${info.s2.unit}</b> (${es ? 'Meta' : 'Target'}: ${info.s2.target}${info.s2.unit})</div>
        <input type="range" min="${info.s2.min}" max="${info.s2.max}" value="${lvl3.s2Val}" oninput="lvl3.s2Val=parseInt(this.value); checkDualSlider3(); renderLvl3Console();">
      `;
    } else if (info.type === 'antenna') {
      const sig = Math.max(0, Math.round(100 - Math.abs(lvl3.antAngle - info.targetAngle) * 2.5));
      actionUI = `
        <div class="ctrl-desc">${es ? 'Señal Tierra:' : 'Earth Signal:'} <b style="color:${sig >= 95 ? '#4ade80' : '#fde047'}">${sig}%</b></div>
        <div class="btn-grid-2">
          <button class="btn-action warn" onclick="moveAntenna3(-7)">◀ ${es ? 'Girar Izq' : 'Turn Left'}</button>
          <button class="btn-action warn" onclick="moveAntenna3(7)">${es ? 'Girar Der' : 'Turn Right'} ▶</button>
        </div>
      `;
    } else if (info.type === 'sequence') {
      actionUI = `<div class="btn-grid-3">` + info.labels[lang].map((lbl, idx) => `
        <button class="btn-action ${lvl3.seqStep > idx ? 'done' : (lvl3.seqStep === idx ? 'warn' : '')}" onclick="clickSeq3(${idx})">${lbl}</button>
      `).join('') + `</div>`;
    } else if (info.type === 'pump') {
      const litros = Math.round(87 + (lvl3.pumps / info.targetPumps) * 113);
      actionUI = `
        <div class="ctrl-desc">${es ? 'Progreso:' : 'Progress:'} <b>${lvl3.day === 3 ? litros + ' / 200 L' : lvl3.pumps + ' / ' + info.targetPumps}</b></div>
        <button class="btn-action warn" onclick="pumpAction3()">${info.btnLabel[lang]}</button>
      `;
    } else if (info.type === 'scrub') {
      const cleanCount = lvl3.scrubSpots.filter(s => s.done).length;
      actionUI = `<div class="ctrl-desc" style="color:#fde047;">🖱️ ${es ? 'Arrastra el dedo o ratón sobre el equipo iluminado:' : 'Drag finger or mouse across the glowing equipment:'} <b>${cleanCount}/${lvl3.scrubSpots.length}</b></div>`;
    } else if (info.type === 'hold') {
      const pct = Math.min(100, Math.round((lvl3.holdTimer / info.holdTime) * 100));
      actionUI = `
        <button class="btn-action warn" onmousedown="lvl3.holdActive=true" onmouseup="lvl3.holdActive=false" onmouseleave="lvl3.holdActive=false" ontouchstart="lvl3.holdActive=true" ontouchend="lvl3.holdActive=false">${info.btnLabel[lang]}</button>
        <div class="task-progress-box">
          <div class="task-progress-label"><span>${es ? 'MANTENER PULSADO' : 'HOLD BUTTON'}</span><span>${pct}%</span></div>
          <div class="task-progress-bar"><div class="task-progress-fill" style="width:${pct}%"></div></div>
        </div>
      `;
    }

    document.getElementById('levelConsole').innerHTML = `
      <div class="ctrl-group ${!lvl3.solved ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${info.title[lang]}</span><span>${es ? 'DÍA' : 'DAY'} ${lvl3.day}/14</span></div>
        <div class="ctrl-desc">${info.desc[lang]}</div>
        ${actionUI}
      </div>
      <div class="ctrl-group">
        <div class="ctrl-title"><span>${es ? 'Estado de la Estación' : 'Station Status'}</span><span>${lvl3.solved ? (es ? 'ESTABLE' : 'NOMINAL') : (es ? 'ALERTA' : 'ALERT')}</span></div>
        <div class="btn-grid-2">
          <button class="btn-action" onclick="loadLevel(3)">↺ ${es ? 'Reiniciar' : 'Restart'}</button>
          ${lvl3.solved && lvl3.day < 14 ? `<button class="btn-action done" onclick="setupDay3(${lvl3.day + 1})">⏭ ${es ? 'Siguiente Día' : 'Next Day'} (${lvl3.day + 1})</button>` : `<button class="btn-action" disabled>${es ? 'Completa el reto' : 'Finish task'}</button>`}
        </div>
      </div>
    `;
  };

  function completeDay3() {
    if (lvl3.solved) return;
    const es = window.currentLang === 'es';
    lvl3.solved = true; lvl3.holdActive = false;
    lvl3.co2 = 460; lvl3.psi = 14.7; lvl3.temp = 21.0; lvl3.energy = Math.min(100, lvl3.energy + 30);
    document.getElementById('alarma').classList.remove('activa');
    audioSys.success();
    renderLvl3Console();
    if (lvl3.day === 14) {
      showModal(
        es ? '☀️ ¡AMANECER LUNAR SUPERADO!' : '☀️ LUNAR SUNRISE REACHED!',
        es ? '¡Sobreviviste los 14 días de noche lunar! Ahora sal en tu Rover al Cráter Shackleton en busca de hielo.' : 'You survived all 14 days of lunar night! Now drive your Rover into Shackleton Crater to search for water ice.',
        [{ label: es ? 'IR AL CRÁTER SHACKLETON (ETAPA 5)' : 'GO TO SHACKLETON CRATER (STAGE 5)', action: () => loadLevel(4) }],
        '☀️'
      );
    }
  }

  /* ============================================================================
     ETAPA 5: CRÁTER SHACKLETON
     ============================================================================ */
  function updateLvl4Texts() {
    const es = window.currentLang === 'es';
    document.getElementById('objTitle').textContent = es ? '◈ ETAPA 5 · CRÁTER SHACKLETON' : '◈ STAGE 5 · SHACKLETON CRATER';
    document.getElementById('objectiveText').textContent = es
      ? '1) Instala las 3 balizas guía. 2) Entra en la zona oscura PSR (Z ≥ 400m), enciende Luz UV y extrae hielo. 3) Llama a la nave HLS.'
      : '1) Plant 3 guide beacons. 2) Enter dark PSR zone (Z ≥ 400m), turn on UV Light & drill ice. 3) Call HLS lander.';
  }

  function initLevel4() {
    updateLvl4Texts();
    lvl4 = {
      x: 0, z: 0, vx: 0, vz: 0, yBounce: 0, vyBounce: 0,
      o2Hours: 6.0, autoPilot: false, touchDir: { x: 0, z: 0 }, uvLights: false,
      beacons: [{ x: -85, z: 140, placed: false }, { x: 90, z: 240, placed: false }, { x: -65, z: 340, placed: false }],
      craters: [{ x: 25, z: 130, r: 28 }, { x: -35, z: 220, r: 30 }, { x: 30, z: 315, r: 30 }, { x: -95, z: 430, r: 30 }],
      beaconsPlaced: 0, iceDrilled: false, hlsLanding: false, hlsAlt: 220, crewArrived: false, crashed: false
    };
    const es = window.currentLang === 'es';
    capcom.say(es ? "Sigue la flecha amarilla para plantar 3 balizas de navegación antes de entrar al cráter oscuro." : "Follow the yellow arrow to plant 3 navigation beacons before entering the dark crater.");
    renderLvl4Console();
  }

  function getNextTargetL4() {
    const es = window.currentLang === 'es';
    for (let i = 0; i < lvl4.beacons.length; i++) {
      if (!lvl4.beacons[i].placed) return { x: lvl4.beacons[i].x, z: lvl4.beacons[i].z, label: `${es ? 'BALIZA' : 'BEACON'} #${i + 1}`, type: 'beacon' };
    }
    if (!lvl4.iceDrilled) return { x: 0, z: 440, label: es ? 'ZONA HIELO PSR (-240 °C)' : 'PSR ICE ZONE (-240 °C)', type: 'psr' };
    return { x: 0, z: 460, label: es ? 'ATERRIZAJE NAVE HLS' : 'HLS LANDER ZONE', type: 'hls' };
  }

  window.renderLvl4Console = function () {
    const es = window.currentLang === 'es';
    const target = getNextTargetL4();
    const dist = Math.round(Math.hypot(target.x - lvl4.x, target.z - lvl4.z));
    const inPSR = lvl4.z >= 400;
    const step1Done = lvl4.beaconsPlaced >= 3;
    const step2Done = lvl4.iceDrilled;

    document.getElementById('levelConsole').innerHTML = `
      <div class="ctrl-group">
        <div class="ctrl-title"><span>🧭 ${es ? 'Brújula Rover' : 'Rover Compass'}</span><span>${dist}m</span></div>
        <div class="ctrl-desc">${es ? 'Siguiente objetivo:' : 'Next target:'} <b>${target.label}</b></div>
        <div class="btn-grid-2">
          <button class="btn-action ${lvl4.autoPilot ? 'done' : 'warn'}" onclick="lvl4.autoPilot=!lvl4.autoPilot; renderLvl4Console();">
            ${lvl4.autoPilot ? (es ? '🤖 Piloto Auto: ON' : '🤖 Auto-Pilot: ON') : (es ? '🤖 Piloto Automático' : '🤖 Auto-Pilot')}
          </button>
          <button class="btn-action" onclick="lvl4.x=0; lvl4.z=Math.max(0, lvl4.z-40); lvl4.vx=0; lvl4.vz=0;">🔄 ${es ? 'Centrar Ruta' : 'Center Route'}</button>
        </div>
      </div>

      <div class="ctrl-group ${!step1Done ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${es ? '1. Colocar 3 Balizas' : '1. Plant 3 Beacons'}</span><span>${lvl4.beaconsPlaced}/3</span></div>
        <button class="btn-action ${step1Done ? 'done' : (dist < 75 ? 'warn' : '')}" onclick="plantL4Beacon()" ${step1Done ? 'disabled' : ''}>
          ${step1Done ? (es ? '✔ 3 Balizas Colocadas' : '✔ 3 Beacons Planted') : (es ? '📍 Plantar Baliza Aquí (<75m)' : '📍 Plant Beacon Here (<75m)')}
        </button>
      </div>

      <div class="ctrl-group ${step1Done && !step2Done ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${es ? '2. Extraer Hielo Antiguo' : '2. Drill Ancient Ice'}</span><span>${inPSR ? (es ? 'EN ZONA PSR' : 'IN PSR ZONE') : 'Z ≥ 400m'}</span></div>
        <div class="btn-grid-2">
          <button class="btn-action ${lvl4.uvLights ? 'done' : ''}" onclick="lvl4.uvLights=!lvl4.uvLights; audioSys.beep(720); renderLvl4Console();">🔦 ${es ? 'Luz UV' : 'UV Light'}: ${lvl4.uvLights ? 'ON' : 'OFF'}</button>
          <button class="btn-action ${step2Done ? 'done' : ''}" onclick="drillL4Ice()" ${step2Done ? 'disabled' : ''}>${step2Done ? (es ? '✔ Hielo Extraído' : '✔ Ice Drilled') : (es ? '⛏️ Perforar Hielo' : '⛏️ Drill Ice')}</button>
        </div>
      </div>

      <div class="ctrl-group ${step2Done ? 'active-step' : ''}">
        <div class="ctrl-title"><span>${es ? '3. Relevo Nave Artemis HLS' : '3. Artemis HLS Crew'}</span><span>${lvl4.crewArrived ? (es ? 'EN TIERRA' : 'LANDED') : (es ? 'ESPERA' : 'STANDBY')}</span></div>
        <div class="btn-grid-2">
          <button class="btn-action ${lvl4.hlsLanding ? 'done' : ''}" onclick="callHLSFromL4()">🛸 ${es ? 'Llamar Nave HLS' : 'Call HLS Lander'}</button>
          <button class="btn-action ${lvl4.crewArrived ? 'warn' : ''}" onclick="finishL4()">🏅 ${es ? 'Completar Misión' : 'Complete Mission'}</button>
        </div>
      </div>
    `;
  };

  window.plantL4Beacon = function () {
    const es = window.currentLang === 'es';
    let ok = false;
    lvl4.beacons.forEach(b => {
      if (!b.placed && Math.hypot(lvl4.x - b.x, lvl4.z - b.z) < 75) { b.placed = true; lvl4.beaconsPlaced++; ok = true; }
    });
    if (ok) {
      audioSys.success();
      capcom.say(lvl4.beaconsPlaced < 3
        ? (es ? `¡Baliza #${lvl4.beaconsPlaced} activada!` : `Beacon #${lvl4.beaconsPlaced} activated!`)
        : (es ? "¡Las 3 balizas listas! Avanza al interior oscuro del cráter (Z ≥ 400m)." : "All 3 beacons active! Drive into the dark crater interior (Z ≥ 400m)."));
      renderLvl4Console();
    } else {
      audioSys.alarm();
      capcom.say(es ? "Acércate un poco más (<75m) a la baliza azul." : "Drive closer (<75m) to the blue beacon.", true);
    }
  };

  window.drillL4Ice = function () {
    const es = window.currentLang === 'es';
    if (lvl4.beaconsPlaced < 3) { audioSys.alarm(); capcom.say(es ? "Coloca primero las 3 balizas guía." : "Plant all 3 guide beacons first.", true); return; }
    if (lvl4.z < 400) { audioSys.alarm(); capcom.say(es ? "Avanza más adentro del cráter oscuro (Z ≥ 400m)." : "Drive deeper into the dark crater (Z ≥ 400m).", true); return; }
    if (!lvl4.uvLights) { audioSys.alarm(); capcom.say(es ? "Enciende primero la 'Luz UV' para detectar el hielo." : "Turn on 'UV Light' first to spot the ice.", true); return; }
    lvl4.iceDrilled = true; lvl4.autoPilot = false; lvl4.vx = 0; lvl4.vz = 0;
    audioSys.success();
    capcom.say(es ? "¡Hielo H₂O extraído! Ahora pulsa 'Llamar Nave HLS'." : "H₂O Ice drilled! Now press 'Call HLS Lander'.");
    renderLvl4Console();
  };

  window.callHLSFromL4 = function () {
    const es = window.currentLang === 'es';
    if (!lvl4.iceDrilled) { audioSys.alarm(); capcom.say(es ? "Extrae primero el hielo del cráter." : "Drill the crater ice first.", true); return; }
    if (lvl4.hlsLanding) return;
    capcom.transmit(
      es ? "Houston, muestras de hielo listas. Solicito aterrizaje HLS." : "Houston, ice samples ready. Requesting HLS landing.",
      es ? "Copiado. Nave Artemis HLS descendiendo frente a ti." : "Copy. Artemis HLS lander descending ahead of you.",
      () => { lvl4.hlsLanding = true; renderLvl4Console(); }
    );
  };

  window.finishL4 = function () {
    const es = window.currentLang === 'es';
    if (!lvl4.hlsLanding) { audioSys.alarm(); capcom.say(es ? "Pulsa primero 'Llamar Nave HLS'." : "Press 'Call HLS Lander' first.", true); return; }
    if (!lvl4.crewArrived) { audioSys.alarm(); capcom.say(es ? "Espera unos segundos a que aterrice la nave." : "Wait a few seconds for the lander to touch down.", true); return; }
    audioSys.success();
    showModal(
      es ? `🏆 ¡FELICITACIONES, COMANDANTE ${commanderName.toUpperCase()}!` : `🏆 CONGRATULATIONS, COMMANDER ${commanderName.toUpperCase()}!`,
      es ? 'Has completado toda la Misión Astræus-Artemis: alunizaste, condujiste bajo gravedad 1/6 G, sobreviviste la noche lunar y hallaste agua en el Polo Sur de la Luna. ¡Ahora explora el Museo 3D de la NASA!' : 'You completed the entire Astræus-Artemis Mission: landed on the Moon, drove in 1/6 G gravity, survived the lunar night, and found water at the Lunar South Pole. Now explore the NASA 3D Museum!',
      [
        { label: es ? '🛰️ EXPLORAR MUSEO 3D NASA' : '🛰️ EXPLORE NASA 3D MUSEUM', action: () => loadLevel(5) },
        { label: es ? '↺ VOLVER A JUGAR' : '↺ PLAY AGAIN', secondary: true, action: () => loadLevel(1) }
      ],
      '🏆'
    );
  };

  // ============ INTERACCIÓN EN CANVAS ============
  function onCanvasClick() {
    if (window.currentLevel === 2) cleanVisorDust();
    if (window.currentLevel === 3) scrubStationSpots3();
  }
  function onCanvasMove() {
    if (window.currentLevel === 2 && mouse.down) cleanVisorDust();
    if (window.currentLevel === 3 && mouse.down) scrubStationSpots3();
  }
  function cleanVisorDust() {
    const es = window.currentLang === 'es';
    lvl2.visorDust.forEach(d => { if (!d.clean && Math.hypot(mouse.x - d.x, mouse.y - d.y) < 48) d.clean = true; });
    if (lvl2.visorDust.every(d => d.clean) && !lvl2.suitportClean) {
      lvl2.suitportClean = true; audioSys.success();
      capcom.say(es ? "¡Traje limpio de polvo lunar! Ahora mantén pulsado Esterilizar UV." : "Suit clean of lunar dust! Now hold UV Sterilize.");
    }
    renderLvl2Console(); checkLevel2Win();
  }
  function scrubStationSpots3() {
    const info = day3Catalog[lvl3.day];
    if (!info || info.type !== 'scrub' || lvl3.solved || getCurrentRoom3() !== info.room || !lvl3.hotspotRect) return;
    const cx = lvl3.hotspotRect.x + lvl3.hotspotRect.w / 2;
    const cy = lvl3.hotspotRect.y + lvl3.hotspotRect.h / 2;
    let changed = false;
    lvl3.scrubSpots.forEach(s => {
      if (!s.done && Math.hypot(mouse.x - (cx + s.ox), mouse.y - (cy + s.oy)) < 36) {
        s.done = true; changed = true; audioSys.beep(740, 0.05);
      }
    });
    if (changed) {
      if (lvl3.scrubSpots.every(s => s.done)) completeDay3();
      else renderLvl3Console();
    }
  }

  // ============ BUCLE DE SIMULACIÓN ============
  function update(dt) {
    if (!window.gameStarted || window.paused || window.currentLevel === 5) return;
    const es = window.currentLang === 'es';

    if (window.currentLevel === 1) {
      lvl1.timer += dt;
      if (lvl1.timer > 5 && !lvl1.meteorPrompted) {
        lvl1.meteorPrompted = true; audioSys.alarm();
        showModal(
          es ? '☄️ ALERTA DE MICROMETEORITOS' : '☄️ MICROMETEOROID ALERT',
          es ? '¡Pequeños fragmentos espaciales se acercan a la nave! ¿Qué maniobra eliges?' : 'Small space debris approaching spacecraft! Choose your maneuver:',
          [
            { label: es ? 'DESVIAR 3° (GASTA 5% COMBUSTIBLE)' : 'EVADE 3° (USES 5% FUEL)', action: () => { lvl1.deltaV -= 140; } },
            { label: es ? 'MANTENER RUMBO (RIESGO DE IMPACTO)' : 'HOLD COURSE (IMPACT RISK)', secondary: true, action: () => { if (Math.random() < 0.15) lvl1.hull -= 25; } }
          ],
          '☄️'
        );
      }
      if (activeKeys['KeyA'] || activeKeys['ArrowLeft']) lvl1.yaw -= 1.4 * dt;
      if (activeKeys['KeyD'] || activeKeys['ArrowRight']) lvl1.yaw += 1.4 * dt;
      const braking = lvl1.thrust || activeKeys['Space'] || activeKeys['ArrowDown'];
      if (braking && lvl1.deltaV > 0) { lvl1.deltaV = Math.max(0, lvl1.deltaV - 340 * dt); lvl1.velocity = Math.max(0, lvl1.velocity - 0.32 * dt); }
      else lvl1.velocity = Math.max(0.05, lvl1.velocity - 0.03 * dt);

      if (Math.random() < 0.04) lvl1.rocks.push({ x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 350, z: 900 });
      lvl1.rocks.forEach((r, i) => {
        r.z -= 480 * dt;
        if (r.z < 40) {
          if (Math.hypot(r.x - lvl1.yaw * 220, r.y) < 95) { lvl1.hull = Math.max(0, lvl1.hull - 12); audioSys.alarm(); }
          lvl1.rocks.splice(i, 1);
        }
      });

      setHUD(
        es ? '◈ Escudo Nave' : '◈ Hull Shield', `${lvl1.hull}%`, lvl1.hull,
        es ? '◈ Combustible' : '◈ Fuel Delta-V', `${Math.round(lvl1.deltaV)} m/s`, (lvl1.deltaV / 2800) * 100,
        es ? '◈ Giro PTC' : '◈ PTC Roll', `${lvl1.ptcRpm.toFixed(1)} RPM`, lvl1.ptcOk ? 100 : 35,
        es ? '◎ Velocidad' : '◎ Velocity', `${lvl1.velocity.toFixed(2)} km/s`, ((1.6 - lvl1.velocity) / 1.6) * 100
      );

      if (lvl1.velocity <= 0.01 && !lvl1.done) {
        if (!lvl1.ptcOk || !lvl1.hatch1 || !lvl1.hatch2 || !lvl1.depressurized) {
          lvl1.velocity = 0.08;
          capcom.say(es ? "¡Completa primero los pasos 1 y 2 antes de aterrizar!" : "Complete steps 1 and 2 before touchdown!", true);
        } else {
          lvl1.done = true; audioSys.success();
          showModal(
            es ? '🚀 ¡ALUNIZAJE EXITOSO!' : '🚀 SUCCESSFUL MOON LANDING!',
            es ? '¡Tocaste la superficie de la Luna con suavidad! Ahora sal de la cápsula y sube al Rover Lunar.' : 'Soft lunar touchdown! Now step outside and board the Lunar Rover.',
            [{ label: es ? 'SALIR A LA SUPERFICIE (ETAPA 2)' : 'STEP ONTO SURFACE (STAGE 2)', action: () => loadLevel(1.5) }],
            '🌙'
          );
        }
      }
    }

    if (window.currentLevel === 1.5) {
      let ax = lvl15.touchDir.x || joyState.x;
      let az = lvl15.touchDir.z || joyState.z;
      if (activeKeys['KeyW'] || activeKeys['ArrowUp']) az = 1;
      if (activeKeys['KeyS'] || activeKeys['ArrowDown']) az = -1;
      if (activeKeys['KeyA'] || activeKeys['ArrowLeft']) ax = -1;
      if (activeKeys['KeyD'] || activeKeys['ArrowRight']) ax = 1;

      const isDriving = lvl15.mode === 'drive';
      const accel = isDriving ? 68 : 34;
      const maxSpd = isDriving ? 54 : 22;

      lvl15.vx += ax * accel * dt; lvl15.vz += az * accel * dt;
      const lunarFriction = Math.pow(0.42, dt);
      lvl15.vx *= lunarFriction; lvl15.vz *= lunarFriction;

      const spd = Math.hypot(lvl15.vx, lvl15.vz);
      if (spd > maxSpd) { lvl15.vx = (lvl15.vx / spd) * maxSpd; lvl15.vz = (lvl15.vz / spd) * maxSpd; }

      lvl15.x = Math.max(-135, Math.min(135, lvl15.x + lvl15.vx * dt));
      lvl15.z = Math.max(5, Math.min(330, lvl15.z + lvl15.vz * dt));
      lvl15.suitO2 = Math.max(0, lvl15.suitO2 - 0.3 * dt);

      if (spd > 3 && lvl15.yBounce <= 0) lvl15.vyBounce = isDriving ? 9.5 : 15.5;
      lvl15.yBounce += lvl15.vyBounce * dt;
      lvl15.vyBounce -= 16.2 * dt;
      if (lvl15.yBounce < 0) { lvl15.yBounce = 0; lvl15.vyBounce = 0; }

      if (isDriving) { lvl15.roverPos.x = lvl15.x; lvl15.roverPos.z = lvl15.z; }

      if (!lvl15.crashed) {
        for (const c of lvl15.craters) {
          if (Math.hypot(lvl15.x - c.x, lvl15.z - c.z) < c.r * 0.72) {
            lvl15.crashed = true; audioSys.alarm();
            showModal(
              es ? '💥 ¡CAÍSTE EN UN CRÁTER!' : '💥 FELL INTO A CRATER!',
              es ? 'Recuerda que en gravedad 1/6 G el Rover se desliza más. ¡Rodea los cráteres oscuros!' : 'Remember: in 1/6 G gravity the Rover slides farther. Steer around dark craters!',
              [{ label: es ? 'INTENTAR DE NUEVO' : 'TRY AGAIN', action: () => loadLevel(1.5) }],
              '⚠️'
            );
            return;
          }
        }
      }

      const distStation = Math.hypot(lvl15.x - lvl15.stationPos.x, lvl15.z - lvl15.stationPos.z);
      if (isDriving && distStation < 34 && !lvl15.arrived) {
        lvl15.arrived = true; audioSys.success();
        showModal(
          es ? '🏛️ ¡LLEGASTE A LA ESTACIÓN ARTEMIS!' : '🏛️ ARRIVED AT ARTEMIS STATION!',
          es ? '¡Excelente conducción lunar! Ahora entra al Airlock para quitar el polvo espacial de tu traje.' : 'Great lunar driving! Now enter the Airlock to clean space dust off your suit.',
          [{ label: es ? 'ENTRAR AL AIRLOCK (ETAPA 3)' : 'ENTER AIRLOCK (STAGE 3)', action: () => loadLevel(2) }],
          '🏛️'
        );
      }

      if (Math.random() < 0.14) renderLvl15Console();
      setHUD(
        es ? '◈ Gravedad Lunar' : '◈ Lunar Gravity', '1.62 m/s²', 100,
        es ? '◈ Transporte' : '◈ Transport', isDriving ? 'ROVER LTV' : (es ? 'CAMINANDO' : 'WALKING'), isDriving ? 100 : 45,
        es ? '◈ Oxígeno Traje' : '◈ Suit Oxygen', `${Math.round(lvl15.suitO2)}%`, lvl15.suitO2,
        es ? '◎ Meta Estación' : '◎ Station Goal', `${Math.round(distStation)}m`, Math.max(0, 100 - (distStation / 300) * 100)
      );
    }

    if (window.currentLevel === 2) {
      if (lvl2.uvHolding && !lvl2.uvDone) {
        lvl2.uvPct = Math.min(100, lvl2.uvPct + 38 * dt);
        if (Math.random() < 0.25) audioSys.beep(880, 0.04);
        if (lvl2.uvPct >= 100) {
          lvl2.uvDone = true; lvl2.uvHolding = false; audioSys.success();
          capcom.say(es ? "¡Desinfección UV lista! Ahora mantén pulsado Presurizar Airlock." : "UV sterilization done! Now hold Pressurize Airlock.");
        }
        renderLvl2Console();
      }
      if (lvl2.presHolding && !lvl2.presDone) {
        lvl2.presPct = Math.min(100, lvl2.presPct + 35 * dt);
        if (Math.random() < 0.25) audioSys.beep(420 + lvl2.presPct * 3, 0.04);
        if (lvl2.presPct >= 100) {
          lvl2.presDone = true; lvl2.presHolding = false; audioSys.success();
          capcom.say(es ? "Presión normalizada. Espera un momento mientras pasa el mareo de gravedad baja..." : "Pressure normal. Wait a moment while low-gravity dizziness fades...");
        }
        renderLvl2Console();
      }
      if (lvl2.presDone && !lvl2.mareoDone) {
        lvl2.mareoTimer += dt;
        const blurVal = Math.max(0, 9 * (1 - lvl2.mareoTimer / 3.2));
        document.getElementById('blurOverlay').style.backdropFilter = `blur(${blurVal.toFixed(1)}px)`;
        document.getElementById('blurOverlay').style.background = `rgba(56, 189, 248, ${(blurVal * 0.015).toFixed(2)})`;
        if (lvl2.mareoTimer >= 3.2) {
          lvl2.mareoDone = true;
          document.getElementById('blurOverlay').style.backdropFilter = 'blur(0px)';
          document.getElementById('blurOverlay').style.background = 'rgba(56, 189, 248, 0)';
          audioSys.beep(660, 0.1);
          capcom.say(es ? "¡Mareo superado! Mueve los 3 controles médicos hasta la zona verde." : "Dizziness cleared! Slide all 3 medical gauges into the green zone.");
        }
        renderLvl2Console();
      }
      if (lvl2.mareoDone && !lvl2.medDone) {
        const okSpo2 = lvl2.spo2 >= 95 && lvl2.spo2 <= 99;
        const okPulso = lvl2.pulso >= 65 && lvl2.pulso <= 85;
        const okTens = lvl2.tension >= 110 && lvl2.tension <= 125;
        if (okSpo2 && okPulso && okTens) {
          lvl2.establePct = Math.min(100, lvl2.establePct + 45 * dt);
          if (lvl2.establePct >= 100) {
            lvl2.medDone = true; audioSys.success();
            capcom.say(es ? "¡Salud perfecta! Hidrátate, enciende el reactor Kilopower y llama a Houston." : "Vitals optimal! Hydrate, power up Kilopower, and call Houston.");
          }
          renderLvl2Console();
        } else if (lvl2.establePct > 0) {
          lvl2.establePct = Math.max(0, lvl2.establePct - 12 * dt);
          renderLvl2Console();
        }
      }

      const cleanPct = Math.round((lvl2.visorDust.filter(d => d.clean).length / lvl2.visorDust.length) * 100);
      setHUD(
        es ? '◈ Luz UV' : '◈ UV Light', `${Math.round(lvl2.uvPct)}%`, lvl2.uvPct,
        es ? '◈ Presión Aire' : '◈ Air Pressure', `${(lvl2.presPct * 0.147).toFixed(1)} PSI`, lvl2.presPct,
        es ? '◈ Chequeo Salud' : '◈ Health Check', lvl2.medDone ? (es ? 'ÓPTIMO' : 'OPTIMAL') : `${Math.round(lvl2.establePct)}%`, lvl2.medDone ? 100 : lvl2.establePct,
        es ? '◎ Traje Limpio' : '◎ Clean Suit', `${cleanPct}%`, cleanPct
      );
    }

    if (window.currentLevel === 3) {
      let dir = lvl3.walkDir;
      if (activeKeys['KeyA'] || activeKeys['ArrowLeft']) dir = -1;
      if (activeKeys['KeyD'] || activeKeys['ArrowRight']) dir = 1;

      if (dir !== 0) {
        const prevRoom = getCurrentRoom3();
        lvl3.walkX = Math.max(-130, Math.min(130, lvl3.walkX + dir * 105 * dt));
        lvl3.headBob += dt * 11;
        if (getCurrentRoom3() !== prevRoom) renderLvl3Console();
      } else {
        lvl3.headBob += dt * 1.8;
      }

      const info = day3Catalog[lvl3.day];
      if (info && info.type === 'hold' && lvl3.holdActive && !lvl3.solved && getCurrentRoom3() === info.room) {
        lvl3.holdTimer += dt; renderLvl3Console();
        if (lvl3.holdTimer >= info.holdTime) completeDay3();
      }

      if (!lvl3.solved) {
        document.getElementById('alarma').classList.add('activa');
        const diffMult = 1.2 * (1 + lvl3.day * 0.04);
        lvl3.co2 += 150 * diffMult * dt;
        lvl3.psi = Math.max(0, lvl3.psi - 0.11 * diffMult * dt);
        lvl3.energy = Math.max(0, lvl3.energy - 3.0 * diffMult * dt);
        if (lvl3.day === 5 || lvl3.day === 11 || lvl3.day === 14) lvl3.temp += 0.7 * diffMult * dt;

        if (lvl3.co2 >= 5000 || lvl3.psi <= 11.5 || lvl3.energy <= 0 || lvl3.temp >= 38) {
          audioSys.alarm();
          document.getElementById('alarma').classList.remove('activa');
          showModal(
            es ? '⚠️ ALERTA DE SOPORTE VITAL' : '⚠️ LIFE SUPPORT ALERT',
            es ? `La estación se quedó sin energía o aire limpio en el Día ${lvl3.day}/14.` : `The station ran out of power or clean air on Day ${lvl3.day}/14.`,
            [{ label: es ? 'REINTENTAR ETAPA 4' : 'RETRY STAGE 4', action: () => loadLevel(3) }],
            '⚠️'
          );
        }
      } else {
        document.getElementById('alarma').classList.remove('activa');
      }

      const integrity = Math.max(0, Math.min(100, Math.round(Math.min(100 - (lvl3.co2 / 50), ((lvl3.psi - 11.5) / 3.2) * 100, lvl3.energy))));
      setHUD(
        es ? '◈ Estado Base' : '◈ Base Status', `${integrity}%`, integrity,
        es ? '◈ Nivel CO₂' : '◈ CO₂ Level', `${Math.round(lvl3.co2)} ppm`, Math.max(0, 100 - (lvl3.co2 / 50)),
        es ? '◈ Presión / Energ.' : '◈ Pressure / Power', `${lvl3.psi.toFixed(1)} PSI`, lvl3.energy,
        es ? '◎ Noche Lunar' : '◎ Lunar Night', `${es ? 'Día' : 'Day'} ${lvl3.day}/14`, (lvl3.day / 14) * 100
      );
    }

    if (window.currentLevel === 4) {
      const target = getNextTargetL4();
      const distToTarget = Math.hypot(target.x - lvl4.x, target.z - lvl4.z);
      let ax = lvl4.touchDir.x || joyState.x;
      let az = lvl4.touchDir.z || joyState.z;
      if (activeKeys['KeyW'] || activeKeys['ArrowUp']) az = 1;
      if (activeKeys['KeyS'] || activeKeys['ArrowDown']) az = -1;
      if (activeKeys['KeyA'] || activeKeys['ArrowLeft']) ax = -1;
      if (activeKeys['KeyD'] || activeKeys['ArrowRight']) ax = 1;

      if (ax !== 0 || az !== 0) lvl4.autoPilot = false;

      if (lvl4.autoPilot && !lvl4.iceDrilled) {
        let desiredAngle = Math.atan2(target.x - lvl4.x, target.z - lvl4.z);
        for (const c of lvl4.craters) {
          const dc = Math.hypot(c.x - lvl4.x, c.z - lvl4.z);
          if (dc < c.r + 45 && c.z > lvl4.z - 10) desiredAngle += (lvl4.x >= c.x ? 0.65 : -0.65);
        }
        if (distToTarget > 38) {
          lvl4.vx += (Math.sin(desiredAngle) * 48 - lvl4.vx) * 2.5 * dt;
          lvl4.vz += (Math.cos(desiredAngle) * 48 - lvl4.vz) * 2.5 * dt;
        } else {
          lvl4.autoPilot = false; renderLvl4Console();
        }
      } else {
        lvl4.vx += ax * 72 * dt; lvl4.vz += az * 72 * dt;
      }

      const lunarFriction = Math.pow(0.42, dt);
      lvl4.vx *= lunarFriction; lvl4.vz *= lunarFriction;
      const spd = Math.hypot(lvl4.vx, lvl4.vz);
      if (spd > 62) { lvl4.vx = (lvl4.vx / spd) * 62; lvl4.vz = (lvl4.vz / spd) * 62; }

      lvl4.x = Math.max(-220, Math.min(220, lvl4.x + lvl4.vx * dt));
      lvl4.z = Math.max(-20, Math.min(500, lvl4.z + lvl4.vz * dt));
      lvl4.o2Hours = Math.max(0, lvl4.o2Hours - 0.01 * dt);

      if (spd > 4 && lvl4.yBounce <= 0) lvl4.vyBounce = 10.5;
      lvl4.yBounce += lvl4.vyBounce * dt; lvl4.vyBounce -= 16.2 * dt;
      if (lvl4.yBounce < 0) { lvl4.yBounce = 0; lvl4.vyBounce = 0; }

      if (Math.random() < 0.15) renderLvl4Console();

      if (!lvl4.crashed) {
        for (const c of lvl4.craters) {
          if (Math.hypot(lvl4.x - c.x, lvl4.z - c.z) < c.r * 0.72) {
            lvl4.crashed = true; audioSys.alarm();
            showModal(
              es ? '💥 ¡CAÍSTE EN UN CRÁTER!' : '💥 FELL INTO A CRATER!',
              es ? 'Usa el Joystick, WASD o el Piloto Automático para rodear los cráteres.' : 'Use the Joystick, WASD, or Auto-Pilot to steer around craters.',
              [{ label: es ? 'REINTENTAR ETAPA 5' : 'RETRY STAGE 5', action: () => loadLevel(4) }],
              '⚠️'
            );
            return;
          }
        }
      }

      if (lvl4.hlsLanding) {
        lvl4.hlsAlt = Math.max(0, lvl4.hlsAlt - 60 * dt);
        if (lvl4.hlsAlt <= 2 && !lvl4.crewArrived) {
          lvl4.crewArrived = true; audioSys.success();
          capcom.say(es ? "¡La nave Artemis HLS aterrizó! Pulsa 'Completar Misión'." : "Artemis HLS lander touched down! Press 'Complete Mission'.");
          renderLvl4Console();
        }
      }

      const inPSR = lvl4.z >= 400;
      setHUD(
        es ? '◈ Reserva O₂' : '◈ O₂ Reserve', `${lvl4.o2Hours.toFixed(2)}h`, (lvl4.o2Hours / 6) * 100,
        es ? '◈ Temperatura' : '◈ Temperature', inPSR ? '-240 °C (PSR)' : (es ? '-50 °C (SOL)' : '-50 °C (SUN)'), inPSR ? 100 : 45,
        es ? '◈ Distancia' : '◈ Distance', `${Math.min(100, Math.round((lvl4.z / 420) * 100))}%`, Math.min(100, (lvl4.z / 420) * 100),
        es ? '◎ Balizas Guía' : '◎ Guide Beacons', `${lvl4.beaconsPlaced}/3`, (lvl4.beaconsPlaced / 3) * 100
      );
    }
  }

  function setHUD(l1, v1, b1, l2, v2, b2, l3, v3, b3, l4, v4, b4) {
    document.getElementById('hudLabel1').textContent = l1; document.getElementById('hudVal1').textContent = v1; document.getElementById('hudBar1').style.width = `${Math.max(0, Math.min(100, b1))}%`;
    document.getElementById('hudLabel2').textContent = l2; document.getElementById('hudVal2').textContent = v2; document.getElementById('hudBar2').style.width = `${Math.max(0, Math.min(100, b2))}%`;
    document.getElementById('hudLabel3').textContent = l3; document.getElementById('hudVal3').textContent = v3; document.getElementById('hudBar3').style.width = `${Math.max(0, Math.min(100, b3))}%`;
    document.getElementById('hudLabel4').textContent = l4; document.getElementById('hudVal4').textContent = v4; document.getElementById('hudBar4').style.width = `${Math.max(0, Math.min(100, b4))}%`;
  }

  // ============ RENDERIZADO VISUAL ============
  function drawRealisticEarth(x, y, r) {
    ctx.save();
    const glow = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.9);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, r * 1.9, 0, Math.PI * 2); ctx.fill();

    const earthGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
    earthGrad.addColorStop(0, '#38bdf8');
    earthGrad.addColorStop(0.6, '#0284c7');
    earthGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = earthGrad;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(74, 222, 128, 0.55)';
    ctx.beginPath(); ctx.ellipse(x - r * 0.25, y - r * 0.15, r * 0.35, r * 0.22, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath(); ctx.ellipse(x + r * 0.2, y - r * 0.35, r * 0.42, r * 0.12, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function render() {
    if (!window.gameStarted || window.currentLevel === 5) return;
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#02040a'; ctx.fillRect(0, 0, w, h);

    if (window.currentLevel === 1) renderFPV_Level1(w, h);
    if (window.currentLevel === 1.5) renderFPV_Level15(w, h);
    if (window.currentLevel === 2) renderFPV_Level2(w, h);
    if (window.currentLevel === 3) renderFPV_Level3_Station(w, h);
    if (window.currentLevel === 4) renderFPV_Level4(w, h);
  }

  function renderFPV_Level1(w, h) {
    const cx = w / 2 - lvl1.yaw * 180, cy = h / 2;
    stars3D.forEach(s => {
      s.z -= (100 + lvl1.velocity * 250) * 0.016;
      if (s.z <= 10) s.z = 1000;
      const sx = cx + (s.x / s.z) * 400, sy = cy + (s.y / s.z) * 400;
      ctx.fillStyle = '#fff'; ctx.fillRect(sx, sy, 2.2, 2.2);
    });

    const moonProgress = Math.max(0, (1.6 - lvl1.velocity) / 1.6);
    const moonR = 90 + moonProgress * 320;
    const moonY = h * 0.52 + (1 - moonProgress) * 140;
    const moonGrad = ctx.createRadialGradient(cx, moonY - moonR * 0.3, 20, cx, moonY, moonR);
    moonGrad.addColorStop(0, '#94a3b8'); moonGrad.addColorStop(0.7, '#475569'); moonGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = moonGrad; ctx.beginPath(); ctx.arc(cx, moonY, moonR, 0, Math.PI * 2); ctx.fill();

    lvl1.rocks.forEach(r => {
      const scale = 350 / Math.max(20, r.z);
      ctx.beginPath(); ctx.arc(cx + r.x * scale, cy + r.y * scale, 18 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#cbd5e1'; ctx.fill();
    });

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 36;
    ctx.beginPath(); ctx.moveTo(0, h * 0.72); ctx.lineTo(w * 0.28, h * 0.62); ctx.lineTo(w * 0.72, h * 0.62); ctx.lineTo(w, h * 0.72); ctx.stroke();

    ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(performance.now() * 0.001 * lvl1.ptcRpm);
    ctx.strokeStyle = lvl1.ptcOk ? '#4ade80' : '#fde047'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(-40, 0); ctx.moveTo(40, 0); ctx.lineTo(110, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function renderFPV_Level15(w, h) {
    const es = window.currentLang === 'es';
    const bounceOffset = lvl15.yBounce * 2.2;
    const horizonY = h * 0.44 + bounceOffset;
    const centerX = w * 0.42;

    ctx.fillStyle = '#02040a'; ctx.fillRect(0, 0, w, horizonY);
    drawRealisticEarth(w * 0.28 - lvl15.x * 0.2, h * 0.16 + bounceOffset * 0.4, 28);

    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    groundGrad.addColorStop(0, '#475569'); groundGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = groundGrad; ctx.fillRect(0, horizonY, w, h - horizonY);

    const gridOffset = (lvl15.z % 45);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.5;
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath(); ctx.moveTo(centerX + i * 42 - lvl15.x * 0.5, horizonY); ctx.lineTo(centerX + i * 260 - lvl15.x * 1.4, h); ctx.stroke();
    }
    for (let row = 1; row <= 5; row++) {
      const ry = horizonY + Math.pow(row / 5, 1.65) * (h - horizonY - 68) + (gridOffset * 0.4);
      if (ry < h - 68) { ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(w, ry); ctx.stroke(); }
    }

    lvl15.craters.forEach(c => {
      const dx = c.x - lvl15.x, dz = c.z - lvl15.z;
      if (dz > 8) {
        const scale = Math.min(2.4, 280 / dz);
        const sx = centerX + dx * scale * 1.6, sy = horizonY + 135 * scale;
        const radX = c.r * scale * 1.3, radY = c.r * scale * 0.44;
        ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.ellipse(sx, sy, radX, radY, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fca5a5'; ctx.font = '800 10px Orbitron'; ctx.textAlign = 'center';
        ctx.fillText(es ? '⚠ CRÁTER' : '⚠ CRATER', sx, sy - radY - 4); ctx.textAlign = 'left';
      }
    });

    const dzSt = lvl15.stationPos.z - lvl15.z;
    if (dzSt > 8) {
      const scale = Math.min(2.8, 300 / dzSt);
      const sx = centerX + (lvl15.stationPos.x - lvl15.x) * scale * 1.5, sy = horizonY + 80 * scale;
      ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.roundRect(sx - 85 * scale, sy - 48 * scale, 170 * scale, 48 * scale, 10 * scale); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(sx - 135 * scale, sy - 38 * scale, 45 * scale, 22 * scale);
      ctx.fillRect(sx + 90 * scale, sy - 38 * scale, 45 * scale, 22 * scale);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(sx - 18 * scale, sy - 34 * scale, 36 * scale, 34 * scale);
      ctx.fillStyle = '#4ade80'; ctx.font = '800 11px Orbitron'; ctx.textAlign = 'center';
      ctx.fillText(`${es ? 'ESTACIÓN ARTEMIS' : 'ARTEMIS STATION'} (${Math.round(dzSt)}m)`, sx, sy - 58 * scale); ctx.textAlign = 'left';
    }

    if (lvl15.mode === 'walk') {
      const dx = lvl15.roverPos.x - lvl15.x, dz = lvl15.roverPos.z - lvl15.z;
      if (dz > 5) {
        const scale = Math.min(2.6, 260 / dz);
        const rx = centerX + dx * scale * 1.6, ry = horizonY + 130 * scale;
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(rx - 42 * scale, ry - 26 * scale, 84 * scale, 18 * scale);
        ctx.fillStyle = '#fde047'; ctx.fillRect(rx - 28 * scale, ry - 40 * scale, 32 * scale, 14 * scale);
        ctx.fillStyle = '#1e293b';
        ctx.beginPath(); ctx.arc(rx - 28 * scale, ry - 6 * scale, 11 * scale, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx + 28 * scale, ry - 6 * scale, 11 * scale, 0, Math.PI * 2); ctx.fill();

        const near = Math.hypot(dx, dz) <= 28;
        ctx.fillStyle = near ? '#4ade80' : '#fde047'; ctx.font = '800 11px Orbitron'; ctx.textAlign = 'center';
        ctx.fillText(near ? (es ? '¡ROVER LISTO! PULSA SUBIR AL ROVER' : 'ROVER READY! PRESS BOARD ROVER') : `ROVER LTV (${Math.round(Math.hypot(dx, dz))}m)`, rx, ry - 48 * scale);
        ctx.textAlign = 'left';
      }
    } else {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(w * 0.22, h - 72, w * 0.45, 72);
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.strokeRect(w * 0.22, h - 72, w * 0.45, 72);
      ctx.fillStyle = '#38bdf8'; ctx.font = '800 10.5px Orbitron';
      ctx.fillText(es ? `ROVER LUNAR LTV · GRAVEDAD 1/6 G` : `LUNAR ROVER LTV · 1/6 G GRAVITY`, w * 0.24, h - 48);
      ctx.fillStyle = '#fde047'; ctx.font = '700 12px Exo 2';
      ctx.fillText(es ? `Conduce hacia la entrada verde de la estación.` : `Drive toward the green station airlock gate.`, w * 0.24, h - 26);
    }
  }

  function renderFPV_Level2(w, h) {
    const es = window.currentLang === 'es';
    const isMobile = w <= 768;
    const px = (mouse.x - w * 0.5) * 0.025, py = (mouse.y - h * 0.5) * 0.02;
    ctx.fillStyle = '#091122'; ctx.fillRect(0, 0, w, h);

    const cx = w * (isMobile ? 0.26 : 0.42) - px, cy = h * 0.56 - py;

    ctx.fillStyle = '#111c33'; ctx.strokeStyle = lvl2.suitportClean ? '#4ade80' : '#fde047'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(cx - 150, cy - 195, 300, 385, 24); ctx.fill(); ctx.stroke();

    if (lvl2.uvHolding || (lvl2.uvDone && !lvl2.presDone)) {
      const uvGlow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 210);
      uvGlow.addColorStop(0, 'rgba(192, 132, 252, 0.5)');
      uvGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = uvGlow; ctx.fillRect(cx - 160, cy - 205, 320, 405);
    }

    ctx.strokeStyle = '#334155'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.roundRect(cx - 134, cy - 180, 268, 355, 18); ctx.stroke();

    ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.roundRect(cx - 64, cy - 68, 128, 130, 14); ctx.fill();
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath(); ctx.roundRect(cx - 46, cy + 48, 38, 86, 10); ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx + 8, cy + 48, 38, 86, 10); ctx.fill();
    ctx.fillStyle = '#ef4444'; ctx.fillRect(cx - 46, cy + 78, 38, 6); ctx.fillRect(cx + 8, cy + 78, 38, 6);
    ctx.fillStyle = '#334155';
    ctx.beginPath(); ctx.roundRect(cx - 50, cy + 124, 44, 22, 6); ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx + 6, cy + 124, 44, 22, 6); ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.roundRect(cx - 86, cy - 42, 32, 92, 12); ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx + 54, cy - 42, 32, 92, 12); ctx.fill();
    ctx.fillStyle = '#0284c7'; ctx.fillRect(cx - 86, cy - 10, 32, 6); ctx.fillRect(cx + 54, cy - 10, 32, 6);

    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(cx - 56, cy - 55, 112, 110, 18); ctx.fill();
    ctx.fillStyle = '#1d4ed8'; ctx.fillRect(cx - 44, cy - 38, 22, 13);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(cx - 34, cy - 38, 12, 13);

    ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.roundRect(cx - 32, cy - 22, 64, 46, 7); ctx.fill();
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#4ade80'; ctx.fillRect(cx - 22, cy - 13, 28, 10);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(cx - 22, cy + 4, 42, 8);

    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(cx, cy - 104, 46, 0, Math.PI * 2); ctx.fill();
    const visorGrad = ctx.createLinearGradient(cx - 30, cy - 130, cx + 30, cy - 80);
    visorGrad.addColorStop(0, '#fef08a'); visorGrad.addColorStop(0.45, '#f59e0b'); visorGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = visorGrad; ctx.beginPath(); ctx.ellipse(cx, cy - 104, 34, 28, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = lvl2.suitportClean ? '#4ade80' : '#38bdf8';
    ctx.font = '800 12px Orbitron'; ctx.textAlign = 'center';
    ctx.fillText(es ? 'AIRLOCK SUITPORT · TRAJE NASA xEMU' : 'SUITPORT AIRLOCK · NASA xEMU SUIT', cx, cy - 208);

    lvl2.visorDust.forEach(d => {
      if (!d.clean) {
        const dx = d.x - px, dy = d.y - py;
        ctx.fillStyle = 'rgba(100, 116, 139, 0.9)'; ctx.beginPath(); ctx.arc(dx, dy, d.r, 0, Math.PI * 2); ctx.fill();
      }
    });

    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 22; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(w * 0.72, h); ctx.lineTo(mouse.x + 18, mouse.y + 18); ctx.stroke();
    ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'left';
  }

  function renderFPV_Level3_Station(w, h) {
    const lang = window.currentLang;
    const es = lang === 'es';
    const pan = -(lvl3.walkX / 100) * (w * 0.65);
    const bob = Math.sin(lvl3.headBob) * 5;
    const info = day3Catalog[lvl3.day];
    const alertPulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.008);

    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h * 0.35);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, h * 0.25, w, h * 0.55);
    ctx.fillStyle = '#0b1120'; ctx.fillRect(0, h * 0.76, w, h * 0.24);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)'; ctx.lineWidth = 1.5;
    for (let i = -8; i <= 8; i++) {
      const xBase = w * 0.5 + pan + i * 240;
      ctx.beginPath(); ctx.moveTo(xBase, h * 0.25 + bob); ctx.lineTo(xBase + i * 60, h * 0.76 + bob); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xBase, h * 0.76 + bob); ctx.lineTo(xBase + i * 160, h); ctx.stroke();
    }

    ctx.fillStyle = lvl3.solved ? '#38bdf8' : `rgba(239, 68, 68, ${0.45 + alertPulse * 0.55})`;
    ctx.fillRect(0, h * 0.23 + bob, w, 5);

    const modY = h * 0.34 + bob;
    const leftX = w * 0.45 + pan - w * 0.65;
    ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(leftX - 130, modY + 120, 85, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#cbd5e1'; ctx.font = '800 10px Orbitron';
    ctx.fillText(es ? 'SALA IZQ · ESCLUSA & AGUA' : 'LEFT BAY · AIRLOCK & WATER', leftX - 195, modY + 22);

    ctx.fillStyle = '#162033'; ctx.fillRect(leftX - 15, modY + 15, 145, 210);
    ctx.fillStyle = '#38bdf8'; ctx.fillText(es ? 'RECICLAJE H₂O / LiOH' : 'H₂O / LiOH RECYCLING', leftX - 5, modY + 35);

    const centerX = w * 0.45 + pan;
    ctx.fillStyle = '#02040a'; ctx.fillRect(centerX - 170, modY + 5, 340, 135);
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 8; ctx.strokeRect(centerX - 170, modY + 5, 340, 135);
    drawRealisticEarth(centerX - 95, modY + 52, 20);
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Orbitron';
    ctx.fillText(es ? 'PUENTE CENTRAL · VISTA TIERRA' : 'CENTRAL BRIDGE · EARTH VIEW', centerX - 155, modY + 23);

    ctx.fillStyle = '#0f172a'; ctx.fillRect(centerX - 185, modY + 152, 370, 95);
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.strokeRect(centerX - 185, modY + 152, 370, 95);
    ctx.fillStyle = '#4ade80'; ctx.font = '10px Consolas';
    ctx.fillText(es ? 'KILOPOWER 10kW | ANTENA TIERRA | MAPA 3D' : 'KILOPOWER 10kW | EARTH DISH | 3D MAP', centerX - 164, modY + 185);

    const rightX = w * 0.45 + pan + w * 0.65;
    ctx.fillStyle = '#162033'; ctx.fillRect(rightX - 185, modY + 15, 155, 210);
    ctx.fillStyle = '#38bdf8'; ctx.font = '800 10px Orbitron'; ctx.fillText(es ? 'LAB & INVERNADERO' : 'LAB & GREENHOUSE', rightX - 175, modY + 35);

    ctx.fillStyle = '#0f172a'; ctx.fillRect(rightX - 15, modY + 15, 230, 210);
    ctx.fillStyle = '#c4b5fd'; ctx.fillText(es ? 'BAHÍA ROVER LTV' : 'LTV ROVER BAY', rightX - 4, modY + 35);

    const targetBaseX = info.room === -1 ? leftX : (info.room === 0 ? centerX : rightX + 35);
    const hx = targetBaseX - 145, hy = modY + 35, hw = 290, hh = 175;
    lvl3.hotspotRect = { x: hx, y: hy, w: hw, h: hh };

    ctx.strokeStyle = lvl3.solved ? '#4ade80' : `rgba(253, 224, 71, ${0.5 + alertPulse * 0.5})`;
    ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.strokeRect(hx, hy, hw, hh); ctx.setLineDash([]);

    if (info.type === 'scrub' && !lvl3.solved) {
      const scx = hx + hw / 2, scy = hy + hh / 2;
      lvl3.scrubSpots.forEach(s => {
        if (!s.done) {
          ctx.fillStyle = lvl3.day === 11 ? 'rgba(186, 230, 253, 0.85)' : (lvl3.day === 14 ? 'rgba(245, 158, 11, 0.75)' : 'rgba(100, 116, 139, 0.92)');
          ctx.beginPath(); ctx.arc(scx + s.ox, scy + s.oy, s.r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.5; ctx.stroke();
        }
      });
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 26, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.fillStyle = 'rgba(6, 12, 26, 0.9)'; ctx.fillRect(hx + 10, hy + hh - 34, hw - 20, 26);
    ctx.fillStyle = lvl3.solved ? '#4ade80' : '#fde047'; ctx.font = '800 10.5px Orbitron';
    ctx.fillText(lvl3.solved ? `✔ ${info.station[lang]}: OK` : `⚠ ${info.station[lang]}`, hx + 18, hy + hh - 17);

    const barW = 280, barX = w * 0.42 - barW / 2, barY = 72;
    ctx.fillStyle = 'rgba(8, 18, 38, 0.88)'; ctx.fillRect(barX, barY, barW, 24);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'; ctx.strokeRect(barX, barY, barW, 24);
    const playerDotX = barX + barW / 2 + (lvl3.walkX / 130) * (barW / 2 - 14);
    const targetDotX = barX + barW / 2 + (info.room * 100 / 130) * (barW / 2 - 14);
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(targetDotX, barY + 12, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(playerDotX, barY + 12, 5, 0, Math.PI * 2); ctx.fill();
  }

  function renderFPV_Level4(w, h) {
    const es = window.currentLang === 'es';
    const bounceOffset = lvl4.yBounce * 2.0;
    const horizonY = h * 0.46 + bounceOffset;
    const inPSR = lvl4.z >= 400;
    const target = getNextTargetL4();

    ctx.fillStyle = '#02040a'; ctx.fillRect(0, 0, w, horizonY);
    drawRealisticEarth(w * 0.35 - lvl4.x * 0.25, h * 0.18 + bounceOffset * 0.4, 24);

    ctx.fillStyle = inPSR ? '#05070e' : '#334155';
    ctx.fillRect(0, horizonY, w, h - horizonY);

    const gridOffset = (lvl4.z % 60);
    ctx.strokeStyle = inPSR ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1.5;
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath(); ctx.moveTo(w * 0.42 + i * 45 - lvl4.x * 0.5, horizonY); ctx.lineTo(w * 0.42 + i * 280 - lvl4.x * 1.5, h); ctx.stroke();
    }
    for (let row = 1; row <= 5; row++) {
      const ry = horizonY + Math.pow(row / 5, 1.7) * (h - horizonY - 70) + (gridOffset * 0.35);
      if (ry < h - 70) { ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(w, ry); ctx.stroke(); }
    }

    lvl4.craters.forEach(c => {
      const dx = c.x - lvl4.x, dz = c.z - lvl4.z;
      if (dz > 10) {
        const scale = Math.min(2.4, 310 / dz);
        const sx = w * 0.42 + dx * scale * 1.5, sy = horizonY + 140 * scale;
        const radX = c.r * scale * 1.25, radY = c.r * scale * 0.42;
        ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.ellipse(sx, sy, radX, radY, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fca5a5'; ctx.font = '800 9px Orbitron'; ctx.textAlign = 'center';
        ctx.fillText(es ? '⚠ CRÁTER' : '⚠ CRATER', sx, sy - radY - 4); ctx.textAlign = 'left';
      }
    });

    const dzPsr = 400 - lvl4.z;
    if (dzPsr > 5 && dzPsr < 420) {
      const psrY = horizonY + (310 / dzPsr) * 140;
      if (psrY > horizonY && psrY < h - 70) {
        ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
        ctx.beginPath(); ctx.moveTo(0, psrY); ctx.lineTo(w, psrY); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#c4b5fd'; ctx.font = '800 11px Orbitron';
        ctx.fillText(es ? '▼ ZONA HIELO PSR (-240 °C) · ENCIENDE LUZ UV ▼' : '▼ PSR ICE ZONE (-240 °C) · TURN ON UV LIGHT ▼', w * 0.23, psrY - 8);
      }
    }

    lvl4.beacons.forEach((b, i) => {
      const dx = b.x - lvl4.x, dz = b.z - lvl4.z;
      const dist = Math.round(Math.hypot(dx, dz));
      if (dz > 10) {
        const scale = Math.min(2.2, 310 / dz);
        const sx = w * 0.42 + dx * scale * 1.5, sy = horizonY + 140 * scale;
        const inRange = !b.placed && dist < 75;
        ctx.fillStyle = b.placed ? '#4ade80' : (inRange ? '#fde047' : '#38bdf8');
        ctx.fillRect(sx - 7 * scale, sy - 50 * scale, 14 * scale, 50 * scale);
        ctx.beginPath(); ctx.arc(sx, sy - 54 * scale, 8 * scale, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = b.placed ? '#86efac' : (inRange ? '#fde047' : '#fff');
        ctx.font = '800 11px Orbitron'; ctx.textAlign = 'center';
        ctx.fillText(b.placed ? `✔ ${es ? 'BALIZA' : 'BEACON'} ${i + 1}` : (inRange ? (es ? `¡PLANTAR #${i + 1}!` : `PLANT #${i + 1}!`) : `${es ? 'BALIZA' : 'BEACON'} ${i + 1} (${dist}m)`), sx, sy - 66 * scale);
        ctx.textAlign = 'left';
      }
    });

    if (inPSR && lvl4.uvLights) {
      const uv = ctx.createRadialGradient(w * 0.42, h * 0.72, 20, w * 0.42, h * 0.62, 360);
      uv.addColorStop(0, 'rgba(167, 139, 250, 0.52)'); uv.addColorStop(1, 'rgba(167, 139, 250, 0)');
      ctx.fillStyle = uv; ctx.fillRect(0, horizonY, w, h - horizonY);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.38)'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(w * 0.42, h * 0.72, 95, 28, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e0f2fe'; ctx.font = '800 11px Orbitron'; ctx.textAlign = 'center';
      ctx.fillText(lvl4.iceDrilled ? (es ? '✔ HIELO H₂O EXTRAÍDO' : '✔ H₂O ICE DRILLED') : (es ? '⛏️ HIELO DETECTADO · PULSA PERFORAR HIELO' : '⛏️ ICE DETECTED · PRESS DRILL ICE'), w * 0.42, h * 0.72 + 4);
      ctx.textAlign = 'left';
    }

    if (lvl4.hlsLanding) {
      const hlsX = w * 0.42, hlsY = horizonY - lvl4.hlsAlt;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(hlsX - 24, hlsY + 20); ctx.lineTo(hlsX - 42, hlsY + 42);
      ctx.moveTo(hlsX + 24, hlsY + 20); ctx.lineTo(hlsX + 42, hlsY + 42); ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(hlsX - 28, hlsY - 45, 56, 68, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4ade80'; ctx.font = '800 11px Orbitron'; ctx.textAlign = 'center';
      ctx.fillText('ARTEMIS HLS', hlsX, hlsY - 52);

      if (lvl4.hlsAlt <= 5) {
        [-75, -45, 65].forEach((ox, idx) => {
          const ax = hlsX + ox, ay = horizonY + 38;
          ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(ax, ay - 24, 9, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(ax, ay - 24, 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(ax - 10, ay - 14, 20, 28, 5); ctx.fill();
          ctx.fillRect(ax - 8, ay + 14, 6, 14); ctx.fillRect(ax + 2, ay + 14, 6, 14);
          if (idx === 0) {
            ctx.fillStyle = '#4ade80'; ctx.font = '800 10px Orbitron';
            ctx.fillText(es ? '¡TRIPULACIÓN ARTEMIS EN TIERRA!' : 'ARTEMIS CREW ON SURFACE!', hlsX, ay - 40);
          }
        });
      }
      ctx.textAlign = 'left';
    }

    const targetAngle = Math.atan2(target.x - lvl4.x, target.z - lvl4.z);
    const arrowX = w * 0.42, arrowY = 95;
    ctx.save(); ctx.translate(arrowX, arrowY); ctx.rotate(targetAngle);
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(13, 12); ctx.lineTo(0, 6); ctx.lineTo(-13, 12); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#fde047'; ctx.font = '800 10.5px Orbitron'; ctx.textAlign = 'center';
    ctx.fillText(`${es ? 'DESTINO' : 'TARGET'}: ${target.label} (${Math.round(Math.hypot(target.x - lvl4.x, target.z - lvl4.z))}m)`, arrowX, arrowY + 30);
    ctx.textAlign = 'left';
  }

  let lastT = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    update(dt); render();
    requestAnimationFrame(loop);
  }
  window.applyLanguageUI();
  requestAnimationFrame(loop);
})();
