import { erc20ABI } from 'wagmi';

declare const vaultABI: readonly [
  typeof erc20ABI,
  {
    readonly type: 'function';
    readonly name: 'asset';
    readonly stateMutability: 'view';
    readonly inputs: readonly [];
    readonly outputs: readonly [
      {
        readonly name: '';
        readonly type: 'address';
      }
    ];
  }
];

export default vaultABI;
