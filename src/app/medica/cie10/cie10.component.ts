import { Component, OnInit, Input, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { finalize, catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

interface Cie10Code {
  codigo: string;
  descripcion: string;
  nivel: number;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  codigos?: Cie10Code[];
}

interface Cie10SearchResponse {
  total: number;
  resultados: Cie10Code[];
  consulta: string;
}

interface MensajeChat {
  role: string;
  content: string;
}

interface Cie10ChatRequest {
  mensajes: MensajeChat[];
  codigos_contexto?: string[];
}

interface Cie10ChatResponse {
  respuesta: string;
  codigos_relacionados: Cie10Code[];
  modelo: string;
  generado_en: string;
}

@Component({
  selector: 'app-cie10',
  templateUrl: './cie10.component.html',
  styleUrls: ['./cie10.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CommonModule]
})
export class Cie10Component implements OnInit {
  @Input() embedded = false;

  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = environment.apiUrl;

  messages = signal<ChatMessage[]>([]);
  inputText = signal('');
  loading = signal(false);
  usados = signal<Cie10Code[]>([]);
  loadingUsados = signal(false);
  tab = signal<'chat' | 'usados'>('chat');

  searchResults = signal<Cie10Code[]>([]);
  searchTotal = signal(0);
  searching = signal(false);

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.messages.set([{
      role: 'system',
      content: 'CIE-10. Escribe un diagnóstico o código para buscar.'
    }]);
    this.cargarUsados();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching.set(true)),
      switchMap(q => {
        if (!q || q.trim().length < 2) {
          this.searchResults.set([]);
          this.searchTotal.set(0);
          this.searching.set(false);
          return of(null);
        }
        const params = new HttpParams().set('q', q).set('limit', '10');
        return this.http.get<Cie10SearchResponse>(`${this.baseUrl}/cie10/`, { params }).pipe(
          catchError(() => of(null)),
          tap(() => this.searching.set(false))
        );
      })
    ).subscribe(data => {
      if (data) {
        this.searchResults.set(data.resultados);
        this.searchTotal.set(data.total);
      }
    });
  }

  cargarUsados(): void {
    this.loadingUsados.set(true);
    this.http.get<Cie10Code[]>(`${this.baseUrl}/cie10/usados`).pipe(
      finalize(() => this.loadingUsados.set(false))
    ).subscribe({
      next: data => this.usados.set(data),
      error: () => this.usados.set([])
    });
  }

  onInput(value: string): void {
    this.inputText.set(value);
    if (value.trim().length >= 2) {
      this.searchSubject.next(value);
    } else {
      this.searchResults.set([]);
      this.searchTotal.set(0);
    }
  }

  enviar(): void {
    const texto = this.inputText().trim();
    if (!texto || this.loading()) return;

    const historial = this.messages()
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));
    historial.push({ role: 'user', content: texto });

    this.messages.update(msgs => [...msgs, { role: 'user', content: texto }]);
    this.inputText.set('');
    this.searchResults.set([]);
    this.searchTotal.set(0);
    this.loading.set(true);

    const body: Cie10ChatRequest = { mensajes: historial };

    this.http.post<Cie10ChatResponse>(
      `${this.baseUrl}/cie10/consultar`, body
    ).pipe(
      finalize(() => this.loading.set(false)),
      catchError(err => {
        const detalle = err?.error?.detail || err?.message || 'Error desconocido';
        this.messages.update(msgs => [...msgs, {
          role: 'assistant',
          content: `LLM no disponible: ${detalle}`
        }]);
        return of(null);
      })
    ).subscribe(data => {
      if (!data) return;
      this.messages.update(msgs => [...msgs, {
        role: 'assistant',
        content: data.respuesta,
        codigos: data.codigos_relacionados
      }]);
    });
  }

  seleccionarCodigo(codigo: string): void {
    this.inputText.set(codigo);
    this.tab.set('chat');
  }

  volver(): void {
    this.router.navigate(['/clinica']);
  }
}
