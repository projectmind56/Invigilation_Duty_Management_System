using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YourNamespace.Models
{
    public class ReallocationRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AllocationId { get; set; }  // Exam allocation ID
        [Required]
        public int ExamId { get; set; }

        [Required]
        public int FromStaffId { get; set; }   // Current staff making the request

        [Required]
        public int ToStaffId { get; set; }     // Staff requested for reallocation

        [Required]
        public DateTime RequestDate { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "pending";  // pending, approved, rejected
    }
}