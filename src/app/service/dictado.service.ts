import { Injectable, NgZone, inject } from '@angular/core';

interface AlternativaVoz {
  readonly transcript: string;
}

interface ResultadoVoz {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [indice: number]: AlternativaVoz;
}

interface ListaResultadosVoz {
  readonly length: number;
  readonly [indice: number]: ResultadoVoz;
}

interface EventoVoz extends Event {
  readonly results: ListaResultadosVoz;
}

interface EventoErrorVoz extends Event {
  readonly error: string;
}

interface ReconocimientoVoz extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((evento: EventoVoz) => void) | null;
  onerror: ((evento: EventoErrorVoz) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type ConstructorVoz = new () => ReconocimientoVoz;

type CampoDictable = HTMLInputElement | HTMLTextAreaElement;

const SELECTOR_CAMPOS = 'input[type="text"], input[type="search"], input:not([type]), textarea';
const ID_BOTON = 'dictado-voz-boton';
const ID_ESTILOS = 'dictado-voz-estilos';

const ICONO_MIC = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>';

const ESTILOS = `
.dictado-voz-boton{position:fixed;display:none;align-items:center;justify-content:center;width:1.85rem;height:1.85rem;padding:0;border:0;border-radius:50%;background:transparent;color:var(--theme-text-muted,#6b7280);cursor:pointer;z-index:20000;line-height:0}
.dictado-voz-boton.visible{display:inline-flex}
.dictado-voz-boton:hover{color:var(--theme-primary,#3b82f6);background:var(--theme-surface,#f3f4f6)}
.dictado-voz-boton svg{width:1.1rem;height:1.1rem;display:block}
.dictado-voz-boton.escuchando{color:var(--theme-danger,#ef4444)}
.dictado-voz-boton.escuchando::after{content:'';position:absolute;inset:-2px;border-radius:50%;border:2px solid currentColor;opacity:.6;animation:dictado-voz-pulso 1s ease-out infinite}
@keyframes dictado-voz-pulso{0%{transform:scale(.9);opacity:.7}100%{transform:scale(1.35);opacity:0}}
`;

function obtenerConstructorVoz(): ConstructorVoz | null {
  const ventana = window as unknown as {
    SpeechRecognition?: ConstructorVoz;
    webkitSpeechRecognition?: ConstructorVoz;
  };
  return ventana.SpeechRecognition ?? ventana.webkitSpeechRecognition ?? null;
}

@Injectable({ providedIn: 'root' })
export class DictadoService {
  private readonly zone = inject(NgZone);
  private readonly constructorVoz = obtenerConstructorVoz();
  private reconocimiento: ReconocimientoVoz | null = null;
  private boton: HTMLButtonElement | null = null;
  private campo: CampoDictable | null = null;
  private escuchando = false;
  private iniciado = false;

  private readonly alEnfocar = (evento: FocusEvent): void => {
    const objetivo = evento.target;
    if (this.esCampoDictable(objetivo)) {
      this.mostrar(objetivo);
    }
  };

  private readonly alDesenfocar = (evento: FocusEvent): void => {
    const siguiente = evento.relatedTarget as Node | null;
    if (this.boton && siguiente === this.boton) return;
    if (this.escuchando) return;
    this.ocultar();
  };

  private readonly alDesplazar = (): void => this.posicionar();
  private readonly alRedimensionar = (): void => this.posicionar();

  init(): void {
    if (this.iniciado || !this.constructorVoz || !document.body) return;
    this.iniciado = true;
    this.inyectarEstilos();
    this.boton = this.crearBoton();
    document.body.appendChild(this.boton);
    document.addEventListener('focusin', this.alEnfocar, true);
    document.addEventListener('focusout', this.alDesenfocar, true);
    window.addEventListener('scroll', this.alDesplazar, true);
    window.addEventListener('resize', this.alRedimensionar);
  }

  private esCampoDictable(elemento: EventTarget | null): elemento is CampoDictable {
    if (elemento instanceof HTMLInputElement) {
      const tipo = (elemento.getAttribute('type') ?? 'text').toLowerCase();
      if (tipo !== 'text' && tipo !== 'search') return false;
    } else if (!(elemento instanceof HTMLTextAreaElement)) {
      return false;
    }
    if (elemento.readOnly || elemento.disabled) return false;
    if (elemento.matches(SELECTOR_CAMPOS) === false) return false;
    if (elemento.dataset['noDictado'] !== undefined) return false;
    if (elemento.closest('[data-no-dictado]')) return false;
    return true;
  }

  private crearBoton(): HTMLButtonElement {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.id = ID_BOTON;
    boton.className = 'dictado-voz-boton';
    boton.tabIndex = -1;
    boton.setAttribute('aria-label', 'Dictar por micrófono');
    boton.title = 'Dictar por micrófono';
    boton.innerHTML = ICONO_MIC;
    boton.addEventListener('mousedown', (evento) => evento.preventDefault());
    boton.addEventListener('click', () => this.alternar());
    return boton;
  }

  private mostrar(campo: CampoDictable): void {
    if (!this.boton) return;
    this.detener();
    this.campo = campo;
    this.boton.classList.add('visible');
    this.posicionar();
  }

  private ocultar(): void {
    this.detener();
    this.boton?.classList.remove('visible');
    this.campo = null;
  }

  private posicionar(): void {
    if (!this.boton || !this.campo || !this.boton.classList.contains('visible')) return;
    const rect = this.campo.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      this.boton.classList.remove('visible');
      return;
    }
    const tam = this.boton.offsetWidth || 30;
    this.boton.style.top = `${rect.top + (rect.height - tam) / 2}px`;
    this.boton.style.left = `${rect.right - tam - 6}px`;
  }

  private alternar(): void {
    if (this.escuchando) {
      this.detener();
      return;
    }
    this.iniciar();
  }

  private iniciar(): void {
    if (!this.constructorVoz || !this.campo) return;
    const reconocimiento = new this.constructorVoz();
    reconocimiento.lang = 'es-GT';
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;
    reconocimiento.onstart = () => this.establecerEscuchando(true);
    reconocimiento.onresult = (evento) => this.insertar(evento);
    reconocimiento.onerror = () => this.establecerEscuchando(false);
    reconocimiento.onend = () => this.establecerEscuchando(false);
    this.reconocimiento = reconocimiento;
    try {
      reconocimiento.start();
    } catch {
      this.establecerEscuchando(false);
    }
  }

  private detener(): void {
    const reconocimiento = this.reconocimiento;
    this.reconocimiento = null;
    if (reconocimiento) {
      try {
        reconocimiento.stop();
      } catch {
      }
    }
    this.establecerEscuchando(false);
  }

  private establecerEscuchando(activo: boolean): void {
    this.escuchando = activo;
    this.boton?.classList.toggle('escuchando', activo);
  }

  private insertar(evento: EventoVoz): void {
    const campo = this.campo;
    if (!campo) return;
    let texto = '';
    for (let i = 0; i < evento.results.length; i++) {
      texto += evento.results[i][0]?.transcript ?? '';
    }
    texto = texto.trim();
    if (!texto) return;
    this.insertarEnCampo(campo, texto);
  }

  private insertarEnCampo(campo: CampoDictable, texto: string): void {
    const inicio = campo.selectionStart ?? campo.value.length;
    const fin = campo.selectionEnd ?? campo.value.length;
    const prefijo = campo.value.slice(0, inicio);
    const sufijo = campo.value.slice(fin);
    const separador = prefijo && !/\s$/.test(prefijo) ? ' ' : '';
    const nuevoValor = `${prefijo}${separador}${texto}${sufijo}`;
    const posicion = inicio + separador.length + texto.length;
    this.zone.run(() => {
      campo.value = nuevoValor;
      campo.setSelectionRange(posicion, posicion);
      campo.dispatchEvent(new Event('input', { bubbles: true }));
      campo.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  private inyectarEstilos(): void {
    if (document.getElementById(ID_ESTILOS)) return;
    const estilo = document.createElement('style');
    estilo.id = ID_ESTILOS;
    estilo.textContent = ESTILOS;
    document.head.appendChild(estilo);
  }
}
