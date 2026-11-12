import CountryStatusFive from "./child/CountryStatusFive";
import CustomersStatistics from "./child/CustomersStatistics";
import DailySales from "./child/DailySales";
import ProductInfoOne from "./child/ProductInfoOne";
import RecentOrders from "./child/RecentOrders";
import SalesFigure from "./child/SalesFigure";
import StockReport from "./child/StockReport";
import TopCustomersTwo from "./child/TopCustomersTwo";
import TopSellingProduct from "./child/TopSellingProduct";
import TransactionsThree from "./child/TransactionsThree";





const DashBoardLayerEighteen = () => {
    return (
        <>

            {/* ProductInfoOne */}
            <ProductInfoOne />

            <div className="row gy-4 mt-4">
                {/* TransactionsThree */}
                <TransactionsThree />

                {/* SalesFigure */}
                <SalesFigure />

                {/* RecentOrders */}
                <RecentOrders />

                {/* DailySales */}
                <DailySales />

                {/* CustomersStatistics */}
                <CustomersStatistics />

                {/* CountryStatusFive */}
                <CountryStatusFive />

                {/* TopCustomersTwo */}
                <TopCustomersTwo />

                {/* TopSellingProduct */}
                <TopSellingProduct />

                {/* StockReport */}
                <StockReport />
            </div>
        </>
    );
};

export default DashBoardLayerEighteen;