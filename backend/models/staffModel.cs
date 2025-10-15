using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class StaffModel
    {
        [Key]
        public int StaffId { get; set; }          // staffid

        [Required]
        public string? Email { get; set; }         // email
        public string? Password { get; set; }      // password

        [Required]
        public string Role { get; set; } = "staff";         // role
        public string? Department { get; set; }    // department

        [Required]
        public string ApprovalStatus { get; set; } = "pending";
    }
}
