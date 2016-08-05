import {Subscription} from 'rxjs/Rx';
import {Utils} from '../shared/helpers';
import {IEventChannel, ISubjectChannel} from '../shared/services';

export class BaseComponent {
    private _subscriptions: Subscription[] = [];

    protected markDispose(subscription: Subscription[])
    protected markDispose(subscription: Subscription)
    protected markDispose(subscription: any) {
        if (Array.isArray(subscription)) {
            this._subscriptions = this._subscriptions.concat(subscription);
        }
        else if (subscription instanceof Subscription) {
            this._subscriptions.push(subscription);
        }
    }

    ngOnDestroy() {
        _.each(this._subscriptions, subscription => {
            subscription.unsubscribe();
        });

        this._subscriptions = [];
    }
}