import {bootstrap} from '@angular/platform-browser-dynamic';
import {provide} from '@angular/core';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {HTTP_PROVIDERS} from '@angular/http';
import {ROUTER_PROVIDERS} from '@angular/router';

import {HomeComponent} from "./home/home.component";
import {GithubService} from "./shared/services/github.service";

if (window.hasOwnProperty('Office')) {
    Office.initialize = (reason) => {
        console.log('Office is initialized');
        bootstrap(HomeComponent, [
            provide(LocationStrategy, { useClass: HashLocationStrategy }),
            HTTP_PROVIDERS,
            ROUTER_PROVIDERS,
            GithubService
        ]);
    };
}
else {
    bootstrap(HomeComponent, [HTTP_PROVIDERS, ROUTER_PROVIDERS, GithubService]);
}