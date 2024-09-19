import axios from 'axios'

const API_URL = 'https://docs.coincap.io/'

export const getCryptos = async () => {
    return axios.get(`${API_URL}/cryptos`)
}

export const addCrypto = async (crypto: {name: string, symbol: string, price: number, trend: number}) => {
    return axios.post(`${API_URL}/cryptos`, crypto)
}