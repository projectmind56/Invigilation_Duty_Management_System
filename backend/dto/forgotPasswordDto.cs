namespace backend.DTO
{
    public class UpdatePasswordRequest
    {
        public string UserId { get; set; }
        public string NewPassword { get; set; }
    }
}
