// fondy-service.ts
import axios from 'axios';
import * as crypto from 'crypto';
import { Order } from '@vendure/core';

export default interface APIConfig {
    merchantId: String;
    responseUrl: String;
    merchantPass: String;
}

interface FondyPayload {
    order_id: String;
    merchant_id: Number;
    order_desc: String;
    signature: String;
    amount: Number;
    currency: String;
    response_url: String;
}

interface FondyRequest {
    request: FondyPayload;
}

interface FondyResponse {
    ok: Boolean;
    redirectURL: String | null;
    signature: string | null;
}

export class FondyService {
    private order: Order;
    private config: any; // Replace 'any' with the actual type
    private readonly FONDY_API_URL = 'https://pay.fondy.eu/api/checkout/url/'; // Updated Fondy.ua API endpoint

    constructor(config: APIConfig, order: Order) {
        this.config = config;
        this.order = order;
    }

    async initiatePayment(): Promise<FondyResponse> {
        try {
            // Implement logic to initiate payment with Fondy.ua
            // Use the 'order' object to get necessary information (e.g., total amount, currency, etc.)

            const payload: FondyRequest = {
                request: {
                    order_id: String(this.order.id),
                    order_desc: `Order #${this.order.id}`,
                    amount: Math.round(this.order.total), // assuming the amount is in cents
                    currency: this.order.currencyCode,
                    merchant_id: this.config.merchantId,
                    response_url: this.config.responseUrl,
                    signature: '' // Add response_url to the payload
                // ... other Fondy.ua parameters
                }
            };

            // Include the signature in the payload
            const signature = this.generateSignature(this.config.merchantId, this.config.merchantPass, payload.request);
            payload.request.signature = signature;
            const response = await axios.post(`${this.FONDY_API_URL}`, payload, {headers: {
                'Content-Type': 'application/json'
            }});// Updated endpoint

            if (response?.data?.response?.response_status) {
                const status: String = response.data.response.response_status;

                return status === 'failure' ? {ok: false, redirectURL: null, signature: null} : {ok: true, redirectURL: response.data.response.checkout_url, signature: signature};
            }

            throw new Error('Payment initiation failed');

        } catch (error: any) {
            throw new Error('Payment initiation failed');
        }
    }
    
    // @Query()
    // async handleCallback(callbackData: any, @Ctx() ctx: RequestContext): Promise<void> {
    //     try {
    //         // Implement logic to handle Fondy callback
    //         // Update Vendure order status based on the callback

    //         // Example: Update order status based on callback data
    //         const orderId = callbackData.order_id;
    //         const orderStatus = callbackData.order_status;

    //         // Verify the signature in the callbackData to ensure its integrity
    //         const isValidSignature = this.verifySignature(callbackData);
    //         if (!isValidSignature) {
    //             console.error('Invalid callback signature');
    //             throw new Error('Invalid callback signature');
    //         }

    //         // Update order status in your Vendure system
    //         // This might involve fetching the order from the database and updating its status
    //         const order = await this.orderService.findOne(ctx, orderId);
    //         if (order) {
    //             await this.orderService.transitionToState(ctx, order: ID, orderStatus);
    //         } else {
    //             console.error(`Order with ID ${orderId} not found`);
    //         }

    //     } catch (error) {
    //         console.error('Fondy Callback Handling Error:', error);
    //         throw new Error('Error handling Fondy callback');
    //     }
    // }

    private generateSignature(merchantId: Number, password: String, payload: FondyPayload): string {
        let params : any = {};
        params['merchant_id'] = merchantId;
    // Remove empty string values
        params = Object.fromEntries(Object.entries(payload).filter(([_, value]) => String(value).length > 0));
        
        // Sort parameters by key
        const sortedParams = Object.keys(params).sort().map(key => params[key]);
        
        // Add password to the beginning of the array
        sortedParams.unshift(password);
        
        // Concatenate parameters with '|'
        const concatenatedParams = sortedParams.join('|');
        
        // Calculate SHA-1 hash using crypto
        const sha1Hash = crypto.createHash('sha1').update(concatenatedParams).digest('hex');
        
        return sha1Hash;

    }

    // private verifySignature(callbackData: any): boolean {
    //     const receivedSignature = callbackData.signature;
    //     delete callbackData.signature;

    //     const expectedSignature = this.generateSignature(callbackData);
    //     return receivedSignature === expectedSignature;
    // }
}
