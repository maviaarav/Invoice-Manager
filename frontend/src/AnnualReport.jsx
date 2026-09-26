import "./annualReport.css";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import instance from "./api/axios";


const AnnualReport = () => {
    return (
        <div className="annual-report-container">
            <h1>Annual Report</h1>
            <p>This is the annual report page.</p>
        </div>
    );
}

export default AnnualReport;