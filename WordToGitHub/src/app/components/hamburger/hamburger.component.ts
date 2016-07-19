﻿import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Rx';
//import {BaseComponent} from '../../components';
import {Utils, StorageHelper} from '../../shared/helpers';
import {GithubService, MediatorService, FavoritesService, IUserProfile, IProfile, IRepository, IEventChannel} from '../../shared/services';
import {SafeNamesPipe} from '../../shared/pipes';

@Component(Utils.component('hamburger', { pipes: [SafeNamesPipe] }, 'components/hamburger'))

export class HamburgerComponent implements OnInit {
    cache: StorageHelper<IRepository>;
    channel: IEventChannel;
    isShown: Observable<boolean>;
    favoriteRepositories: IRepository[];
    
    constructor(
        private _githubService: GithubService,
        private _mediatorService: MediatorService,
        private _router: Router,
        private _favoritesService: FavoritesService
    ) {
        //super();
        this.cache = new StorageHelper<IRepository>("FavoriteRepositories");
        this.channel = this._mediatorService.createEventChannel<boolean>('hamburger');
        //this.markDispose(this.channel);
    }

    ngOnInit() {
        this.isShown = this.channel.source$;
        this.favoriteRepositories = _.values(this.cache.all());
        this._favoritesService.pushDataEvent.event.subscribe(
            item => {
                this.cache.add(item.id.toString(), item);
                this.favoriteRepositories = _.values(this.cache.all());
            }
         );
    }

    get profile(): IUserProfile {
        return this._githubService.profile;
    }

    closeMenu() {
        this.channel.event.next(false);
    }

    selectRepository(repository: IRepository) {
        this._router.navigate([repository.owner.login, repository.name, 'master']);
        this.closeMenu();
    }

    selectOrg(org: IProfile) {
        if (Utils.isNull(org)) {
            this._router.navigate(['']);
        }
        else {
            this._router.navigate([org.login]);
        }
        this.closeMenu();
    }

    unpin(repository: IRepository) {
        this.cache.remove(repository.id.toString());
        this.favoriteRepositories = _.values(this.cache.all());
    }

    signOut() {
        this._githubService.logout();
        this._router.navigate(['/login']);
        this.closeMenu();
    }
}