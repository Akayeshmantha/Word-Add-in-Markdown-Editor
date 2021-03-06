﻿import { Injectable, EventEmitter, OnDestroy } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Utilities } from '../helpers';
import { GithubService } from './github.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private _router: Router,
        private _githubService: GithubService
    ) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (!Utilities.isNull(this._githubService.profile)) { return true; }
        this._router.navigate(['/login']);
        return false;
    }
}