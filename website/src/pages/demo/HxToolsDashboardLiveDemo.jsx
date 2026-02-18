import LiveDemoFrame from '../../components/demo/LiveDemoFrame';

export default function HxToolsDashboardLiveDemo() {
  return (
    <LiveDemoFrame
      path="/admin?demo=1"
      title="لوحة تحكم متجر أدوات صيانة — العرض التجريبي"
      storeName="HX Tools Dashboard"
      storeUrl="https://demo-hx.nexiroflux.com"
      templateLink="/template/hardware-tools-store"
    />
  );
}
