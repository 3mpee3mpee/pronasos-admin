import {
    CancelPaymentResult,
    CancelPaymentErrorResult,
    PaymentMethodHandler,
    LanguageCode,
    CreatePaymentResult,
    SettlePaymentResult,
    SettlePaymentErrorResult
} from '@vendure/core';
import { FondyService } from './fondy-service';

/**
 * This is a handler which integrates Vendure with an imaginary
 * payment provider, who provide a Node SDK which we use to
 * interact with their APIs.
 */
export const fondyPaymentHandler = new PaymentMethodHandler({
    code: 'fondy-payment-method',
    description: [{
        languageCode: LanguageCode.en,
        value: 'Fondy UA',
    }, {
        languageCode: LanguageCode.uk,
        value: 'Fondy UA'
    }],
    args: {
        merchantId: {type: 'string'},
        responseUrl: {type: 'string'},
        password: {type: 'string'}
    },

    /** This is called when the `addPaymentToOrder` mutation is executed */
    createPayment: async (ctx, order, amount, args, metadata): Promise<CreatePaymentResult | any> => {
        try {
            const fondyService = new FondyService({merchantId: args.merchantId, responseUrl: args.responseUrl, merchantPass: args.password}, order);
            const result = await fondyService.initiatePayment();
            console.log(result)
            if (result.ok && result.redirectURL) {
                return {
                    ctx: ctx,
                    order: order,
                    amount: amount,
                    state: 'Authorized' as const,
                    metadata: {
                        signature: result.signature,
                        public: {
                            redirectURL: result.redirectURL,
                        }
                    },
                };
            }

            throw new Error('Payment initiation failed');
        } catch (err: any) {
            return {
                amount: order.total,
                state: 'Declined' as const,
                metadata: {
                    errorMessage: err.message,
                },
            };
        }
    },

    /** This is called when the `settlePayment` mutation is executed */
    settlePayment: async (ctx, order, payment, args): Promise<SettlePaymentResult | SettlePaymentErrorResult> => {
        return {success: true};
    },

    /** This is called when a payment is cancelled. */
    cancelPayment: async (ctx, order, payment, args): Promise<CancelPaymentResult | CancelPaymentErrorResult> => {
        return{success: true};
    },
});
