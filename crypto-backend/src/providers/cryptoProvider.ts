import { Crypto } from 'src/interfaces/Crypto';

export abstract class CryptoProvider {
    abstract getCryptos(): Promise<Crypto[]>;

    abstract getUserCryptos(userId: string): Promise<Crypto[]>;

    abstract deleteCrypto(cryptoId: string, userId: string): Promise<void>;

    abstract addCrypto(
        userId: string,
        id: string,
        name: string,
        symbol: string,
        price: number,
        trend: number
    ): Promise<Crypto>; 

    abstract getCryptoDetails(id: string, userId: string): Promise<{ crypto: Crypto; priceHistory: any[] }>;
}