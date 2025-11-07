using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ReallocationRequestResponseDto
    {
        public int RequestId { get; set; }          // Reallocation request ID
        public int AllocationId { get; set; }       // Exam allocation ID
        public int ExamId { get; set; }             // Exam ID
        public string FromStaffEmail { get; set; }  // Email of the staff making the request
        public string ToStaffEmail { get; set; }    // Email of the staff requested for reallocation

        // Exam allocation details
        public string Session { get; set; }
        public int Semester { get; set; }
        public string SubjectCode { get; set; }
        public string SubjectName { get; set; }
        public string Department { get; set; }
        public string ClassName { get; set; }
        public string Branch { get; set; }
        public int Year { get; set; }
        public string AllocationStatus { get; set; }  // Status of the allocation (pending/accepted/etc.)
        public DateTime ExamDate { get; set; }

        // Request-specific info
        public string RequestStatus { get; set; }     // pending/approved/rejected
        public DateTime RequestDate { get; set; }
    }
}