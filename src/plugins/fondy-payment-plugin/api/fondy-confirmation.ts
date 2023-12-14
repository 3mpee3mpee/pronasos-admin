import { Controller, Post, HttpCode } from '@nestjs/common';
import { Ctx, ProductService, RequestContext } from '@vendure/core';

@Controller('fondy-confirm')
export class ProductsController {
    constructor(private productService: ProductService) {
    }

    @Post()
    findAll(@Ctx() ctx: RequestContext) {
        console.log(ctx);
        return this.productService.findAll(ctx);
    }
}
