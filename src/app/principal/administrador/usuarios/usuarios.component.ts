import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Usuario, UsuarioOut } from '../../../interface/usuarios.interface';
import { skip } from 'rxjs';
import { addIcon, removeIcon, menuIcon, cancelIcon, findIcon, searchIcon, arrowDown, tablaShanonIcon, editIcon, skipLeft } from '../../../shared/icons/svg-icon';


@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UsuariosComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  //========Estados ========
  usuarios: UsuarioOut[] = [];
  usuarioSeleccionado: UsuarioOut | null = null;
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  finPagina: boolean = false;
  rowActiva: number | null = null;
  totalUsuarios = 0;


  // ======= FILTROS =======
  filtros: any = {
    id: 0,
    username: '',
    email: '',
    rol: '',
    skip: 0,
    limit: 200,
  };

  //======== ICONOS ======
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  searchIcon!: SafeHtml;
  arrowDown!: SafeHtml;
  tablaShanonIcon!: SafeHtml;
  editIcon!: SafeHtml;
  skipRight!: SafeHtml;
  skipLeft!: SafeHtml;
  menuIcon!: SafeHtml;

  filtroForm: FormGroup = this.fb.group({
    id: [0],
    username: [''],
    email: [''],
    rol: [''],

  });

  constructor() {
    this.inicializarIconos();
  }

  ngOnInit() {
    this.api.usuarios$.subscribe(data => {
      this.usuarios = data;

      this.cargando = false;
    });


    this.cargarUsuarios(); // 🔥 importante
  }

  private inicializarIconos(): void {
    this.addIcon = this.sanitizer.bypassSecurityTrustHtml(addIcon);
    this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(removeIcon);
    this.menuIcon = this.sanitizer.bypassSecurityTrustHtml(menuIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);
    this.findIcon = this.sanitizer.bypassSecurityTrustHtml(findIcon);
    this.searchIcon = this.sanitizer.bypassSecurityTrustHtml(searchIcon);
    this.arrowDown = this.sanitizer.bypassSecurityTrustHtml(arrowDown);
    this.tablaShanonIcon = this.sanitizer.bypassSecurityTrustHtml(tablaShanonIcon);
    this.editIcon = this.sanitizer.bypassSecurityTrustHtml(editIcon);
    this.skipLeft = this.sanitizer.bypassSecurityTrustHtml(skipLeft);
    this.skipRight = this.sanitizer.bypassSecurityTrustHtml(skipLeft);

  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.api.getUsers(this.filtros).subscribe();
  }

  limpiarFiltros(): void {
    this.filtros = {
      id: 0,
      username: '',
      email: '',
      rol: '',
      skip: 0,
      limit: 200,
    }
    this.cargarUsuarios();
  }

  toggleFiltros(): void {
    this.filtrar = !this.filtrar;
  }

  trackById(_index: number, u: UsuarioOut): number {
    return u.id;
  }

  // ======= SELECCIÓN / DETALLE =======
  verDetalle(id: number): void {

    this.visible = true;
  }

  cerrarDetalle(): void {
    this.usuarioSeleccionado = null;
    this.visible = false;
  }

  editar(id: number): void {
    this.router.navigate(['/usuario', id]);
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }

}
