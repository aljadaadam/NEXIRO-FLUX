import LiveDemoFrame from '../../components/demo/LiveDemoFrame';

export default function StellarDashboardLiveDemo() {
  return (
    <LiveDemoFrame
      path="/admin?demo=1"
      title="لوحة تحكم متجر ستيلار — العرض التجريبي"
      storeName="Stellar Store Dashboard"
      storeUrl="https://demo-stellar.nexiroflux.com"
      templateLink="/template/stellar-store"
    />
  );
}
