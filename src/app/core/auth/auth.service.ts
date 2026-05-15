import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, UserRole } from '../models';
import { environment } from '../../../environments/environment';

interface StoredSession {
  token: string;
  role: UserRole;
  email: string;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_KEY = 'kairos_session';
  private readonly _session = signal<StoredSession | null>(this.loadSession());

  readonly isLoggedIn = computed(() => {
    const s = this._session();
    return s !== null && s.expiresAt > Date.now();
  });
  readonly role = computed(() => this._session()?.role ?? null);
  readonly email = computed(() => this._session()?.email ?? null);
  readonly token = computed(() => this._session()?.token ?? null);

  readonly canWrite = computed(() =>
    this.role() === 'ADMIN' || this.role() === 'SECRETARY'
  );
  readonly isAdmin = computed(() => this.role() === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, req).pipe(
      tap(res => {
        const session: StoredSession = {
          token: res.token,
          role: res.role as UserRole,
          email: req.email,
          expiresAt: Date.now() + res.expiresInMs,
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        this._session.set(session);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    this._session.set(null);
    this.router.navigate(['/login']);
  }

  private loadSession(): StoredSession | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) return null;
    try {
      const s: StoredSession = JSON.parse(raw);
      return s.expiresAt > Date.now() ? s : null;
    } catch {
      return null;
    }
  }
}
