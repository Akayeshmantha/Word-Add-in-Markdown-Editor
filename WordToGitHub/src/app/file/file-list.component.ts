import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Router, ActivatedRoute, ROUTER_DIRECTIVES} from '@angular/router';
import {GithubService, MediatorService, IRepository, IBreadcrumb, IBranch, IEventChannel} from '../shared/services';
import {Utils} from '../shared/helpers';
import {SafeNamesPipe} from '../shared/pipes';
import {BreadcrumbComponent} from '../components';

@Component(Utils.component('file-list', {
    pipes: [SafeNamesPipe],
    directives: [ROUTER_DIRECTIVES],
}, 'file'))
export class FileListComponent implements OnInit {
    selectedOrg: string;
    selectedRepoName: string;
    selectedBranch: IBranch;
    branches: Observable<IBranch[]>;
    channel: IEventChannel;

    constructor(
        private _githubService: GithubService,
        private _mediatorService: MediatorService,
        private _router: Router,
        private _route: ActivatedRoute

    ) {
        //super();
        this.channel = this._mediatorService.createEventChannel<boolean>('hamburger');
        //this.markDispose(this.channel);
    }

    ngOnInit() {
        var subscription = this._route.params.subscribe(params => {
            this.selectedRepoName = params['repo'];
            this.selectedOrg = params['org'];
            this.selectedBranch = <IBranch>{
                name: params['branch'] || 'master'
            }
            this.branches = this._githubService.branches(this.selectedOrg, this.selectedRepoName)
        });
    }
        //this.markDispose(subscription);
    selectBranch(branchName: string) {
        this._router.navigate([this.selectedOrg, this.selectedRepoName, branchName]);
        this.selectedBranch.name = branchName;
    }

    navigate(breadcrumb: IBreadcrumb) {
        var path = Utils.isNull(breadcrumb.href) ? null : encodeURIComponent(breadcrumb.href);
        this._router.navigate([this.selectedOrg, this.selectedRepoName, this.selectedBranch.name, path]);
    }

    showMenu() {
        this.channel.event.next(true);
    }
}