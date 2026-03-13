import LiveDemoFrame from '../../components/demo/LiveDemoFrame';

export default function AflatoonDashboardLiveDemo() {
  return (
    <LiveDemoFrame
      path="/admin?demo=1"
      title="لوحة تحكم متجر الأفلاطون — العرض التجريبي"
      storeName="Aflatoon Store Dashboard"
      storeUrl="https://demo-aflatoon.nexiroflux.com"
      templateLink="/template/aflatoon-store"
    />
  );
}
