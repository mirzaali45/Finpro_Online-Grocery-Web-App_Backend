declare module 'midtrans-client' {
    export class Snap {
      constructor(options?: any);
      createTransaction(parameters: any): Promise<{
        token: string;
        redirect_url: string;
      }>;
    }
  
    export class CoreApi {
      transaction: any;
      constructor(options?: any);
      // dsb.
    }
  }
  