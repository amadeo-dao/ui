#!/bin/sh

# Load FORK_URL from .env.local - URL to fork from ethereum mainnet
. .env.local

NETWORK="localhost"
RPC_URL="http://localhost:8545"
CHAIN_ID="1337"

MANAGER=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
OWNER=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
MANAGER_PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
OWNER_PK=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

FACTORY=0x19C9770a0cfbf1f3A21E6611f0682f2bFA53c672

anvil --accounts 2 --balance 300 --block-time 5 --chain-id $CHAIN_ID --fork-url $FORK_URL 1>&2 &
sleep 3

exit 0
MOCKERC20=`forge create src/mocks/MockErc20.sol:MockERC20 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
		--rpc-url $RPC_URL \
		--json \
        | jq -r .deployedTo`

VAULT=`forge create src/Vault.sol:Vault --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
		--rpc-url  $RPC_URL\
		--constructor-args "DAI Vault" "vaultDAI" $MOCKERC20 $OWNER \
		--json \
        | jq -r .deployedTo`

REGISTRY=`forge create src/VaultRegistry.sol:VaultRegistry --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
		--rpc-url $RPC_URL \
		--json \
		| jq -r .deployedTo`

cast send --private-key $PRIVATE_KEY \
	$MOCKERC20 \
	"mint(address,uint256)" $MANAGER \
	0x00000000000000000000000000000000000000000000021e19e0c9bab2400000 >/dev/null

cast send --private-key $PRIVATE_KEY \
	$MOCKERC20 \
	"mint(address,uint256)" $OWNER \
	0x00000000000000000000000000000000000000000000021e19e0c9bab2400000 >/dev/null

echo "REACT_APP_REGISTRIES=1337=$REGISTRY"
echo "REACT_APP_VAULT=$VAULT"
echo "REACT_APP_UNDERLYING=$MOCKERC20"
