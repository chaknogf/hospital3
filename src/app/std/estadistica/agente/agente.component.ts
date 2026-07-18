import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StdService } from '../../std.service';

interface Mensaje {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
  sql?: string;
  datos?: any[];
  columnas?: string[];
}

@Component({
  selector: 'app-agente',
  templateUrl: './agente.component.html',
  styleUrls: ['./agente.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AgenteComponent {
  private api = inject(StdService);

  mensajes = signal<Mensaje[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy el agente de datos. Puedes preguntarme estadísticas, comparaciones o buscar información en la base de datos.\n\nEjemplos:\n• "¿Cuántos pacientes hay por sexo?"\n• "¿Cuántas consultas se realizaron este mes?"\n• "Top 5 diagnósticos más frecuentes"',
    },
  ]);
  input = signal('');
  cargando = signal(false);
  mostrarSql = signal<Record<number, boolean>>({});

  enviar(): void {
    const texto = this.input().trim();
    if (!texto || this.cargando()) return;

    const msgUser: Mensaje = { role: 'user', content: texto };
    this.mensajes.update(m => [...m, msgUser]);
    this.input.set('');
    this.cargando.set(true);

    const historial = this.mensajes()
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(0, -1)
      .map(m => ({ role: m.role, content: m.content }));

    this.api.consultarChat(historial).subscribe({
      next: (res) => {
        const msgAsistente: Mensaje = {
          role: 'assistant',
          content: res.respuesta,
          sql: res.sql_generado ?? undefined,
          datos: res.datos?.length ? res.datos : undefined,
          columnas: res.columnas?.length ? res.columnas : undefined,
        };
        this.mensajes.update(m => [...m, msgAsistente]);
        this.cargando.set(false);
      },
      error: (err) => {
        const msgError: Mensaje = {
          role: 'assistant',
          content: `Error: ${err?.message || 'No se pudo conectar con el agente'}`,
          error: true,
        };
        this.mensajes.update(m => [...m, msgError]);
        this.cargando.set(false);
      },
    });
  }

  toggleSql(idx: number): void {
    this.mostrarSql.update(m => ({ ...m, [idx]: !m[idx] }));
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  trackByIdx(index: number): number {
    return index;
  }
}
