export interface CryptoAlert {
    id: string;
    userId: string;
    cryptoId: string;
    thresholdPercentage: number;
    alertType: 'up' | 'down';  
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }