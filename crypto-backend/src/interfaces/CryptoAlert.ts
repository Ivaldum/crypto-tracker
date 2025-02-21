export interface CryptoAlert {
    id: string;
    userId: string;
    cryptoId: string;
    thresholdPercentage: number;
    initialPrice: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    cryptocurrency?: any;
}