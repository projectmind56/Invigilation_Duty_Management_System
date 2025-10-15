namespace backend.DTOs
{
    public class StaffApprovalDto
    {
        public int StaffId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
    }
}
