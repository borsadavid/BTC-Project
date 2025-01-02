Custom token transactions

Installation guide:    
add MyToken.sol into an anvil project in /src
    
Run ``anvil``    
Run ``forge create --rpc-url http://127.0.0.1:8545 \
  --private-key <private-key> \
  src/MyToken.sol:MyToken``
    
Add an account to MetaMask (choose import account), and enter the private key of one of the generated accounts when running ``anvil``.    
   


