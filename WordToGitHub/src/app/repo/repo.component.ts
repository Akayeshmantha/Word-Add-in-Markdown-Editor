import {Component, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs/Rx';
import {Router, ActivatedRoute} from '@angular/router';
import {GithubService, MediatorService, FavoritesService} from '../shared/services';
import {Utils, StorageHelper} from '../shared/helpers';
//import {BaseComponent} from '../components';
import {InfiniteScroll} from 'angular2-infinite-scroll';
import {IRepository, IRepositoryCollection, IEventChannel} from '../shared/services';
import {SafeNamesPipe} from '../shared/pipes';

@Component(Utils.component('repo', {
    pipes: [SafeNamesPipe],
    directives: [InfiniteScroll]
}))
export class RepoComponent implements OnInit {
    repositories: IRepository[];
    query: string;
    selectedOrg: string;
    cache: StorageHelper<IRepository>;
    channel: IEventChannel;
    page: number = 1;
    pages = new Subject();

    constructor(
        private _githubService: GithubService,
        private _mediatorService: MediatorService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _favoritesService: FavoritesService
    ) {
        //super();
        this.cache = new StorageHelper<IRepository>("FavoriteRepositories");
        this.channel = this._mediatorService.createEventChannel<Event>('hamburger');
        //this.markDispose(this.channel);
    }

    selectRepo(repository: IRepository) {
        this._router.navigate([repository.owner.login, repository.name, 'master']);
    }

    ngOnInit() {
        this.page = 1;
        var subscription = this._route.params.subscribe(params => {
            this.selectedOrg = params['org'] || this._githubService.profile.user.login;
            this._githubService.repos(this.page, this.selectedOrg, this.selectedOrg === this._githubService.profile.user.login)
                .subscribe(repos => {
                    if (Utils.isEmpty(repos)) { return; }
                    this.repositories = repos;
                });
        });

        //this.markDispose(subscription);
    }

    pin(item: IRepository) {
        this.cache.add(item.id.toString(), item);
        this._favoritesService.pushData(item);
    }

    showMenu() {
        this.channel.event.next(true);
    }

    showNext() {
        console.log('scroll invoked', this.page);
        this.page = this.page + 1;
        var subscription = this._githubService.repos(this.page, this.selectedOrg, this.selectedOrg === this._githubService.profile.user.login)
            .subscribe(repos => {
                if (Utils.isEmpty(repos)) {
                    this.page = 1;
                    this.showPrevious();
                }
                this.repositories = repos;
            });

        //this.markDispose(subscription);
    }

    showPrevious() {
        if (this.page > 1) {
            this.page = this.page - 1;
        }

        var subscription = this._githubService.repos(this.page, this.selectedOrg, this.selectedOrg === this._githubService.profile.user.login)
            .subscribe(repos => {
                this.repositories = repos;
            });

        //this.markDispose(subscription);
    }
}