import LiveDemoFrame from '../../components/demo/LiveDemoFrame';

export default function GxVaultDashboardLiveDemo() {
  return (
    <LiveDemoFrame
      path="/admin?demo=1"
      title="لوحة تحكم GxVault — العرض التجريبي"
      storeName="GxVault Dashboard"
      storeUrl="https://demo-gxv.nexiroflux.com"
      templateLink="/template/game-topup-store"
    />
  );
}
