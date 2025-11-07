using System.ComponentModel.DataAnnotations;

namespace backend.Dto
{
    public class StaffInfoDto
    {
        public int StaffId { get; set; }      // Added StaffId
        public string? Email { get; set; }
        public string? Department { get; set; }
        public string? ReallocationStatus { get; set; } = "available";
    }

     public class ReallocationRequestDto
    {
        public int AllocationId { get; set; }
        public int ExamId { get; set; }
        public int FromStaffId { get; set; }
        public List<int> ToStaffIds { get; set; } = new List<int>();
    }
}