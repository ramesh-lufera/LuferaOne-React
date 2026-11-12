import useReactApexChart from "../../hook/useReactApexChart";
import ReactApexChart from "react-apexcharts";
const BookingStatisticsOne = () => {
  let { BookingStatisticsOneSeriesOptions, BookingStatisticsOneSeries } =
    useReactApexChart();
  return (
    <div className='col-xxl-4'>
      <div className='shadow-7 p-20 radius-12 bg-base h-100'>
        <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
          <h6 className='mb-2 fw-bold text-lg'>Booking Statistic</h6>
          <div className=''>
            <select className='form-select form-select-sm w-auto bg-base border text-secondary-light radius-8 radius-8'>
              <option>Yearly</option>
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Today</option>
            </select>
          </div>
        </div>
        <div className='position-relative'>
          <div id='statisticBarChart' className='text-style'>
            <ReactApexChart
              options={BookingStatisticsOneSeriesOptions}
              series={BookingStatisticsOneSeries}
              type='bar'
              height={270}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStatisticsOne;
