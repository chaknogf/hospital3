// std.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { BaseApiService, PaginationState } from '../service/base-api.service';


@Injectable({ providedIn: 'root' })
export class StdService extends BaseApiService {

}
