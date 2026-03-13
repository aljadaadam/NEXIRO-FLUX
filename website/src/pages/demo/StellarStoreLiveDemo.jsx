import LiveDemoFrame from '../../components/demo/LiveDemoFrame';

export default function StellarStoreLiveDemo() {
  return (
    <LiveDemoFrame
      path="/?demo=1"
      title="متجر ستيلار — العرض التجريبي"
      storeName="Stellar Store"
      storeUrl="https://demo-stellar.nexiroflux.com"
      templateLink="/template/stellar-store"
    />
  );
}
