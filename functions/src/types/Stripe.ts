export type StripeLineItem = {
  price_data: {
    currency: 'usd';
    unit_amount: number;
    product_data: {
      name: string;
      description: string;
      metadata: {
        sku: string;
        categoryId: string;
      };
      tax_code: 'txcd_99999999';
    };
  };
  quantity: number;
};
