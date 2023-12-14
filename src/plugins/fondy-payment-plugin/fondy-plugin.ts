import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { ProductsController } from './api/fondy-confirmation';

@VendurePlugin({
  imports: [PluginCommonModule],
  controllers: [ProductsController],
})
export class FondyPlugin {}
