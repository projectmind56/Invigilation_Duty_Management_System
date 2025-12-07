import React, { useState } from "react";
import * as XLSX from "xlsx/dist/xlsx.full.min.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:5277";

// Excel headers (camelCase as in your file and required by API)
const REQUIRED_HEADERS = [
    "session",
    "semester",
    "subjectCode",
    "subjectName",
    "departmentName",
    "branchName",
    "year",
    "examDate",
    "staffId",
    "className"
];

function AddTimeTableViaExcel() {
    const [excelData, setExcelData] = useState([]);

    // Convert Excel serial date → yyyy-mm-dd
    const formatExcelDate = (value) => {
        if (typeof value === "number") {
            const excelEpoch = new Date(1899, 11, 30);
            const date = new Date(excelEpoch.getTime() + value * 86400000);
            return date.toISOString().split("T")[0];
        }

        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
    };

    // Convert Excel rows to API payload format
    const cleanRow = (row) => {
        return {
            staffId: Number(row.staffId),
            session: row.session,
            semester: Number(row.semester),
            subjectCode: row.subjectCode,
            subjectName: row.subjectName,
            departmentName: row.departmentName,
            branchName: row.branchName,
            className: row.className,
            year: Number(row.year),
            examDate: formatExcelDate(row.examDate)
        };
    };

    // ----------- Handle File Upload -------------
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const workbook = XLSX.read(e.target.result, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

            if (sheet.length === 0) {
                toast.error("Excel file is empty!");
                return;
            }

            const fileHeaders = Object.keys(sheet[0]);
            const missingHeaders = REQUIRED_HEADERS.filter(h => !fileHeaders.includes(h));

            if (missingHeaders.length > 0) {
                toast.error("Invalid Excel! Missing: " + missingHeaders.join(", "));
                return;
            }

            // Row validation
            for (let i = 0; i < sheet.length; i++) {
                for (let header of REQUIRED_HEADERS) {
                    if (!sheet[i][header] || sheet[i][header].toString().trim() === "") {
                        toast.error(`Row ${i + 1}: Missing value for "${header}"`);
                        return;
                    }
                }
            }

            setExcelData(sheet);
            toast.success("Excel validated successfully!");
        };

        reader.readAsBinaryString(file);
    };

    // ----------- Submit to API -------------
    const handleSubmit = async () => {
        if (excelData.length === 0) {
            toast.error("Please upload an Excel file first.");
            return;
        }

        try {
            for (let row of excelData) {
                const cleaned = cleanRow(row);

                const response = await fetch(`${API_BASE_URL}/api/Admin/addExamTimeTableAllocation`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cleaned)  // <-- FIXED (no dto wrapper)
                });

                if (!response.ok) {
                    const err = await response.text();
                    toast.error("Upload failed: " + err);
                    return;
                }
            }

            toast.success("All rows uploaded successfully!");
            setExcelData([]);

        } catch (err) {
            console.error(err);
            toast.error("Upload failed!");
        }
    };

    // -------- Cancel & Clear Data ----------
    const handleCancel = () => {
        setExcelData([]);
        toast.info("Upload cancelled.");
    };

    return (
        <div className="container-fluid mt-4">
            <ToastContainer />

            <h4 className="text-primary mb-3">Upload Exam Timetable (Excel)</h4>

            <div className="card p-3 shadow-sm">
                <label className="form-label fw-bold">Select Excel File</label>
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    className="form-control"
                    onChange={handleFileUpload}
                />

                {excelData.length > 0 && (
                    <div className="alert alert-success mt-3">
                        <strong>{excelData.length}</strong> rows loaded and validated.
                    </div>
                )}

                <div className="d-flex gap-2 mt-3">
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={excelData.length === 0}
                    >
                        Upload to Server
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={handleCancel}
                        disabled={excelData.length === 0}
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {excelData.length > 0 && (
                <div className="table-responsive mt-4">
                    <h5>Preview</h5>
                    <table className="table table-bordered table-sm">
                        <thead>
                            <tr>
                                {REQUIRED_HEADERS.map((head) => (
                                    <th key={head}>{head}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {excelData.map((row, index) => (
                                <tr key={index}>
                                    {REQUIRED_HEADERS.map((head) => (
                                        <td key={head}>{row[head]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AddTimeTableViaExcel;