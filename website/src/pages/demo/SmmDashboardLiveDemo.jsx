import LiveDemoFrame from '../../components/demo/LiveDemoFrame';

export default function SmmDashboardLiveDemo() {
  return (
    <LiveDemoFrame
      path="/admin?demo=1"
      title="لوحة تحكم متجر سوشيال ميديا — العرض التجريبي"
      storeName="SMM Store Dashboard"
      storeUrl="https://demo-smm.nexiroflux.com"
      templateLink="/template/smm-store"
    />
  );
}
