import PendingVsSolvedTickets from "./child/PendingVsSolvedTickets";
import PerformanceAgents from "./child/PerformanceAgents";
import ResponseTime from "./child/ResponseTime";
import TaskSummaryOne from "./child/TaskSummaryOne";
import TicketPriorityOne from "./child/TicketPriorityOne";
import TicketStatusOne from "./child/TicketStatusOne";
import ToDoList from "./child/ToDoList";
import TopPodcast from "./child/TopPodcast";

const DashBoardLayerThirteen = () => {
    return (
        <>
            <div className="row gy-4">
                {/* TaskSummaryOne */}
                <TaskSummaryOne />

                {/* TicketPriorityOne */}
                <TicketPriorityOne />

                {/* TicketStatusOne */}
                <TicketStatusOne />

                {/* PendingVsSolvedTickets */}
                <PendingVsSolvedTickets />

                {/* ToDoList */}
                <ToDoList />

                {/* TopPodcast */}
                <TopPodcast />

                {/* PerformanceAgents */}
                <PerformanceAgents />

                {/* ResponseTime */}
                <ResponseTime />
            </div>
        </>
    );
};

export default DashBoardLayerThirteen;