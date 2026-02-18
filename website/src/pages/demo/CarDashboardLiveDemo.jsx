import LiveDemoFrame from '../../components/demo/LiveDemoFrame';

export default function CarDashboardLiveDemo() {
  return (
    <LiveDemoFrame
      path="/admin?demo=1"
      title="لوحة تحكم معرض سيارات — العرض التجريبي"
      storeName="Car Store Dashboard"
      storeUrl="https://demo-car.nexiroflux.com"
      templateLink="/template/car-dealership-store"
    />
  );
}
