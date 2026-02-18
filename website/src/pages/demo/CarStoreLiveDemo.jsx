import LiveDemoFrame from '../../components/demo/LiveDemoFrame';

export default function CarStoreLiveDemo() {
  return (
    <LiveDemoFrame
      path="/?demo=1"
      title="معرض سيارات — العرض التجريبي"
      storeName="Car Store"
      storeUrl="https://demo-car.nexiroflux.com"
      templateLink="/template/car-dealership-store"
    />
  );
}
