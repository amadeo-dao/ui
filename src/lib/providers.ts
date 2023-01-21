import { ethers } from 'ethers';

export const provider =
  process.env.NODE_ENV === 'development'
    ? new ethers.providers.JsonRpcProvider({ url: 'http://localhost:8545' })
    : new ethers.providers.AlchemyProvider('homestead', process.env.ALCHEMY_KEY);
