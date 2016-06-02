import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable, Observer} from 'rxjs';
import 'rxjs/add/operator/map';
import {Utils} from '../helpers/utilities';
import {StorageHelper} from '../helpers/storage.helper';

declare var Microsoft: any;

export interface IRepository {
    id: number;
    name: string;
    description: string;
    full_name?: string;
    owner_login?: string;
    private?: boolean;
    html_url?: string;
}

export interface IFile {
    id: number
    name: string;
    path?: string;
    url?: string;
    content?: string;
    branch?: string;
    authorName?: string;
    authorEmail?: string;
}

export interface IToken {
    access_token: string;
    token_type: string;
    scope: string;
}

@Injectable()
export class GithubService {
    private _baseUrl: string = "";
    private _storage: StorageHelper<IToken>;
    private _currentUser;
    private _currentToken;

    constructor(private _http: Http) {
        this._storage = new StorageHelper<IToken>("GitHubTokens");
    }

    repos(): Observable<IRepository[]> {
        let url = Utils.getMockFileUrl("json", "repository");
        return this._http.get(url).map(response => {
            var data = response.json();
            return data;        
        });
    }

    files(): Observable<IFile[]> {
        let url = Utils.getMockFileUrl("json", "file");
        return this._http.get(url).map(response => response.json());
    }

    file(name: string): Observable<string> {
        let url = Utils.getMockFileUrl("md", name);
        return this._http.get(url).map(response => response.text());
    }

    login(force?: boolean): Observable<IToken> {
        return Observable.create((observer: Observer<IToken>) => {
            var token = this._tryGetCachedToken("@user");
            if (force || Utils.isNull(token)) {
                var context = Office.context as any;
                context.ui.displayDialogAsync(window.location.protocol + "//" + window.location.host + "/authorize.html", { height: 35, width: 30 },
                    result => {
                        var dialog = result.value;
                        dialog.addEventHandler(Microsoft.Office.WebExtension.EventType.DialogMessageReceived, args => this._onUserLoggedIn(dialog, args, observer));
                    });
            }
            else {
                this._currentToken = token;
                this.loadProfile();
                observer.next(token);
                observer.complete();
            }

            return () => { console.info('Observable disposed'); }
        });
    }

    loadProfile() {
        var username = "@user";
        this._storage.add(username, this._currentToken);
    }

    switchProfile(username: string) {
        username = username || "@user";
        this._currentToken = this._storage.get(username);
        this.loadProfile();
    }

    logout(username: string) {
        username = username || "@user";
        this._storage.remove(username);
        this._currentToken = null;
    }

    private _tryGetCachedToken(username: string) {
        username = username || "@user";
        var token = this._storage.get(username);
        if (Utils.isEmpty(token)) return null;
        return token;
    }

    private _onUserLoggedIn(dialog: any, args: any, observer: Observer<string>) {
        dialog.close();

        if (Utils.isEmpty(args.message)) {
            observer.error("No token received");
        }
        else {
            try {
                this._currentToken = JSON.parse(args.message);
                this.loadProfile();
                observer.next(this._currentToken);
            }
            catch (exception) {
                observer.error(exception);
            }
        }

        observer.complete();
    }
}