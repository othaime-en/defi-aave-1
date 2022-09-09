import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers';
import * as hre from 'hardhat';
import { ethers } from 'hardhat';
import { getWeth} from "./getWeth"
import { BigNumber } from 'ethers';

async function main() {
  const deployer = (await ethers.getSigners())[0];
  //await hre.run('run', { script: './scripts/getWeth.ts' });
  await getWeth();

  const lendingPool = await getLendingPool(deployer);

  await approveWethToaave(
    deployer,
    lendingPool.address,
    ethers.utils.parseEther('0.02')
  );

  await lendingPool.deposit(
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    ethers.utils.parseEther('0.02'),
    deployer.address,
    0
  );
  console.log('Deposited!');
}

async function getLendingPool(deployer: any) {
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    'ILendingPoolAddressesProvider',
    '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
    deployer
  );

  const lendingPoolAddress =
    await lendingPoolAddressesProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    'ILendingPool',
    lendingPoolAddress,
    deployer
  );

  console.log(`lendingPoolAddress is ${lendingPool.address}`);
  return lendingPool;
}

async function approveWethToaave(
  owner: any,
  spender: string,
  amount: BigNumber
) {
  const Weth = await ethers.getContractAt(
    'IERC20',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    owner
  );

  const tx = await Weth.approve(spender, amount);
  await tx.wait(1);

  const wethAmount = await Weth.allowance(owner.address, spender);
  console.log(`Approved ${wethAmount} weth to aave`);
}

main()
  .then(() => {
    console.log('aave is borrowed!');
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
