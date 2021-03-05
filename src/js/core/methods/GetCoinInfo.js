/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { ERRORS } from '../../constants';

import { getCoinInfo } from '../../data/CoinInfo';
import type { CoreMessage, CoinInfo } from '../../types';

type Params = {
    coinInfo: CoinInfo,
};

export default class GetCoinInfo extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.useDevice = false;
        this.useUi = false;

        const { payload } = message;

        validateParams(payload, [{ name: 'coin', type: 'string', obligatory: true }]);

        const coinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        }

        this.params = {
            coinInfo,
        };
    }

    run() {
        return Promise.resolve(this.params.coinInfo);
    }
}
