import AverageEarningsOne from "./child/AverageEarningsOne";
import MyTasks from "./child/MyTasks";
import ProjectAnalysis from "./child/ProjectAnalysis";
import ProjectsStatusOne from "./child/ProjectsStatusOne";
import TasksOverview from "./child/TasksOverview";
import TeamMembersOne from "./child/TeamMembersOne";
import TotalProjects from "./child/TotalProjects";
import WorkingScheduleOne from "./child/WorkingScheduleOne";



const DashBoardLayerFifteen = () => {
    return (
        <>
            <div className="row gy-4">
                {/* AverageEarningsOne */}
                <AverageEarningsOne />

                {/* WorkingScheduleOne */}
                <WorkingScheduleOne />

                {/* TotalProjects */}
                <TotalProjects />

                {/* MyTasks */}
                <MyTasks />

                {/* ProjectAnalysis */}
                <ProjectAnalysis />

                {/* TeamMembersOne */}
                <TeamMembersOne />

                {/* TasksOverview */}
                <TasksOverview />

                {/* ProjectsStatusOne */}
                <ProjectsStatusOne />


            </div>
        </>
    );
};

export default DashBoardLayerFifteen;