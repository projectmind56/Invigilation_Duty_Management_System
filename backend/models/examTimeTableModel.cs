using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ExamTimeTableModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int StaffId { get; set; }

        public int? ReallocatedStaffId { get; set; }

        [Required]
        public string Session { get; set; } = string.Empty;

        [Required]
        public int Semester { get; set; }

        [Required]
        public string SubjectCode { get; set; } = string.Empty;

        [Required]
        public string SubjectName { get; set; } = string.Empty;

        [Required]
        public string DepartmentName { get; set; } = string.Empty;
        [Required]
        public string ClassName { get; set; } = string.Empty;

        [Required]
        public string BranchName { get; set; } = string.Empty;

        [Required]
        public int Year { get; set; }
        [Required]
        public string Status { get; set; } = "pending";

        [Required]
        public DateTime ExamDate { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
