export abstract class CryptoProvider {
    getCryptos(): Promise<any[]> {
        throw new Error("Method not implemented.");
    };
    getUserCryptos(userId: string): Promise<any[]> {
        throw new Error("Method not implemented.");
    };
    deleteCrypto(cryptoId: string, userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    };
    addCrypto(userId: string, id: string, name: string, symbol: string, price: number, trend: number): Promise<any> {
        throw new Error("Method not implemented.");
    }; 
    getCryptoDetails(id: string): Promise<any> {
        throw new Error("Method not implemented.");
    };
}