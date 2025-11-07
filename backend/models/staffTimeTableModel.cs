using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class StaffTimeTableModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; } // Primary Key

        [Required]
        public int StaffId { get; set; } // Foreign Key to Staff table

        public string? SubjectName { get; set; } // Foreign Key to Subject table

        [Required]
        [StringLength(20)]
        public required string Day { get; set; } // e.g., "Monday", "Tuesday"

        [Required]
        public int Period { get; set; } // e.g., 1, 2, 3, etc.

        // Optional: Navigation properties (if you have Staff and Subject models)
        // public Staff Staff { get; set; }
        // public Subject Subject { get; set; }
    }
}
