import useReactApexChart from "../../hook/useReactApexChart";
import ReactApexChart from "react-apexcharts";
const SemiCircleGauge = () => {
  let { SemiCircleGaugeTwoOption } = useReactApexChart();
  const series = [75];
  return (
    <div className='col-xxl-4 col-md-6'>
      <div className='shadow-7 p-24 radius-12 bg-base h-100'>
        <div className='text-center'>
          <div className='position-relative'>
            <div
              id='semiCircleGaugeTwo'
              className='big-semi-circle-gauge d-flex justify-content-center'
            >
              <ReactApexChart
                id='SemiCircleGaugeTwo'
                options={SemiCircleGaugeTwoOption}
                series={series}
                type='radialBar'
                width={400}
                height={300}
              />
            </div>

            <span className='w-90-px h-90-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center position-absolute start-50 translate-middle-x top-50'>
              <img
                src='assets/images/home-twelve/icons/home.png'
                alt='Home Icon'
              />
            </span>
          </div>
          <h3 className='mt-40 mb-0'>35</h3>
          <span className='text-neutral-800 mt-4'>Available Room Today</span>
        </div>
      </div>
    </div>
  );
};

export default SemiCircleGauge;
