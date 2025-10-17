using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ExamTimeTableDto
    {
        [Required]
        public string Session { get; set; } = string.Empty;

        [Required]
        [Range(1, 10, ErrorMessage = "Semester must be between 1 and 10")]
        public int Semester { get; set; }

        [Required]
        public string SubjectCode { get; set; } = string.Empty;

        [Required]
        public string SubjectName { get; set; } = string.Empty;

        [Required]
        public string DepartmentName { get; set; } = string.Empty;

        [Required]
        public string BranchName { get; set; } = string.Empty;

        [Required]
        [Range(1, 5, ErrorMessage = "Year must be between 1 and 5")]
        public int Year { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime ExamDate { get; set; }
    }
}
